import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv(Path(__file__).resolve().parent / ".env")
from fastapi.middleware.cors import CORSMiddleware

try:
	from .auth import router as auth_router
	from .chat import router as chat_router
	from .database import Base, engine
except ImportError:
	from auth import router as auth_router
	from chat import router as chat_router
	from database import Base, engine


app = FastAPI(title="MTI Knowledge Assistant API", version="1.0.0")

frontend_origins = os.getenv(
	"FRONTEND_ORIGINS",
	"http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174",
)
allowed_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

app.add_middleware(
	CORSMiddleware,
	allow_origins=allowed_origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
	Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(chat_router)


@app.get("/health")
def health():
	return {"status": "ok"}
