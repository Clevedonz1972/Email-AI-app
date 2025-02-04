from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import jwt
from werkzeug.security import generate_password_hash, check_password_hash

# Configuration for JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")  # Update this in production!
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter()

# In-memory mock user storage (replace with a proper database in production)
users = {}

class User(BaseModel):
    id: int
    email: str

class UserIn(BaseModel):
    email: str
    password: str

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
         expire = datetime.utcnow() + expires_delta
    else:
         expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

@router.post("/api/auth/register", status_code=201)
def register(user_in: UserIn):
    if not user_in.email or not user_in.password:
        raise HTTPException(status_code=400, detail="Missing email or password")
    if user_in.email in users:
        raise HTTPException(status_code=409, detail="Email already registered")
    user_id = len(users) + 1
    hashed_password = generate_password_hash(user_in.password)
    users[user_in.email] = {"id": user_id, "email": user_in.email, "password_hash": hashed_password}
    access_token = create_access_token(data={"sub": user_in.email})
    return {"token": access_token, "user": {"id": user_id, "email": user_in.email}}

@router.post("/api/auth/login")
def login(user_in: UserIn):
    user = users.get(user_in.email)
    if not user or not check_password_hash(user["password_hash"], user_in.password):
         raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user_in.email})
    return {"token": access_token, "user": {"id": user["id"], "email": user_in.email}}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
         raise HTTPException(status_code=401, detail="Invalid token")
    user = users.get(email)
    if user is None:
         raise HTTPException(status_code=404, detail="User not found")
    return {"id": user["id"], "email": user["email"]}

@router.get("/api/auth/verify")
def verify(current_user: dict = Depends(get_current_user)):
    return current_user 