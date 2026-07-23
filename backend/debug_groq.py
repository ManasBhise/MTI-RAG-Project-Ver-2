"""Debug script to test the full RAG pipeline."""
import os
import sys

# Remove GROQ_API_KEY from env to test what happens without it
# os.environ.pop("GROQ_API_KEY", None)

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Load .env the same way config.py does
from dotenv import load_dotenv
from pathlib import Path

backend_env = Path(__file__).resolve().parent / ".env"
print(f"Loading .env from: {backend_env}")
print(f".env exists: {backend_env.exists()}")
load_dotenv(backend_env)

key = os.getenv("GROQ_API_KEY", "")
print(f"GROQ_API_KEY from env: '{key[:15]}...' (len={len(key)})")

# Now import rag config
from rag.config import GROQ_API_KEY as CONFIG_KEY
print(f"GROQ_API_KEY from config: '{CONFIG_KEY[:15]}...' (len={len(CONFIG_KEY)})")

# Test pipeline
print("\n--- Testing pipeline ---")
try:
    from rag.pipeline import ask_question
    result = ask_question("What is MTI?")
    print(f"Result: {result}")
except Exception as e:
    print(f"Exception type: {type(e).__name__}")
    print(f"Exception message: {e}")
    import traceback
    traceback.print_exc()
