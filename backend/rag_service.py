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
		if isinstance(sources, list):
			normalized_sources = [str(item) for item in sources]
		else:
			normalized_sources = [str(sources)]

		return {
			"answer": answer or "No answer generated.",
			"sources": normalized_sources,
		}

	return {
		"answer": str(result).strip() or "No answer generated.",
		"sources": [],
	}


def generate_answer(question: str) -> dict:
	pipeline_module = os.getenv("RAG_PIPELINE_MODULE")
	pipeline_function = os.getenv("RAG_PIPELINE_FUNCTION", "ask_question")

	if pipeline_module:
		try:
			module = importlib.import_module(pipeline_module)
			pipeline_fn = getattr(module, pipeline_function)
			result = pipeline_fn(question)
			return _normalize_result(result)
		except Exception as exc:
			logger.exception("RAG pipeline call failed: %s", exc)

	return {
		"answer": "I can help with MTI training questions. Configure the RAG pipeline module to get grounded document answers.",
		"sources": ["RAG pipeline not configured"],
	}
