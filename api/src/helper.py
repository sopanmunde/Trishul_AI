from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader, UnstructuredPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from langchain_core.documents import Document
import os

def get_llm(provider: str = "gemini"):
    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model="gpt-4o", temperature=0.2, streaming=True)
    elif provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        # Use gemini-2.0-flash-lite as primary (higher free-tier quota)
        # Fall back to gemini-1.5-flash if needed
        model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        return ChatGoogleGenerativeAI(model=model, temperature=0.2, streaming=True, max_retries=3)
    else:
        raise ValueError(f"Unknown provider: {provider}")

def load_pdf_files(data):
    # Load PDF files from the specified directory
    loader = DirectoryLoader(data, glob="*.pdf", show_progress=True, loader_cls=UnstructuredPDFLoader)
    documents = loader.load()
    # Split the documents into smaller chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    split_documents = text_splitter.split_documents(documents)
    return split_documents



def filter_to_minimal_docs(docs: List[Document]) -> List[Document]:
    """Given a list of documents objects, return a list of documents with only the source metadata.
    """
    minimal_docs: List[Document] = []
    for doc in docs:
        src = doc.metadata.get("source")
        minimal_docs.append(Document(
            page_content=doc.page_content,
            metadata={"source": src}
        ))
    return minimal_docs




def text_split(minimal_docs):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200,
        length_function=len
        )
    texts_chunk= text_splitter.split_documents(minimal_docs)
    return texts_chunk


def download_embeddings(provider: str = "huggingface"):
    """
    Download and return embeddings model based on provider.
    """
    if provider == "huggingface":
        from langchain_huggingface import HuggingFaceEmbeddings
        model_name = "sentence-transformers/all-MiniLM-L12-v2"
        embeddings = HuggingFaceEmbeddings(
            model_name=model_name
        )
    elif provider == "gemini":
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    else:
        raise ValueError(f"Unknown embeddings provider: {provider}")
    
    return embeddings