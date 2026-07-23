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


def _retrieve_context(question: str) -> tuple[str, list[str]]:
	vector_store = _load_vector_store()
	results = vector_store.similarity_search_with_score(question, k=TOP_K)

	if not results:
		return "", []

	context_blocks: list[str] = []
	sources: list[str] = []
	seen_sources: set[str] = set()

	for index, (document, _score) in enumerate(results, start=1):
		source_label = _format_source(document.metadata)
		context_blocks.append(f"[{index}] Source: {source_label}\n{document.page_content.strip()}")

		if source_label not in seen_sources:
			seen_sources.add(source_label)
			sources.append(source_label)

	return "\n\n".join(context_blocks), sources


def _generate_answer(question: str, context: str) -> str:
	api_key = os.getenv("GROQ_API_KEY") or GROQ_API_KEY
	model_name = os.getenv("GROQ_MODEL") or GROQ_MODEL

	if not api_key:
		logger.warning("GROQ_API_KEY is not set. Returning retrieved context as fallback.")
		return (
			"*(Note: GROQ_API_KEY is not set in backend/.env. Below is the relevant context retrieved directly from MTI materials:)*\n\n"
			f"{context}"
		)

	client = Groq(api_key=api_key)
	user_prompt = (
		f"Context from MTI training documents:\n\n{context}\n\n"
		f"Question: {question.strip()}\n\n"
		"Answer based only on the context above."
	)

	response = client.chat.completions.create(
		model=model_name,
		messages=[
			{"role": "system", "content": SYSTEM_PROMPT},
			{"role": "user", "content": user_prompt},
		],
		temperature=0.2,
		max_tokens=1024,
	)

	content = response.choices[0].message.content
	return (content or "").strip() or "No answer generated."



def ask_question(question: str) -> dict:
	question = question.strip()
	if not question:
		return {
			"answer": "Please enter a question about MTI training material.",
			"sources": [],
		}

	try:
		context, sources = _retrieve_context(question)

		if not context:
			return {
				"answer": "I could not find relevant MTI training material for that question.",
				"sources": [],
			}

		answer = _generate_answer(question, context)
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
