from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database for users
users_db = [
    {"username": "ROOT_ADMIN", "password": "mentor@2026", "email": "admin@mentor.ai", "full_name": "System Admin"},
    {"username": "admin@gmail.com", "password": "admin@123", "email": "admin@gmail.com", "full_name": "John Doe"}
]

class LoginRequest(BaseModel):
    username: str
    password: str

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str = "New User"

@app.get("/")
def read_root():
    return {"status": "CLEARED", "message": "AI Financial Mentor Backend Active"}

@app.post("/signup")
def signup(data: SignupRequest):
    # Check if user already exists
    if any(u["username"] == data.username for u in users_db):
        raise HTTPException(status_code=400, detail="Username already exists")
    if any(u["email"] == data.email for u in users_db):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    users_db.append({
        "username": data.username,
        "password": data.password,
        "email": data.email,
        "full_name": data.full_name
    })
    return {"status": "success", "message": "User registered successfully"}

@app.post("/login")
def login(data: LoginRequest):
    # Find user in mock DB
    user = next((u for u in users_db if u["username"] == data.username or u["email"] == data.username), None)
    
    if user and user["password"] == data.password:
        first_name = user.get("full_name", "User").split()[0]
        return {
            "status": "success", 
            "username": user["username"], 
            "first_name": first_name,
            "message": "Login successful"
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials. Try 'ROOT_ADMIN' / 'mentor@2026'")

class ChatRequest(BaseModel):
    message: str
    user_name: str = "User"

try:
    from langchain_groq import ChatGroq
    llm = ChatGroq(
        temperature=0,
        groq_api_key="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",
        model="llama-3.1-8b-instant"
    )
except ImportError:
    llm = None

@app.post("/api/mentor/chat")
def chat_with_mentor(req: ChatRequest):
    if not llm:
        raise HTTPException(status_code=500, detail="LLM not configured. Please install langchain-groq.")
    try:
        # Personalize the prompt with the user's name
        prompt = f"The user's name is {req.user_name}. As their AI Financial Mentor, respond to: {req.message}. Be concise, professional, and personal."
        response = llm.invoke(prompt)
        return {"status": "success", "reply": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
