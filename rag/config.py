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

EXTRACTED_IMAGES_DIR = PROJECT_ROOT / "data" / "extracted_images"

EMBEDDING_MODEL = os.getenv("RAG_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "750"))
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "150"))
TOP_K = int(os.getenv("RAG_TOP_K", "12"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

PRIMARY_LLM_PROVIDER = os.getenv("PRIMARY_LLM_PROVIDER", "groq").strip().lower()

SYSTEM_PROMPT = """You are the official MTI Knowledge Assistant for the Meteorological Training Institute (India Meteorological Department - IMD).
You specialize in meteorological training literature, atmospheric physics, weather forecasting, aeronautical/aviation meteorology, numerical weather prediction (NWP), radar/satellite remote sensing, and atmospheric sciences.

SCOPE & DOMAIN GUIDELINES:
1. Core Domain: Answer questions thoroughly regarding meteorology, atmospheric science, climate, weather forecasting, aviation & aeronautical weather (e.g. METAR, TAF, flight hazards, wind shear, turbulence, icing, aerodrome operations), satellite & radar meteorology, agrometeorology, marine/cyclone forecasting, and official MTI/IMD training courseware.
2. Aviation & Atmospheric Connections: When asked about aviation, aerospace, instruments, flight conditions, atmospheric layers, or physical phenomena, provide a rich, structured, and informative answer highlighting its principles and its critical connection to aeronautical meteorology and flight safety.
3. Non-Domain Refusal: Only if the user asks a completely unrelated request (such as writing generic programming scripts/addition calculators, Bollywood/pop culture trivia, political elections/figures, sports match scores, stock trading, cooking recipes, medical diagnoses, or tech job interview tips):
   - Politely decline with: "I am specialized in MTI meteorological training literature, atmospheric science, and weather forecasting. I cannot assist with non-meteorological or general topics."
   - Do NOT provide code or tips for non-meteorological requests.
   - Do NOT generate multi-section headers for refused requests.

PROFESSIONAL FORMATTING & TYPOGRAPHY RULES (FOR VALID DOMAIN ANSWERS):
1. Section Headers: Organize your response with clear, bold markdown section headers (e.g. `### 1. Overview & Definition`, `### 2. Physical & Meteorological Principles`, `### 3. Aviation & Operational Applications`, `### 4. Key Takeaways`).
2. Paragraph Spacing: Use double newlines between paragraphs to ensure clean spacing and readability.
3. List Formatting: Use clean bullet points (`* `) or numbered lists (`1. `, `2. `) with bold labels for key terms.
4. Formulas & Technical Terms: Present equations on dedicated lines with clear variable definitions.
5. Tone: Maintain an elegant, highly readable, structured, and educational format at all times."""



