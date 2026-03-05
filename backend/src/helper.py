from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings

def load_pdf_files(data):
    # Load PDF files from the specified directory
    loader = DirectoryLoader(data, glob="*.pdf", show_progress=True)
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


def download_embeddings():
    """
    Download and return HuggingFaceEmbeddings model.
    """
    model_name = "sentence-transformers/all-MiniLM-L12-v2"
    embeddings = HuggingFaceEmbeddings(
        model_name=model_name,
       
    )
    return embeddings