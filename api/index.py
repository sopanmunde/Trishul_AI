import asyncio
from contextlib import asynccontextmanager
from bson import ObjectId
from fastapi import FastAPI, HTTPException, status, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
import os
import json
from bson.errors import InvalidId
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

from pinecone import Pinecone, ServerlessSpec
from src.helper import load_pdf_files, filter_to_minimal_docs, text_split, download_embeddings, get_llm
from src.prompts import *
from fastapi import APIRouter
load_dotenv()

from datetime import datetime, timedelta
from db.database import users_collection, messages_collection, conversations_collection
from models import UserCreate, UserLogin, Token, ConversationCreate, ConversationUpdate, UserUpdate
from auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token, 
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)


# route = APIRouter(prefix="/auth", tags=["auth"])
# Init global variables for RAG
embeddings = None
docsearch = None
retriever = None
rag_chain = None
current_model_index = 0

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events.
    Expensive initializations are moved here to prevent Render deployment timeouts.
    """
    global embeddings, docsearch, retriever, rag_chain, current_model_index
    
    print("INFO: Starting application initialization...")
    
    try:
        # 1. Init embeddings
        embeddings = download_embeddings()
        
        # 2. Init vector store
        index_name = "trishul-ai"
        docsearch = PineconeVectorStore.from_existing_index(
            index_name=index_name,
            embedding=embeddings
        )
        
        # 3. Init retriever
        retriever = docsearch.as_retriever(search_kwargs={"k": 3})
        
        # 4. Build initial chain
        print(f"DEBUG: Initializing RAG chain with model: {GEMINI_FALLBACK_MODELS[0]}")
        rag_chain = build_rag_chain(GEMINI_FALLBACK_MODELS[0])
        current_model_index = 0
        
        print("INFO: Application initialization complete.")
    except Exception as e:
        print(f"ERROR: Failed to initialize application: {e}")
        import traceback
        traceback.print_exc()
        # We don't raise here so the server can still start and show health check failures
    
    yield

app = FastAPI(
    title="Authentication API",
    description="Secure authentication system with JWT",
    version="1.0.0",
    lifespan=lifespan
)
# app.include_router(entry_root)
# app.include_router(auth)
FRONTEND_URL = os.getenv("FRONTEND_URL")

# CORS Configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [frontend_url]
if frontend_url != "http://localhost:3000":
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure in production
)


PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# (Initialized in lifespan)
# embeddings = download_embeddings()
# docsearch = PineconeVectorStore.from_existing_index(...)
# retriever = docsearch.as_retriever(...)

# Multi-model fallback chain — tries models in order until one succeeds.
# Only use models confirmed valid on v1beta API (used by langchain-google-genai).
# gemini-1.5-flash / gemini-1.5-pro are NOT supported on v1beta — do NOT add them.
GEMINI_FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
]
# Deduplicate while preserving order (in case GEMINI_MODEL matches a default)
seen = set()
GEMINI_FALLBACK_MODELS = [m for m in GEMINI_FALLBACK_MODELS if not (m in seen or seen.add(m))]

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}")
])

def build_rag_chain(model_name: str):
    """Build a RAG chain for the given Gemini model name."""
    llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.2, streaming=True, max_retries=2)
    qa = create_stuff_documents_chain(llm, prompt)
    return create_retrieval_chain(retriever, qa)

# (Initialized in lifespan)
# rag_chain = build_rag_chain(GEMINI_FALLBACK_MODELS[0])
# current_model_index = 0

# Request model
class QueryRequest(BaseModel):
    msg: str
    conversation_id: str | None = None

class QueryResponse(BaseModel):
    answer: str
    sources: list[str] = []


@app.get("/")
async def root():
    return {"message": "Authentication API is running", "status": "healthy"}

@app.get("/api/health")
async def health():
    return {
        "status": "healthy" if rag_chain is not None else "initializing",
        "rag_initialized": rag_chain is not None,
        "embeddings_loaded": embeddings is not None,
        "vector_store_ready": docsearch is not None
    }


@app.post("/api/register")
async def register(user: UserCreate):

    # check existing user
    if await users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    # prepare data
    user_dict = user.model_dump()

    # remove sensitive fields
    user_dict.pop("password")
    user_dict.pop("confirm_password")

    # add hashed password + timestamp
    user_dict["hashed_password"] = get_password_hash(user.password)
    user_dict["created_at"] = datetime.utcnow()

    # insert into DB
    await users_collection.insert_one(user_dict)

    return {"message": "User created successfully"}


@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    authenticated_user = await authenticate_user(user.email, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": authenticated_user["email"]}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/me")
async def get_me(current_user = Depends(get_current_user)):
    created_at = current_user.get("created_at")

    return {
        "email": current_user.get("email"),
        "username": current_user.get("username"),
        "first_name": current_user.get("first_name"),
        "last_name": current_user.get("last_name"),
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else None
    }

@app.put("/api/me")
async def update_me(user_update: UserUpdate, current_user = Depends(get_current_user)):
    update_data = {k: v for k, v in user_update.model_dump(exclude_unset=True).items() if v is not None}
    
    if not update_data:
        return {"message": "Nothing to update"}
        
    update_data["updated_at"] = datetime.utcnow()
    
    result = await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "Profile updated successfully"}

# @app.get("/api/protected")
# async def protected_route(current_user = Depends(get_current_user)):
#     return {
#         "message": f"Hello {current_user.get('username', 'User')}, you have access successfully!"
#     }

# --- CONVERSATION CRUD ---
@app.get("/api/conversations")
async def get_conversations(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    conversations = await conversations_collection.find({"user_id": user_id}).sort("updated_at", -1).to_list(1000)
    
    result = []
    for c in conversations:
        conv_id = str(c["_id"])
        c["id"] = conv_id
        if "_id" in c:
            del c["_id"]
        
        # Fetch message count and last message preview
        msg_count = await messages_collection.count_documents({"conversation_id": conv_id})
        c["messageCount"] = msg_count
        
        # Get last message for preview
        last_msgs = await messages_collection.find(
            {"conversation_id": conv_id}
        ).sort("created_at", -1).limit(1).to_list(1)
        
        if last_msgs:
            c["preview"] = last_msgs[0].get("content", "")[:120]
        else:
            c["preview"] = ""
        
        result.append(c)
    
    return result

@app.post("/api/conversations")
async def create_conversation(conv: ConversationCreate, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    conv_dict = conv.model_dump()
    conv_dict["user_id"] = user_id
    conv_dict["created_at"] = datetime.utcnow()
    conv_dict["updated_at"] = datetime.utcnow()
    
    result = await conversations_collection.insert_one(conv_dict)
    conv_dict["id"] = str(result.inserted_id)
    if "_id" in conv_dict:
        del conv_dict["_id"]
    return conv_dict

@app.put("/api/conversations/{conversation_id}") 
async def update_conversation(conversation_id: str, conv_update: ConversationUpdate, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    try:
        obj_id = ObjectId(conversation_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid conversation ID")
        
    update_data = {k: v for k, v in conv_update.model_dump(exclude_unset=True).items() if v is not None}
    if not update_data:
        return {"message": "Nothing to update"}
        
    update_data["updated_at"] = datetime.utcnow()
    
    result = await conversations_collection.update_one(
        {"_id": obj_id, "user_id": user_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    return {"message": "Conversation updated"}

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    try:
        obj_id = ObjectId(conversation_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid conversation ID")
        
    result = await conversations_collection.delete_one({"_id": obj_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    # Also delete messages
    await messages_collection.delete_many({"conversation_id": conversation_id})
    
    return {"message": "Conversation deleted"}

@app.get("/api/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    try:
        obj_id = ObjectId(conversation_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid conversation ID")
        
    conv = await conversations_collection.find_one({"_id": obj_id, "user_id": user_id})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    messages = await messages_collection.find({"conversation_id": conversation_id}).to_list(1000)
    for m in messages:
        m["id"] = str(m["_id"])
        if "_id" in m:
            del m["_id"]
        
    return messages

# Chat endpoint
# @app.post("/api/chat")
# async def chat(request: QueryRequest, current_user=Depends(get_current_user)):
#     try:
#         answer = ""
#         sources: list[str] = []

#         if request.session_id:
#             await messages_collection.insert_one({
#                 "session_id": request.session_id,
#                 "user_email": current_user["email"],
#                 "role": "user",
#                 "content": request.msg,
#                 "timestamp": datetime.utcnow(),
#             })

#         response = rag_chain.invoke({"input": request.msg})
#         answer = response.get("answer", "")
#         sources = response.get("sources", [])

#         if request.session_id:
#             await messages_collection.insert_one({
#                 "session_id": request.session_id,
#                 "user_email": current_user["email"],
#                 "role": "assistant",
#                 "content": answer,
#                 "sources": sources,
#                 "timestamp": datetime.utcnow(),
#             })

#         return JSONResponse(content={"answer": answer, "sources": sources})
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/api/chat")
async def chat(request: QueryRequest, current_user=Depends(get_current_user)):
    global rag_chain, current_model_index
    
    if rag_chain is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="AI system is still initializing. Please wait a few seconds and try again."
        )
        
    user_id = str(current_user["_id"])
    
    if request.conversation_id:
        await messages_collection.insert_one({
            "conversation_id": request.conversation_id,
            "user_id": user_id,
            "role": "user",
            "content": request.msg,
            "created_at": datetime.utcnow(),
        })

    async def generate():
        global rag_chain, current_model_index
        full_answer = ""
        sources = []
        model_attempts = 0

        while model_attempts <= len(GEMINI_FALLBACK_MODELS):
            full_answer = ""
            sources = []
            try:
                async for chunk in rag_chain.astream({"input": request.msg}):
                    if "answer" in chunk:
                        text_chunk = chunk["answer"]
                        full_answer += text_chunk
                        yield f"data: {json.dumps({'text': text_chunk})}\n\n"
                    if "context" in chunk:
                        sources = [{"page_content": doc.page_content, "metadata": doc.metadata} for doc in chunk["context"]]

                # Save assistant message after streaming completes
                if request.conversation_id:
                    await messages_collection.insert_one({
                        "conversation_id": request.conversation_id,
                        "user_id": user_id,
                        "role": "assistant",
                        "content": full_answer,
                        "sources": sources,
                        "created_at": datetime.utcnow(),
                    })
                    try:
                        obj_id = ObjectId(request.conversation_id)
                        await conversations_collection.update_one(
                            {"_id": obj_id},
                            {"$set": {"updated_at": datetime.utcnow()}}
                        )
                    except InvalidId:
                        pass

                yield f"data: {json.dumps({'done': True, 'sources': sources})}\n\n"
                return  # Success — exit the retry loop

            except Exception as e:
                import traceback
                error_msg = str(e)
                is_quota_error = "429" in error_msg or "ResourceExhausted" in error_msg or "quota" in error_msg.lower()
                is_not_found = "404" in error_msg or "not found" in error_msg.lower()

                if (is_quota_error or is_not_found) and current_model_index < len(GEMINI_FALLBACK_MODELS) - 1:
                    # Try next model in the fallback chain
                    current_model_index += 1
                    next_model = GEMINI_FALLBACK_MODELS[current_model_index]
                    print(f"Model quota/error ({GEMINI_FALLBACK_MODELS[current_model_index - 1]}), switching to: {next_model}")
                    rag_chain = build_rag_chain(next_model)
                    model_attempts += 1
                    continue  # Retry with new model
                else:
                    # All models exhausted or non-quota error
                    traceback.print_exc()
                    if is_quota_error:
                        friendly_msg = "⚠️ All AI models have exhausted their free-tier quota for today. Quota resets daily — please try again tomorrow, or upgrade your Google AI Studio plan."
                    elif is_not_found:
                        friendly_msg = "⚠️ The AI model is temporarily unavailable. Please try again shortly."
                    elif "503" in error_msg or "Service Unavailable" in error_msg:
                        friendly_msg = "⚠️ The AI model is experiencing high demand. Please try again in a few moments."
                    else:
                        friendly_msg = f"An error occurred: {error_msg}"
                    yield f"data: {json.dumps({'error': friendly_msg})}\n\n"
                    return

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    import tempfile
    import os
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    
    if docsearch is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="Vector store is still initializing. Please wait a few seconds and try again."
        )
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported currently")
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
        
    try:
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        user_id = str(current_user["_id"])
        for split in splits:
            split.metadata["user_id"] = user_id
            split.metadata["filename"] = file.filename
            
        docsearch.add_documents(splits)
        
        return {"message": "Document processed and indexed successfully", "chunks": len(splits)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "index:app"
        )
