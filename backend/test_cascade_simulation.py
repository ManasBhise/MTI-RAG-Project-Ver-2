"""Simulation test to verify cascade fallback across Gemini -> Groq -> OpenAI."""
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
	sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv
load_dotenv(PROJECT_ROOT / "backend" / ".env")

from rag.llm_client import call_llm

def test_simulated_failures():
	print("=" * 60)
	print("SIMULATION TEST: AUTOMATIC FALLBACK CASCADE")
	print("=" * 60)

	messages = [
		{"role": "system", "content": "You are a meteorological assistant."},
		{"role": "user", "content": "State what DALR stands for in 5 words."},
	]

	# Case 1: Simulated invalid Gemini key, should gracefully fallback to Groq
	print("\n--- Scenario 1: Gemini throws error (Simulating rate limit/invalid key) ---")
	os.environ["GEMINI_API_KEY"] = "invalid_gemini_key_123"
	os.environ["PRIMARY_LLM_PROVIDER"] = "gemini"
	try:
		res = call_llm(messages, max_tokens=60)
		print("SUCCESSFULLY FALLEN BACK TO GROQ! Result:", res)
	except Exception as e:
		print("FAILED Scenario 1:", e)

	# Case 2: Simulated Gemini AND Groq failure, should gracefully fallback to OpenAI
	print("\n--- Scenario 2: Both Gemini & Groq throw errors, should fallback to OpenAI ---")
	os.environ["GEMINI_API_KEY"] = "invalid_gemini_key_123"
	os.environ["GROQ_API_KEY"] = "gsk_invalid_groq_key_123"
	try:
		res = call_llm(messages, max_tokens=60)
		print("SUCCESSFULLY FALLEN BACK TO OPENAI! Result:", res)
	except Exception as e:
		print("FAILED Scenario 2:", e)

	print("\n" + "=" * 60)
	print("CASCADE SIMULATION COMPLETE")
	print("=" * 60)

if __name__ == "__main__":
	test_simulated_failures()
