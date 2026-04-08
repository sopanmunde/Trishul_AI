from pydantic import BaseModel, EmailStr, constr, model_validator
from typing import Optional
from datetime import datetime


class User(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    password: str
    created_at: datetime = datetime.utcnow()


class UserInDB(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    hashed_password: str
    created_at: datetime


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    password: constr(max_length=72) # type: ignore
    confirm_password: str

    @model_validator(mode="after")
    def check_passwords(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None