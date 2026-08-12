"""Test script to verify Google Gemini integration and multi-provider fallback cascade."""
import os
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
	sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv
load_dotenv(PROJECT_ROOT / "backend" / ".env")
load_dotenv(PROJECT_ROOT / ".env")

from rag.llm_client import call_llm
from rag.pipeline import ask_question

def test_fallback_cascade():
	print("=" * 60)
	print("TESTING MULTI-PROVIDER LLM FALLBACK CASCADE")
	print("=" * 60)

	gemini_key = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()
	groq_key = os.getenv("GROQ_API_KEY", "").strip()
	openai_key = os.getenv("OPENAI_API_KEY", "").strip()

	print(f"1. GEMINI_API_KEY configured: {'YES (len=' + str(len(gemini_key)) + ')' if gemini_key else 'NO (Empty)'}")
	print(f"2. GROQ_API_KEY configured:   {'YES (len=' + str(len(groq_key)) + ')' if groq_key else 'NO (Empty)'}")
	print(f"3. OPENAI_API_KEY configured: {'YES (len=' + str(len(openai_key)) + ')' if openai_key else 'NO (Empty)'}")
	print("-" * 60)

	messages = [
		{"role": "system", "content": "You are a meteorological assistant."},
		{"role": "user", "content": "Briefly state what METAR stands for in 1 sentence."},
	]

	print("\n--- Test 1: Direct LLM Call (Dynamic Fallback Cascade) ---")
	try:
		response = call_llm(messages, max_tokens=100)
		print("SUCCESS! Output:\n", response)
	except Exception as e:
		print("FAILED:", e)

	print("\n--- Test 2: Full RAG Pipeline Call ---")
	try:
		res = ask_question("What is Dry Adiabatic Lapse Rate?", mode="concise")
		print("RAG Answer Length:", len(res.get("answer", "")))
		print("Sources retrieved:", res.get("sources", []))
		print("Preview snippet:", res.get("answer", "")[:200], "...")
	except Exception as e:
		print("RAG Call Error:", e)

	print("\n" + "=" * 60)
	print("TEST COMPLETE")
	print("=" * 60)

if __name__ == "__main__":
	test_fallback_cascade()
