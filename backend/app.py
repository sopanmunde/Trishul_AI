from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from src.helper import download_embeddings
from pinecone import Pinecone

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Trishul AI Medical Assistant", description="RAG-based medical Q&A system")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    sources: list[str] = []

# Global variables for the RAG chain
rag_chain = None
retriever = None

def initialize_rag_chain():
    """Initialize the RAG chain with Pinecone and Gemini"""
    global rag_chain, retriever

    try:
        # Get API keys
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        gemini_api_key = os.getenv("GEMINI_API_KEY")

        if not pinecone_api_key or not gemini_api_key:
            raise ValueError("Missing API keys. Please check your .env file.")

        # Set environment variables
        os.environ["PINECONE_API_KEY"] = pinecone_api_key
        os.environ["GEMINI_API_KEY"] = gemini_api_key

        # Initialize Pinecone
        pc = Pinecone(api_key=pinecone_api_key)
        index_name = "trishul-ai"

        # Check if index exists
        if not pc.has_index(index_name):
            raise ValueError(f"Pinecone index '{index_name}' does not exist. Please run store_index.py first.")

        # Initialize embeddings
        embedding = download_embeddings()

        # Load existing vector store
        docsearch = PineconeVectorStore.from_existing_index(
            index_name=index_name,
            embedding=embedding,
        )

        # Create retriever
        retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

        # Initialize chat model
        chat_model = ChatGoogleGenerativeAI(model="gemini-1.5-flash")  # Using stable model

        # Create the prompt template
        system_prompt = (
            "You are a Medical assistant for question answering tasks. "
            "Use the following pieces of retrieved context to answer "
            "the question. If you don't know the answer, say that you "
            "don't know. Use three sentences maximum and keep the "
            "answer concise."
            "\n\n"
            "{context}"
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])

        # Create the chains
        question_answer_chain = create_stuff_documents_chain(chat_model, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)

        print("RAG chain initialized successfully!")

    except Exception as e:
        print(f"Error initializing RAG chain: {str(e)}")
        raise

# Initialize on startup
@app.on_event("startup")
async def startup_event():
    initialize_rag_chain()

@app.get("/")
async def root():
    return {"message": "Trishul AI Medical Assistant API", "status": "running"}

@app.get("/health")
async def health_check():
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="RAG chain not initialized")
    return {"status": "healthy"}

@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="RAG chain not initialized")

    try:
        # Invoke the RAG chain
        response = rag_chain.invoke({"input": request.question})

        # Extract sources from retrieved documents
        sources = []
        if "context" in response:
            for doc in response["context"]:
                if hasattr(doc, 'metadata') and 'source' in doc.metadata:
                    sources.append(doc.metadata['source'])

        return QueryResponse(
            answer=response.get("answer", "I couldn't generate an answer."),
            sources=sources
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
