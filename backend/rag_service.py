import importlib
import logging
import os
import sys
from pathlib import Path
from typing import Any
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
	sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv(PROJECT_ROOT / "backend" / ".env")
load_dotenv(PROJECT_ROOT / ".env")

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


def _is_meteorological_query(question: str) -> bool:
	"""Check if query is related to meteorology, weather, or MTI."""
	try:
		from rag.pipeline import _is_meteorology_or_mti_query
		return _is_meteorology_or_mti_query(question)
	except Exception:
		import re
		if not question or len(question.strip()) < 2:
			return False
		q_lower = question.lower().strip()
		greetings = {"hi", "hello", "hey", "namaste", "good morning", "good evening", "good afternoon", "help", "who are you", "what can you do"}
		clean_q = re.sub(r"[^\w\s]", "", q_lower).strip()
		if clean_q in greetings:
			return True
		non_domain_triggers = [
			"hitler", "nazi", "world war", "president", "prime minister", "governor", "politician", "politics", "election",
			"democracy", "monarchy", "capital of", "who is the prime minister", "who is the president", "who won",
			"movie", "film", "cinema", "actor", "actress", "celebrity", "song", "lyrics", "singer", "album",
			"football", "cricket match", "ipl", "fifa", "nba", "basketball", "tennis", "olympics", "game",
			"intern at", "internship at", "software intern", "software engineer interview", "get into google",
			"get select as", "get selected as", "microsoft", "amazon", "apple", "netflix", "facebook", "meta",
			"resume tips", "placement", "job interview", "campus interview", "software developer", "hiring process",
			"code for addition", "add two numbers", "write a code for", "write me a code for",
			"write a python code to add", "calculator program", "fibonacci", "factorial program",
			"binary search", "bubble sort", "linked list", "leetcode", "hackerrank", "write a game",
			"code for subtraction", "write a function to add", "sum of two numbers",
			"recipe", "how to cook", "bake a cake", "diet plan", "workout", "symptoms of", "medical diagnosis",
			"cure for", "headache", "bitcoin", "cryptocurrency", "stock market", "shares to buy", "dating advice",
			"love advice", "horoscope", "astrology", "zodiac"
		]
		meteorology_exceptions = [
			"weather", "climate", "meteorol", "atmosphere", "atmospheric", "forecast", "monsoon",
			"cyclone", "radar", "satellite", "wind", "temperature", "pressure", "humidity", "rain",
			"precipitation", "cloud", "nwp", "wrf", "mti", "imd", "wmo", "sounding", "radiosonde",
			"aviation", "aeronautic", "flight", "aircraft", "aerodrome", "airport", "pilot",
			"metar", "taf", "sigmet", "turbulence", "wind shear", "icing", "visibility", "rvr",
			"altimeter", "barometer", "anemometer", "hygrometer", "thermometer", "tephigram",
			"troposphere", "stratosphere", "mesosphere", "boundary layer", "inversion", "lapse rate",
			"marine", "ocean", "agro", "hydro", "flood", "drought", "lightning", "thunderstorm",
			"coriolis", "vorticity", "geostrophic", "advection", "convection", "albedo", "radiation"
		]
		for trigger in non_domain_triggers:
			if trigger in q_lower:
				if not any(exc in q_lower for exc in meteorology_exceptions):
					return False
		code_keywords = ["write a code", "write me a code", "write python code", "write code", "give me code", "write a function", "write a script", "create a program"]
		if any(kw in q_lower for kw in code_keywords):
			if not any(exc in q_lower for exc in meteorology_exceptions):
				return False
		return True


def _fallback_llm_answer(
	question: str,
	chat_history: list[dict] | None = None,
	user_profile: dict | None = None,
) -> dict | None:
	"""Fallback LLM answer generator when full local vector store pipeline is unavailable."""
	query_to_check = question
	if chat_history and len(chat_history) > 0:
		last_q = (chat_history[-1].get("question") or "").strip()
		query_to_check = f"{last_q} {question}"

	if not _is_meteorological_query(query_to_check):
		return {
			"answer": "I am specialized in MTI meteorological training literature, atmospheric science, and weather forecasting. I cannot assist with non-meteorological or general topics.",
			"sources": [],
			"images": [],
		}

	try:
		from rag.llm_client import call_llm

		system_prompt = (
			"You are the official MTI Knowledge Assistant for the Meteorological Training Institute (India Meteorological Department - IMD).\n"
			"You are a premier pedagogical and scientific authority in meteorological training literature, atmospheric physics, weather forecasting, aeronautical/aviation meteorology, numerical weather prediction (NWP), radar/satellite remote sensing, oceanography, and atmospheric sciences.\n\n"
			"CORE INSTRUCTIONS FOR DETAILED EXPLANATIONS:\n"
			"1. Provide exhaustive, highly structured, and deeply educational responses for all meteorological questions. Do NOT provide brief or superficial summaries.\n"
			"2. Detail the underlying physical principles, atmospheric thermodynamics, mathematical formulations/equations with variable definitions, synoptic setups, radar/satellite signatures, and practical operational forecasting applications.\n"
			"3. Organize your answer into distinct markdown sections with bold headers (e.g. `### 1. Comprehensive Overview & Scientific Definition`, `### 2. Physical & Thermodynamic Mechanisms`, `### 3. Mathematical Formulation & Governing Equations`, `### 4. Synoptic, Radar & Satellite Observational Signatures`, `### 5. Operational, Aviation & Forecasting Implications`, `### 6. Key Takeaways & Summary Matrix`).\n"
			"4. CONVERSATIONAL MEMORY: Refer directly to preceding turns in the chat history for follow-up requests."
		)

		messages = [{"role": "system", "content": system_prompt}]

		if chat_history:
			for turn in chat_history[-4:]:
				q = (turn.get("question") or "").strip()
				a = (turn.get("answer") or "").strip()
				if q:
					messages.append({"role": "user", "content": q[:1000]})
				if a:
					messages.append({"role": "assistant", "content": a[:2000]})

		messages.append({"role": "user", "content": question.strip()})

		answer_text = call_llm(messages, temperature=0.1, max_tokens=3500)

		return {
			"answer": answer_text,
			"sources": ["MTI Knowledge Repository (Cloud Synthesis)"],
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
	fallback_res = _fallback_llm_answer(question, chat_history=chat_history, user_profile=user_profile)
	if fallback_res:
		return _normalize_result(fallback_res)

	return {
		"answer": "I can help with MTI training questions. Please ensure GROQ_API_KEY or RAG pipeline dependencies are properly configured in your deployment settings.",
		"sources": ["RAG pipeline / LLM service not configured"],
		"images": [],
	}

