import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

async def test_stream():
    from src.helper import download_embeddings, get_llm
    from src.prompts import system_prompt
    from langchain_pinecone import PineconeVectorStore
    from langchain.chains.combine_documents import create_stuff_documents_chain
    from langchain.chains import create_retrieval_chain
    from langchain_core.prompts import ChatPromptTemplate
    
    embeddings = download_embeddings()
    docsearch = PineconeVectorStore.from_existing_index(
        index_name="trishul-ai",
        embedding=embeddings
    )
    retriever = docsearch.as_retriever(search_kwargs={"k": 3})
    chatModel = get_llm(os.getenv("LLM_PROVIDER", "gemini"))
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}")
    ])
    
    qa_chain = create_stuff_documents_chain(chatModel, prompt)
    rag_chain = create_retrieval_chain(retriever, qa_chain)
    
    async for chunk in rag_chain.astream({"input": "hii"}):
        print(chunk)

if __name__ == "__main__":
    asyncio.run(test_stream())
