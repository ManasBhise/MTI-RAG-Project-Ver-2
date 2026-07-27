import importlib
import logging
import os
import sys
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
	sys.path.insert(0, str(PROJECT_ROOT))

logger = logging.getLogger(__name__)


def _normalize_result(result: Any) -> dict:
	if isinstance(result, dict):
		answer = str(result.get("answer", "")).strip()
		sources = result.get("sources", []) or []
		images = result.get("images", []) or []
		if isinstance(sources, list):
			normalized_sources = [str(item) for item in sources]
		else:
			normalized_sources = [str(sources)]

		return {
			"answer": answer or "No answer generated.",
			"sources": normalized_sources,
			"images": images,
		}

	return {
		"answer": str(result).strip() or "No answer generated.",
		"sources": [],
		"images": [],
	}


def _fallback_llm_answer(question: str, user_profile: dict | None = None) -> dict | None:
	"""Fallback LLM answer generator when full local vector store pipeline is unavailable."""
	groq_key = os.getenv("GROQ_API_KEY", "")
	if not groq_key:
		return None

	try:
		from groq import Groq
		client = Groq(api_key=groq_key)
		groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

		system_prompt = (
			"You are the official MTI Knowledge Assistant for the Meteorological Training Institute (India Meteorological Department).\n"
			"Your scope is strictly focused on meteorology, atmospheric science, weather forecasting, numerical weather prediction (NWP), and MTI training literature.\n"
			"Provide a clear, highly structured, and comprehensive meteorological response adhering to official IMD standards.\n"
			"Organize your answer into distinct sections with bold headers (e.g. ### 1. Overview & Definition, ### 2. Physical & Meteorological Principles, ### 3. NWP & Operational Applications, ### 4. Key Takeaways)."
		)

		messages = [
			{"role": "system", "content": system_prompt},
			{"role": "user", "content": question.strip()},
		]

		completion = client.chat.completions.create(
			model=groq_model,
			messages=messages,
			temperature=0.2,
			max_tokens=1500,
		)
		answer_text = completion.choices[0].message.content.strip()

		return {
			"answer": answer_text,
			"sources": ["MTI Meteorological Assistant (Cloud Synthesis Mode)"],
			"images": [],
		}
	except Exception as exc:
		logger.exception("Fallback LLM answer generation failed: %s", exc)
		return None


def generate_answer(
	question: str,
	mode: str = "moderate",
	chat_history: list[dict] | None = None,
	user_profile: dict | None = None,
) -> dict:
	pipeline_module = os.getenv("RAG_PIPELINE_MODULE", "rag.pipeline")
	pipeline_function = os.getenv("RAG_PIPELINE_FUNCTION", "ask_question")

	if pipeline_module:
		try:
			module = importlib.import_module(pipeline_module)
			pipeline_fn = getattr(module, pipeline_function)
			try:
				result = pipeline_fn(question, mode=mode, chat_history=chat_history, user_profile=user_profile)
			except TypeError:
				try:
					result = pipeline_fn(question, mode=mode, chat_history=chat_history)
				except TypeError:
					try:
						result = pipeline_fn(question, mode=mode)
					except TypeError:
						result = pipeline_fn(question)
			return _normalize_result(result)
		except Exception as exc:
			logger.exception("RAG pipeline call failed: %s", exc)

	# Try fallback LLM generation if RAG pipeline call failed
	fallback_res = _fallback_llm_answer(question, user_profile=user_profile)
	if fallback_res:
		return fallback_res

	return {
		"answer": "I can help with MTI training questions. Please ensure GROQ_API_KEY or RAG pipeline dependencies are properly configured in your deployment settings.",
		"sources": ["RAG pipeline / LLM service not configured"],
		"images": [],
	}

