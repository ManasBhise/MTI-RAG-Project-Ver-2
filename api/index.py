import sys
from pathlib import Path

# Ensure project root is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
	sys.path.insert(0, str(ROOT_DIR))

import os

os.environ.setdefault("GROQ_MODEL", "llama-3.3-70b-versatile")
os.environ.setdefault("RAG_PIPELINE_MODULE", "rag.pipeline")
os.environ.setdefault("RAG_PIPELINE_FUNCTION", "ask_question")

from backend.main import app

# Export FastAPI app for Vercel Serverless Functions
__all__ = ["app"]
