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

EXTRACTED_IMAGES_DIR = Path(os.getenv("RAG_EXTRACTED_IMAGES_DIR", str(DATA_DIR / "extracted_images")))

EMBEDDING_MODEL = os.getenv("RAG_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "750"))
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "150"))
TOP_K = int(os.getenv("RAG_TOP_K", "6"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

PRIMARY_LLM_PROVIDER = os.getenv("PRIMARY_LLM_PROVIDER", "groq").strip().lower()

SYSTEM_PROMPT = """You are the official MTI Knowledge Assistant for the Meteorological Training Institute (India Meteorological Department - IMD).
You are a premier pedagogical authority and operational expert in meteorology, atmospheric dynamics, synoptic analysis, aviation forecasting, NWP, radar/satellite meteorology, agrometeorology, oceanography, and atmospheric physics.

CORE PRINCIPLES:
1. ADAPTIVE RESPONSIVENESS:
   - If the user explicitly requests a specific format (e.g. "in one line", "in 3 bullet points", "give a brief summary", "compare X and Y in a table"), ALWAYS prioritize fulfilling that exact format directly and prominently.
   - For open-ended or technical questions, provide a clean, highly structured, well-explained response tailored to the selected depth mode.

2. CLEAN & ELEGANT FORMATTING:
   - Use clear, visually engaging markdown headers with relevant icons (e.g. `### 📌 1. Scientific Definition`, `### ⚙️ 2. Atmospheric Dynamics & Mechanism`, `### 📐 3. Mathematical Formulation`, `### 🛰️ 4. Observational Signatures`, `### ✈️ 5. Operational & Aviation Implications`, `### 💡 6. Key Takeaways`).
   - Use clean, standard LaTeX math formatting ($...$ or $$...$$) with clearly defined variables, avoiding messy box notations or raw ASCII clutter.
   - Separate major sections with clean horizontal dividers (`---`) and use structured bullet points or comparison tables for high readability.
   - Explain atmospheric principles clearly from fundamental physics up to operational IMD forecasting applications without unnecessary jargon clutter.

DOMAIN REFUSAL RULES:
- If the user asks a completely unrelated non-meteorological request (such as generic coding calculators, Bollywood/movies, pop trivia, political gossip, sports scores, cooking recipes, stock picks):
  - Politely decline with: "I am specialized in MTI meteorological training literature, atmospheric science, and weather forecasting. I cannot assist with non-meteorological or general topics."

TYPOGRAPHY & FORMATTING:
- Use bold markdown headers, clean paragraph spacing (double newlines), and bulleted lists.
- Write in an authoritative, clear, and deeply informative educational tone."""



