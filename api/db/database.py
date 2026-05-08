from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pymongo import IndexModel, ASCENDING, DESCENDING
from typing import Optional

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "auth_db")

client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

# Collection
users_collection = database["users"]
messages_collection = database["messages"]
conversations_collection = database["conversations"]

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None

db = Database()

async def connect_to_mongo():
    """Connect to MongoDB"""
    db.client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db.db = db.client[os.getenv("DATABASE_NAME")]
    
    # Create indexes for better performance
    await db.db.conversations.create_indexes([
        IndexModel([("user_id", ASCENDING), ("updated_at", DESCENDING)]),
        IndexModel([("user_id", ASCENDING), ("pinned", ASCENDING)]),
        IndexModel([("user_id", ASCENDING), ("folder", ASCENDING)])
    ])
    
    await db.db.messages.create_indexes([
        IndexModel([("conversation_id", ASCENDING), ("created_at", ASCENDING)]),
        IndexModel([("conversation_id", ASCENDING), ("role", ASCENDING)])
    ])
    
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")