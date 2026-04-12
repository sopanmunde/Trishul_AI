# 🩺 Trishul-AI Medical Chatbot

An AI-powered medical chatbot built using **Retrieval-Augmented Generation (RAG)** that provides context-aware, non-diagnostic responses by retrieving relevant medical information from a vector database.

---

## 🚀 Overview

Trishul-AI is designed to assist users with general medical queries by combining **semantic search** and **Large Language Models (LLMs)**.  
The system retrieves relevant medical documents and generates safe, contextual responses.

---

## 🎯 Problem Statement

Accessing reliable medical information quickly can be challenging.  
This project aims to provide **accurate, context-aware, and safe responses** using AI without replacing professional medical advice.

---

## ✨ Features

- 🔍 Retrieval-Augmented Generation (RAG)
- 🧠 Semantic search using vector embeddings
- ⚡ FastAPI backend for real-time AI inference
- 💬 Context-aware chatbot responses
- 🔐 Authentication-enabled frontend (Next.js)
- 📊 Handles large-scale medical document datasets
- ⚠️ Built-in medical disclaimers for safe usage

---

# Chatbot UI
![img](frontend/public/ai-assist.png)
![img](frontend/public/chatbot-ui.png)
![watch Demo](https://www.linkedin.com/feed/update/urn:li:activity:7447968949478010880/?originTrackingId=MrGLC7OopkAH3czlEiPsLg%3D%3D)


## 🛠️ Tech Stack

### AI / ML
- LangChain
- Google Gemini
- NLP techniques
- RAG techniuies

### Backend
- FastAPI
- Python

### Frontend
- Next.js
- JWT Authentication

### Database
- Pinecone (Vector Database)
- MongoDB

### Tools
- Pandas, NumPy
- Git, GitHub

---

## 🧠 System Architecture

The system follows a **Retrieval-Augmented Generation (RAG)** pipeline combining semantic search with LLM-based response generation.

### 🔄 Architecture Flow
```bash
User Query  
↓  
Frontend (Next.js UI)  
↓  
FastAPI Backend (API Layer)  
↓  
LangChain Orchestrator  
↓  
Embedding Model (Text → Vector)  
↓  
Pinecone Vector Database (Similarity Search)  
↓  
Top-K Relevant Documents Retrieved  
↓  
LLM (OpenAI / LLaMA)  
↓  
Context-Aware Response Generation  
↓  
Response Sent to User  
```
---

## Architecture Diagram

![img]("frontend/public/architecture.png" width="300" height="200")

## 📊 Data

- 📄 3,000+ medical documents
- Sources: publicly available medical articles and guidelines
- Preprocessing:
  - Text cleaning
  - Tokenization
  - Chunking
  - Embedding generation

---

## ⚡ Performance Metrics

- 🎯 Retrieval Accuracy: ~85%  
- ⏱️ API Response Latency: <2 seconds  
- 👥 Tested with: 50+ users  
- 📈 Optimized vector search for faster retrieval  

---

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/sopanmunde/Trishul_AI.git
cd trishul_ai

```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Environment Varibles

```bash
GEMINI_API_KEY=your_api_key
PINECONE_API_KEY=your_api_key
MONGODB_URL=your_monogodb_connection_url
DATABASE_NAME=your_database_name
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=minutes
```
### Run Backend Server

```bash
python main.py
```
Backend run at:

       http://localhost:8000

### Frontend

```bash
cd frontend

```
### Environment Varibles
```bash
NEXT_PUBLIC_API_BASE_URL=your_backend_url
```

##  Run Frontend

```bash
bun dev
```


Author
Sopan Munde
E-mail: sopanmunde5@gmail.com
Portfolio: https://my-portfolio-liard-xi-19.vercel.app/
