import os
import sys
from pathlib import Path

# Ensure project root and backend directory are in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
for p in (PROJECT_ROOT, BACKEND_DIR):
	if str(p) not in sys.path:
		sys.path.insert(0, str(p))

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv(BACKEND_DIR / ".env")
load_dotenv(PROJECT_ROOT / ".env")

try:
	from backend.auth import router as auth_router
	from backend.chat import router as chat_router
	from backend.documents import router as documents_router
	from backend.database import Base, engine
except ImportError:
	try:
		from .auth import router as auth_router
		from .chat import router as chat_router
		from .documents import router as documents_router
		from .database import Base, engine
	except ImportError:
		from auth import router as auth_router
		from chat import router as chat_router
		from documents import router as documents_router
		from database import Base, engine


app = FastAPI(title="MTI Knowledge Assistant API", version="1.0.0")

frontend_origins = os.getenv(
	"FRONTEND_ORIGINS",
	"http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,*",
)
allowed_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"] if "*" in allowed_origins else allowed_origins,
	allow_origin_regex=r"https://.*\.vercel\.app",
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
	Base.metadata.create_all(bind=engine)
	try:
		with engine.begin() as conn:
			from sqlalchemy import text
			result = conn.execute(text("PRAGMA table_info(users)"))
			cols = [row[1] for row in result.fetchall()]
			if "google_id" not in cols:
				conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"))
			if "role" not in cols:
				conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(120)"))
			if "organization" not in cols:
				conn.execute(text("ALTER TABLE users ADD COLUMN organization VARCHAR(150)"))
			if "response_tone" not in cols:
				conn.execute(text("ALTER TABLE users ADD COLUMN response_tone VARCHAR(50)"))
			if "custom_instructions" not in cols:
				conn.execute(text("ALTER TABLE users ADD COLUMN custom_instructions TEXT"))
			if "use_emojis" not in cols:
				conn.execute(text("ALTER TABLE users ADD COLUMN use_emojis BOOLEAN DEFAULT 1"))

			result_chat = conn.execute(text("PRAGMA table_info(chat_history)"))
			chat_cols = [row[1] for row in result_chat.fetchall()]
			if "thread_id" not in chat_cols:
				conn.execute(text("ALTER TABLE chat_history ADD COLUMN thread_id VARCHAR(50)"))
	except Exception as e:
		print(f"Startup migration warning: {e}")

	# Pre-warm vector store and embeddings model in local mode (skip on Vercel serverless for instant response speed)
	if not os.getenv("VERCEL"):
		import threading

		def _warmup():
			try:
				from rag.pipeline import _load_vector_store
				_load_vector_store()
				print("Vector store & embeddings pre-warmed successfully.")
			except Exception as e:
				print(f"Vector store warmup warning: {e}")

		threading.Thread(target=_warmup, daemon=True).start()


try:
	from rag.config import EXTRACTED_IMAGES_DIR
except ImportError:
	EXTRACTED_IMAGES_DIR = PROJECT_ROOT / "data" / "extracted_images"

EXTRACTED_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static/extracted_images", StaticFiles(directory=str(EXTRACTED_IMAGES_DIR)), name="extracted_images")

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(documents_router)


@app.get("/health")
def health():
	return {"status": "ok"}
