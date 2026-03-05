#!/usr/bin/env python3
"""
Script to run the Trishul AI backend FastAPI server.
"""

import uvicorn
import os
import sys

# Add the current directory to Python path so we can import from src
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    print("Starting Trishul AI Backend Server...")
    print("Make sure your .env file has valid PINECONE_API_KEY and GEMINI_API_KEY")
    print("API will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )