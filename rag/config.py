import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

# Load environment variables from backend/.env or root .env
load_dotenv(PROJECT_ROOT / "backend" / ".env")
load_dotenv(PROJECT_ROOT / ".env")


data_dir_env = os.getenv("RAG_DATA_DIR")
DATA_DIR = Path(data_dir_env) if data_dir_env else PROJECT_ROOT / "data"

vector_store_env = os.getenv("RAG_VECTOR_STORE_DIR")
VECTOR_STORE_DIR = Path(vector_store_env) if vector_store_env else PROJECT_ROOT / "rag" / "store"

EMBEDDING_MODEL = os.getenv("RAG_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "750"))
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "150"))
TOP_K = int(os.getenv("RAG_TOP_K", "12"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

SYSTEM_PROMPT = """You are the official MTI Knowledge Assistant for the Meteorological Training Institute (India Meteorological Department).
Your scope is strictly focused on meteorology, atmospheric science, weather forecasting, numerical weather prediction (NWP), and MTI training literature.

STRICT ACCURACY & ANTI-HALLUCINATION RULES:
1. Grounding Rule: Rely PRIMARILY on the provided MTI context. If the provided context is irrelevant or does not contain sufficient facts to answer the question, state clearly: "I could not find relevant information in the MTI training materials to answer this question."
2. Out-of-Domain Rule: If the user asks a question completely unrelated to meteorology, weather, or MTI training (e.g., general trivia, politics, pop culture, non-meteorological questions like 'Who is the president of USA?'), state clearly: "I am specialized in MTI meteorological training literature and do not have information regarding non-meteorological topics."
3. Do NOT attempt to answer out-of-domain or non-meteorological questions using unrelated document snippets.
4. Do NOT hallucinate or fabricate facts, figures, or document references.
5. Keep your answer factual, concise, educational, and directly focused on the user's query.
6. Do not include inline source citations or bracketed references (such as Source[1], source[2], [1], [Source 3], etc.) in your response text."""

