# app/routes.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models import fake_users_db
from app.auth import create_access_token

router = APIRouter()

# Request model for login
class LoginRequest(BaseModel):
    username: str
    password: str

# Login route
@router.post("/login")
def login(request: LoginRequest):
    user = fake_users_db.get(request.username)

    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": user["username"], "role": user["role"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"]
    }
