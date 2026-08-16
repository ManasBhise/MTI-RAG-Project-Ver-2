import json
import logging
import os
import re
from functools import lru_cache
from pathlib import Path

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from PIL import Image

from rag.config import (
	EXTRACTED_IMAGES_DIR,
	SYSTEM_PROMPT,
	TOP_K,
	VECTOR_STORE_DIR,
)
from rag.ingest import get_embeddings
from rag.llm_client import call_llm

logger = logging.getLogger(__name__)


def _is_substantive_diagram(img_path: Path) -> bool:
	if not img_path.exists():
		return False
	# Must be at least 25 KB to filter out logos, bullet icons, and header graphics
	size = img_path.stat().st_size
	if size < 25000:
		return False
	# Exclude small cover page logos (e.g. page_1_img_* under 45KB)
	if img_path.name.startswith("page_1_") and size < 45000:
		return False
	try:
		with Image.open(img_path) as img:
			w, h = img.size
			if w < 250 or h < 180:
				return False
	except Exception:
		pass
	return True


@lru_cache(maxsize=1)
def _load_vector_store() -> FAISS:
	if not VECTOR_STORE_DIR.exists():
		raise FileNotFoundError(
			f"Vector store not found at {VECTOR_STORE_DIR}. Run: python -m rag.build_index"
		)

	embeddings: HuggingFaceEmbeddings = get_embeddings()
	return FAISS.load_local(
		str(VECTOR_STORE_DIR),
		embeddings,
		allow_dangerous_deserialization=True,
	)


def _format_source(metadata: dict) -> str:
	source = metadata.get("source") or metadata.get("file_name") or "Unknown source"
	page = metadata.get("page")
	if page is not None:
		return f"{source} (page {int(page) + 1})"
	return str(source)


def _compute_keyword_overlap(query: str, text: str) -> float:
	terms = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 2]
	if not terms:
		return 0.0
	doc_text_lower = text.lower()
	matches = sum(1 for t in terms if t in doc_text_lower)
	return matches / len(terms)


def _is_meteorology_or_mti_query(question: str) -> bool:
	if not question or len(question.strip()) < 2:
		return False

	q_lower = question.lower().strip()

	# Greetings and basic assistant identification are allowed
	greetings = {"hi", "hello", "hey", "namaste", "good morning", "good evening", "good afternoon", "help", "who are you", "what can you do"}
	clean_q = re.sub(r"[^\w\s]", "", q_lower).strip()
	if clean_q in greetings:
		return True

	non_domain_triggers = [
		# History / Politics / Leaders
		"hitler", "nazi", "world war", "president", "prime minister", "governor", "politician", "politics", "election",
		"democracy", "monarchy", "capital of", "who is the prime minister", "who is the president", "who won",
		# Entertainment / Movies / Sports
		"movie", "film", "cinema", "actor", "actress", "celebrity", "song", "lyrics", "singer", "album",
		"football", "cricket match", "ipl", "fifa", "nba", "basketball", "tennis", "olympics", "game",
		# Tech Jobs / Internships / Corporate
		"intern at", "internship at", "software intern", "software engineer interview", "get into google",
		"get select as", "get selected as", "microsoft", "amazon", "apple", "netflix", "facebook", "meta",
		"resume tips", "placement", "job interview", "campus interview", "software developer", "hiring process",
		# Generic Coding / Math trivia
		"code for addition", "add two numbers", "write a code for", "write me a code for",
		"write a python code to add", "calculator program", "fibonacci", "factorial program",
		"binary search", "bubble sort", "linked list", "leetcode", "hackerrank", "write a game",
		"code for subtraction", "write a function to add", "sum of two numbers",
		# Lifestyle / Health / Cooking / Finance
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

	# If query asks for generic programming without meteorological context
	code_keywords = ["write a code", "write me a code", "write python code", "write code", "give me code", "write a function", "write a script", "create a program"]
	if any(kw in q_lower for kw in code_keywords):
		if not any(exc in q_lower for exc in meteorology_exceptions):
			return False

	return True


def _clean_chunk_text(text: str) -> str:
	if not text:
		return ""
	# Strip non-printable PUA font symbols (e.g. \uf072, \uf020) and control codes
	cleaned = re.sub(r"[\uE000-\uF8FF\uFFF0-\uFFFF]", "", text)
	cleaned = re.sub(r"[ \t]+", " ", cleaned)
	cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
	return cleaned.strip()


def _is_junk_text(text: str) -> bool:
	if not text or len(text.strip()) < 20:
		return True
	lines = [line.strip() for line in text.split("\n") if line.strip()]
	if not lines:
		return True
	# Check 1: Single char lines
	single_char_lines = sum(1 for line in lines if len(line) <= 2)
	if single_char_lines / len(lines) > 0.35:
		return True
	# Check 2: Repetitive identical lines (e.g. 'dC dp' or 'l' repeated 50 times)
	unique_lines = set(lines)
	if len(lines) > 5 and (len(unique_lines) / len(lines)) < 0.25:
		return True
	# Check 3: Unique characters ratio
	unique_chars = len(set(text.lower()))
	if len(text) > 50 and (unique_chars / len(text)) < 0.05:
		return True
	return False


def _retrieve_context(question: str) -> tuple[str, list[str], list[dict]]:
	if not _is_meteorology_or_mti_query(question):
		return "", [], []

	vector_store = _load_vector_store()
	results = vector_store.similarity_search_with_score(question, k=TOP_K)

	if not results:
		return "", [], []

	# Hybrid Reranking: combine vector similarity with keyword match ratio
	scored_results = []
	for document, dist in results:
		dist_val = float(dist)
		cleaned_text = _clean_chunk_text(document.page_content)
		if _is_junk_text(cleaned_text):
			continue

		vector_sim = 1.0 / (1.0 + dist_val)
		kw_sim = _compute_keyword_overlap(question, cleaned_text)

		if dist_val > 1.25 and kw_sim == 0.0:
			continue

		# Temporarily store cleaned text on document object
		document.page_content = cleaned_text
		hybrid_score = vector_sim + 0.45 * kw_sim
		scored_results.append((hybrid_score, document))

	if not scored_results:
		return "", [], []

	# Sort candidates descending by hybrid score
	scored_results.sort(key=lambda item: item[0], reverse=True)

	if scored_results[0][0] < 0.44:
		return "", [], []

	top_candidates = [doc for _score, doc in scored_results[:7]]

	context_blocks: list[str] = []
	sources: list[str] = []
	seen_sources: set[str] = set()

	for index, document in enumerate(top_candidates, start=1):
		source_label = _format_source(document.metadata)
		context_blocks.append(f"[{index}] Source: {source_label}\n{document.page_content.strip()}")

		if source_label not in seen_sources:
			seen_sources.add(source_label)
			sources.append(source_label)

	return "\n\n".join(context_blocks), sources, []


def clean_source_references(text: str) -> str:
	if not text:
		return text
	# Strip non-printable PUA font characters (e.g. \uf072, \uf020) and control codes
	cleaned = re.sub(r"[\uE000-\uF8FF\uFFF0-\uFFFF]", "", text)
	# Strip inline source mentions like Source[1], source[2], [source 2], [1], (Source 3), etc.
	pattern = r"\[?\s*(?:source|Source)\s*\[?\s*\d+\s*\]?\s*\]?|\(\s*(?:source|Source)\s*\d+\s*\)|\[\d+\]"
	cleaned = re.sub(pattern, "", cleaned)

	# Collapse consecutive identical lines if repeated more than twice
	lines = cleaned.split("\n")
	dedup_lines = []
	prev_line = None
	repeat_count = 0
	for line in lines:
		line_str = line.strip()
		if line_str == prev_line and line_str != "":
			repeat_count += 1
			if repeat_count <= 2:
				dedup_lines.append(line)
		else:
			prev_line = line_str
			repeat_count = 1
			dedup_lines.append(line)
	cleaned = "\n".join(dedup_lines)

	# Filter out isolated single-character lines (e.g. 'l', 'i', '|')
	clean_lines = [line for line in cleaned.split("\n") if len(line.strip()) > 2 or (line.strip() and line.strip().isalnum() == False)]
	cleaned = "\n".join(clean_lines)

	cleaned = re.sub(r" +", " ", cleaned)
	cleaned = re.sub(r" \.", ".", cleaned)
	cleaned = re.sub(r" ,", ",", cleaned)
	# Collapse 3 or more consecutive newlines into 2 (paragraph break)
	cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
	return cleaned.strip()


MODE_PROMPTS = {
	"basic": (
		"RESPONSE DEPTH: BASIC / BEGINNER.\n"
		"Explain concepts in simple, clear everyday language. Use simple analogies where helpful. "
		"Avoid dense technical jargon without explaining it first in simple terms."
	),
	"moderate": (
		"RESPONSE DEPTH: MODERATE / BALANCED.\n"
		"Provide a clear, educational, and balanced answer suitable for meteorological trainees. "
		"Use standard technical terms with clear explanations."
	),
	"research": (
		"RESPONSE DEPTH: IN-DEPTH RESEARCH / EXPERT.\n"
		"Provide a rigorous, highly structured, and comprehensive expert analysis. "
		"Organize your answer into clear, well-spaced paragraphs with descriptive bold section titles (such as **1. Theoretical Overview & Definition**, **2. Physical & Mathematical Formulation**, **3. Meteorological & NWP Applications**, and **4. Key Operational Summary**). "
		"Use bullet points for listing formulas, variables, and key mechanisms to make the technical content clean and easy to read. "
		"Do NOT copy broken PDF text column fragments."
	),
}


def _is_repetitive_fragment(text: str) -> bool:
	if not text or len(text.strip()) < 100:
		return True
	words = [w.lower() for w in re.findall(r"\w+", text)]
	if not words or len(words) < 30:
		return True
	diversity = len(set(words)) / len(words)
	if diversity < 0.35:
		return True
	single_char_words = sum(1 for w in words if len(w) <= 1)
	if (single_char_words / len(words)) > 0.15:
		return True
	lines = [l.strip() for l in text.split("\n") if l.strip()]
	if lines and (sum(len(l) for l in lines) / len(lines)) < 30:
		return True
	return False


def _generate_answer(
	question: str,
	context: str,
	mode: str = "moderate",
	chat_history: list[dict] | None = None,
	user_profile: dict | None = None,
) -> str:
	mode_instruction = MODE_PROMPTS.get(mode.lower(), MODE_PROMPTS["moderate"])

	profile_prompt = ""
	if user_profile:
		name = user_profile.get("name") or ""
		role = user_profile.get("role") or ""
		org = user_profile.get("organization") or ""
		cust_inst = (user_profile.get("custom_instructions") or "").strip()

		parts = []
		if name:
			parts.append(f"User Name: {name}")
		if role:
			parts.append(f"Role / Specialization: {role}")
		if org:
			parts.append(f"Organization: {org}")
		if cust_inst:
			parts.append(f"User Custom Instructions & Preferences: {cust_inst}")

		use_emojis = user_profile.get("use_emojis", True) if user_profile.get("use_emojis") is not None else True
		if use_emojis:
			parts.append("EMOJI POLICY: Enrich your response with relevant, professional meteorological emojis (e.g. 🌤️, 🌡️, 🌩️, 📊, 🌀, 🌧️, ⚡, 🔍, 💡, 📌) for section headers, bullet points, and key takeaways to make the response engaging.")
		else:
			parts.append("STRICT EMOJI POLICY: Do NOT use any emojis anywhere in your response. Keep the text completely plain, formal, and without emoji symbols.")

		if parts:
			profile_prompt = (
				"\n\nUSER PERSONALIZATION & PREFERENCES:\n- "
				+ "\n- ".join(parts)
				+ "\n(IMPORTANT: Tailor your response tone, explanations, and emoji policy to align with this user's profile and custom instructions.)"
			)

	messages = [{"role": "system", "content": SYSTEM_PROMPT}]

	if chat_history:
		# Keep up to last 3 turns to optimize token budget
		for turn in chat_history[-3:]:
			q = (turn.get("question") or "").strip()
			a = (turn.get("answer") or "").strip()
			if q:
				messages.append({"role": "user", "content": q[:500]})
			if a:
				messages.append({"role": "assistant", "content": a[:800]})

	# Cap context text to 3500 characters max
	capped_context = context[:3500] if context else ""

	user_prompt = (
		f"{mode_instruction}{profile_prompt}\n\n"
		f"Context from MTI training documents:\n\n{capped_context}\n\n"
		f"Current User Request: {question.strip()}\n\n"
		"IMPORTANT: The user is engaged in an ongoing conversation thread. "
		"Refer directly to the preceding conversation turns in the chat history above to fulfill follow-up requests, requests for questions, or clarification of previous topics. "
		"Synthesize a clear, full, and self-contained meteorological answer adhering to the requested response depth. "
		"Do NOT output raw character fragments or repetitive equation labels. "
		"Do not include inline source citations like [1] or Source[2] in the body of your response."
	)

	messages.append({"role": "user", "content": user_prompt})

	try:
		content = call_llm(messages, temperature=0.1, max_tokens=1500)
	except Exception as err:
		logger.warning("All LLM providers failed or unconfigured: %s. Returning retrieved context as fallback.", err)
		if context:
			return (
				"*(Note: AI synthesis is currently running on direct context fallback. Below is the relevant material retrieved from MTI training literature:)*\n\n"
				f"{context}"
			)
		return "I am currently unable to generate an AI answer. Please verify your API key configurations."

	cleaned = clean_source_references(content)

	# If output is a repetitive fragment or trivial text, fallback to domain synthesis
	if _is_repetitive_fragment(cleaned):
		retry_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

		if chat_history:
			for turn in chat_history[-3:]:
				q = (turn.get("question") or "").strip()
				a = (turn.get("answer") or "").strip()
				if q:
					retry_messages.append({"role": "user", "content": q[:500]})
				if a:
					retry_messages.append({"role": "assistant", "content": a[:800]})

		retry_prompt = (
			f"{mode_instruction}{profile_prompt}\n\n"
			f"Current User Request: {question.strip()}\n\n"
			"IMPORTANT: Refer directly to the preceding conversation turns in the chat history above to construct the response. "
			"Provide a clear, highly structured, and comprehensive meteorological explanation for this concept. "
			"Organize your answer into distinct sections with bold titles (e.g. **1. Overview & Definition**, **2. Physical Principles & Formulation**, **3. Meteorological & NWP Applications**, **4. Key Takeaways**). "
			"Use clear paragraphs and bullet points so it is clean, readable, and easy to follow."
		)
		retry_messages.append({"role": "user", "content": retry_prompt})

		try:
			retry_content = call_llm(retry_messages, temperature=0.1, max_tokens=1500)
			cleaned = clean_source_references(retry_content)
		except Exception as err:
			logger.warning("Retry LLM call failed: %s", err)

	return cleaned or "No answer generated."


def ask_question(
	question: str,
	mode: str = "moderate",
	chat_history: list[dict] | None = None,
	user_profile: dict | None = None,
) -> dict:
	question = question.strip()
	if not question:
		return {
			"answer": "Please enter a question about MTI training material.",
			"sources": [],
		}

	# Combine current question with recent chat history for context-aware validation and retrieval
	retrieval_query = question
	if chat_history and len(chat_history) > 0:
		last_q = (chat_history[-1].get("question") or "").strip()
		retrieval_query = f"{last_q} {question}"

	if not _is_meteorology_or_mti_query(retrieval_query):
		return {
			"answer": "I am specialized exclusively in MTI meteorological training literature and do not have information regarding non-meteorological or general trivia questions.",
			"sources": [],
		}

	try:
		context, sources, images = _retrieve_context(retrieval_query)

		if not context:
			# If no exact chunk retrieved, synthesize answer from MTI domain knowledge
			answer = _generate_answer(
				question,
				context="",
				mode=mode,
				chat_history=chat_history,
				user_profile=user_profile,
			)
			return {
				"answer": answer,
				"sources": ["MTI Knowledge Repository (Foundational Meteorological Concepts)"],
				"images": images,
			}

		answer = _generate_answer(
			question,
			context,
			mode=mode,
			chat_history=chat_history,
			user_profile=user_profile,
		)
		return {"answer": answer, "sources": sources, "images": images}
	except Exception as exc:
		logger.warning("Vector retrieval unavailable (%s), synthesizing directly from LLM with chat history.", exc)
		answer = _generate_answer(
			question,
			context="",
			mode=mode,
			chat_history=chat_history,
			user_profile=user_profile,
		)
		return {
			"answer": answer,
			"sources": ["MTI Knowledge Repository (Cloud Synthesis)"],
			"images": [],
		}

