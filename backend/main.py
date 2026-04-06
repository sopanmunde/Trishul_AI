from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os

from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

from pinecone import Pinecone, ServerlessSpec
from src.helper import load_pdf_files, filter_to_minimal_docs, text_split, download_embeddings
# from store_index import docsearch
from src.prompts import *
from fastapi import APIRouter
# from routes.entry import entry_root

# from db.config.db_config import users_collection
load_dotenv()

from datetime import datetime, timedelta
from db.database import users_collection
from models import UserCreate, UserLogin, Token
from auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token, 
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)


# route = APIRouter(prefix="/auth", tags=["auth"])
app = FastAPI(
    title="Authentication API",
    description="Secure authentication system with JWT",
    version="1.0.0",
    # lifespan=lifespan
)
# app.include_router(entry_root)
# app.include_router(auth)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure in production
)

# @app.post("/signup")
# def signup(user: UserCreate):
#     return {"msg": "user created"}

# @app.post("/login", response_model=Token)
# def login(user: UserLogin):

#     return {"access_token": "abc123", "token_type": "bearer"}



# Include routers

@app.post("/api/register", response_model=dict)
async def register(user: UserCreate):
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )


    # Create new user
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow()
    del user_dict["password"]
    
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

# @app.get("/api/me")
# async def get_me(current_user = Depends(get_current_user)):
#     return {
#         "email": current_user["email"],
#         "username": current_user["username"],
#         "created_at": current_user["created_at"].isoformat() if current_user["created_at"] else None
#     }

@app.get("/api/me")
async def get_me(current_user = Depends(get_current_user)):
    created_at = current_user.get("created_at")

    return {
        "email": current_user.get("email"),
        "username": current_user.get("username"),
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else None
    }

# @app.get("/api/protected")
# async def protected_route(current_user = Depends(get_current_user)):
#     return {"message": f"Hello {current_user['username']}, you have access to this protected route!"}

@app.get("/api/protected")
async def protected_route(current_user = Depends(get_current_user)):
    return {
        "message": f"Hello {current_user.get('username', 'User')}, you have access successfully!"
    }


@app.get("/")
async def root():
    return {"message": "Authentication API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}



# API Keys

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY

# Init embeddings + vector store
embeddings = download_embeddings()

index_name = "trishul-ai"

docsearch = PineconeVectorStore.from_existing_index(
    index_name=index_name,
    embedding=embeddings
)

retriever = docsearch.as_retriever(search_kwargs={"k": 3})

# LLM
chatModel = ChatGoogleGenerativeAI(model="gemini-3-flash-preview")

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}")
])

qa_chain = create_stuff_documents_chain(chatModel, prompt)
rag_chain = create_retrieval_chain(retriever, qa_chain)

# Request model
class QueryRequest(BaseModel):
    msg: str

class QueryResponse(BaseModel):
    answer: str
    sources: list[str] = []

@app.get("/", response_class=JSONResponse)
async def index():
    return "<h2>Medical Chatbot API Running</h2>"

# Chat endpoint
@app.post("/chat")
async def chat(request: QueryRequest):
    try:
        response = rag_chain.invoke({"input": request.msg})
        return JSONResponse(content={
            "answer": response["answer"]
        })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        )







# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """Handle startup and shutdown events"""
#     # Startup
#     await connect_to_mongo()
#     yield
#     # Shutdown
#     await close_mongo_connection()

# Create FastAPI app
# app = FastAPI(
#     title="Authentication API",
#     description="Secure authentication system with JWT",
#     version="1.0.0",
#     lifespan=lifespan
# )

# Rate limiting



