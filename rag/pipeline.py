import logging
import os
from functools import lru_cache


from groq import Groq
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from rag.config import (
	GROQ_API_KEY,
	GROQ_MODEL,
	SYSTEM_PROMPT,
	TOP_K,
	VECTOR_STORE_DIR,
)
from rag.ingest import get_embeddings

logger = logging.getLogger(__name__)


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
	q_lower = question.lower()
	non_domain_triggers = [
		"president", "prime minister", "capital of", "who is the", "actor", "movie",
		"recipe", "bake", "nba", "football", "cricket match", "bitcoin", "crypto",
		"governor", "celebrity", "song", "lyrics"
	]
	for trigger in non_domain_triggers:
		if trigger in q_lower and "weather" not in q_lower and "climate" not in q_lower and "mti" not in q_lower and "meteorol" not in q_lower:
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


def _retrieve_context(question: str) -> tuple[str, list[str]]:
	if not _is_meteorology_or_mti_query(question):
		return "", []

	vector_store = _load_vector_store()
	results = vector_store.similarity_search_with_score(question, k=TOP_K)

	if not results:
		return "", []

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
		return "", []

	# Sort candidates descending by hybrid score
	scored_results.sort(key=lambda item: item[0], reverse=True)

	if scored_results[0][0] < 0.44:
		return "", []

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

	return "\n\n".join(context_blocks), sources


import re


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


ACTIVE_GROQ_MODELS = [
	"llama-3.3-70b-versatile",
	"llama-3.1-8b-instant",
	"llama-3.2-11b-vision-preview",
	"llama-3.2-3b-preview",
]


def _call_groq(client: Groq, messages: list[dict], preferred_model: str) -> str:
	models_to_try = [preferred_model] + [m for m in ACTIVE_GROQ_MODELS if m != preferred_model]
	models_to_try = list(dict.fromkeys(models_to_try))
	last_err = None

	for target_model in models_to_try:
		try:
			res = client.chat.completions.create(
				model=target_model,
				messages=messages,
				temperature=0.1,
				max_tokens=1200,
			)
			content = (res.choices[0].message.content or "").strip()
			if content:
				return content
		except Exception as err:
			last_err = err
			logger.warning("Groq call to model %s failed: %s. Retrying next active model...", target_model, err)
			continue

	if last_err:
		raise last_err
	return ""


def _generate_answer(question: str, context: str, mode: str = "moderate", chat_history: list[dict] | None = None) -> str:
	api_key = os.getenv("GROQ_API_KEY") or GROQ_API_KEY
	model_name = os.getenv("GROQ_MODEL") or GROQ_MODEL

	if not api_key:
		logger.warning("GROQ_API_KEY is not set. Returning retrieved context as fallback.")
		return (
			"*(Note: GROQ_API_KEY is not set in backend/.env. Below is the relevant context retrieved directly from MTI materials:)*\n\n"
			f"{context}"
		)

	mode_instruction = MODE_PROMPTS.get(mode.lower(), MODE_PROMPTS["moderate"])

	client = Groq(api_key=api_key)

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
		f"{mode_instruction}\n\n"
		f"Context from MTI training documents:\n\n{capped_context}\n\n"
		f"Current User Request: {question.strip()}\n\n"
		"IMPORTANT: The user is engaged in an ongoing conversation thread. "
		"Refer directly to the preceding conversation turns in the chat history above to fulfill follow-up requests, requests for questions, or clarification of previous topics. "
		"Synthesize a clear, full, and self-contained meteorological answer adhering to the requested response depth. "
		"Do NOT output raw character fragments or repetitive equation labels. "
		"Do not include inline source citations like [1] or Source[2] in the body of your response."
	)

	messages.append({"role": "user", "content": user_prompt})

	content = _call_groq(client, messages, model_name)
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
			f"{mode_instruction}\n\n"
			f"Current User Request: {question.strip()}\n\n"
			"IMPORTANT: Refer directly to the preceding conversation turns in the chat history above to construct the response. "
			"Provide a clear, highly structured, and comprehensive meteorological explanation for this concept. "
			"Organize your answer into distinct sections with bold titles (e.g. **1. Overview & Definition**, **2. Physical Principles & Formulation**, **3. Meteorological & NWP Applications**, **4. Key Takeaways**). "
			"Use clear paragraphs and bullet points so it is clean, readable, and easy to follow."
		)
		retry_messages.append({"role": "user", "content": retry_prompt})

		retry_content = _call_groq(client, retry_messages, model_name)
		cleaned = clean_source_references(retry_content)

	return cleaned or "No answer generated."



def ask_question(question: str, mode: str = "moderate", chat_history: list[dict] | None = None) -> dict:
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
		context, sources = _retrieve_context(retrieval_query)

		if not context:
			# Fallback to direct question search if combined query retrieved empty
			context, sources = _retrieve_context(question)

		if not context:
			return {
				"answer": "I could not find relevant information in the MTI training materials to answer this question.",
				"sources": [],
			}

		answer = _generate_answer(question, context, mode=mode, chat_history=chat_history)
		return {"answer": answer, "sources": sources}
	except FileNotFoundError as exc:
		logger.error("%s", exc)
		return {
			"answer": "The knowledge base index has not been built yet. Please run the index builder first.",
			"sources": ["Index not found"],
		}
	except Exception as exc:
		logger.exception("RAG pipeline failed: %s", exc)
		return {
			"answer": f"Unable to generate an answer right now: {exc}",
			"sources": [],
		}
