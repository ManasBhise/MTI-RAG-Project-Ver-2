import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

try:
	from .auth import User, get_current_user
	from .rag_service import generate_answer
except ImportError:
	from auth import User, get_current_user
	from rag_service import generate_answer


router = APIRouter(tags=["Chat"])


class ChatHistoryTurn(BaseModel):
	question: str
	answer: str


class ChatRequest(BaseModel):
	question: str = Field(min_length=1, max_length=4000)
	mode: str = Field(default="moderate", max_length=50)
	thread_id: str | None = Field(default=None)
	chat_history: list[ChatHistoryTurn] = []


class ImageItem(BaseModel):
	url: str
	source: str | None = None
	caption: str | None = None
	provider: str | None = None


class ChatResponse(BaseModel):
	id: int
	thread_id: str
	answer: str
	sources: list[str]
	images: list[ImageItem] = []
	timestamp: datetime


class TranslateRequest(BaseModel):
	text: str = Field(min_length=1, max_length=10000)
	target_language: str = Field(default="hindi", max_length=50)


class TranslateResponse(BaseModel):
	translated_text: str
	language: str


class ThreadItem(BaseModel):
	id: str
	title: str
	created_at: datetime
	updated_at: datetime


class UpdateThreadRequest(BaseModel):
	title: str = Field(min_length=1, max_length=255)


class HistoryItem(BaseModel):
	id: int
	thread_id: str | None
	question: str
	answer: str
	sources: list[str]
	timestamp: datetime


class DeleteResponse(BaseModel):
	message: str


@router.get("/threads", response_model=list[ThreadItem])
def get_threads(current_user: User = Depends(get_current_user)):
	"""Zero-storage mode: Session threads are maintained in client-side memory."""
	return []


@router.get("/threads/{thread_id}/messages", response_model=list[HistoryItem])
def get_thread_messages(
	thread_id: str,
	current_user: User = Depends(get_current_user),
):
	"""Zero-storage mode: Thread messages are maintained in client-side memory."""
	return []


@router.put("/threads/{thread_id}", response_model=ThreadItem)
def update_thread(
	thread_id: str,
	payload: UpdateThreadRequest,
	current_user: User = Depends(get_current_user),
):
	now = datetime.utcnow()
	return {
		"id": thread_id,
		"title": payload.title.strip(),
		"created_at": now,
		"updated_at": now,
	}


@router.delete("/threads/{thread_id}", response_model=DeleteResponse)
def delete_thread(
	thread_id: str,
	current_user: User = Depends(get_current_user),
):
	return {"message": "Thread cleared"}


@router.post("/chat", response_model=ChatResponse)
@router.post("/chat/", response_model=ChatResponse)
def chat(payload: ChatRequest, current_user: User = Depends(get_current_user)):
	"""
	Process chat queries in-memory with Zero Server Storage / Zero Data Retention.
	Conversational context is passed directly from client-side memory without saving chats to disk.
	"""
	question_text = payload.question.strip()
	thread_id = payload.thread_id or f"thread_{uuid.uuid4().hex[:12]}"

	# Extract recent turns from client payload memory
	history_turns = [
		{"question": turn.question, "answer": turn.answer}
		for turn in payload.chat_history[-4:]
	]

	user_profile = {
		"name": current_user.name if current_user else "Meteorologist",
		"role": getattr(current_user, "role", "Trainee Meteorologist") or "Trainee Meteorologist",
		"organization": getattr(current_user, "organization", "IMD") or "",
		"response_tone": getattr(current_user, "response_tone", "moderate") or "moderate",
		"custom_instructions": getattr(current_user, "custom_instructions", "") or "",
		"use_emojis": getattr(current_user, "use_emojis", True) if getattr(current_user, "use_emojis", True) is not None else True,
	}

	selected_mode = payload.mode if payload.mode and payload.mode != "moderate" else user_profile["response_tone"]

	result = generate_answer(
		question_text,
		mode=selected_mode,
		chat_history=history_turns,
		user_profile=user_profile,
	)
	answer = str(result.get("answer", "")).strip()
	sources = result.get("sources", []) or []
	images = result.get("images", []) or []

	# Stateless: Generate in-memory response without writing to database or disk
	msg_id = int(datetime.utcnow().timestamp() * 1000)
	now = datetime.utcnow()

	return {
		"id": msg_id,
		"thread_id": thread_id,
		"answer": answer,
		"sources": sources,
		"images": images,
		"timestamp": now,
	}


@router.post("/chat/translate", response_model=TranslateResponse)
def translate_response(
	payload: TranslateRequest,
	current_user: User = Depends(get_current_user),
):
	"""Translate assistant response to Hindi using LLM in RAM while preserving markdown layout."""
	text_to_translate = payload.text.strip()
	target_lang = payload.target_language.strip().lower()

	if not text_to_translate:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text to translate cannot be empty")

	try:
		from rag.llm_client import call_llm

		lang_name = "Hindi (हिंदी - Devanagari script)" if target_lang in ("hindi", "hi") else target_lang.capitalize()

		system_prompt = (
			f"You are a highly skilled meteorological translator for the Meteorological Training Institute (India Meteorological Department).\n"
			f"Translate the provided meteorological text into clean, professional, and elegant {lang_name}.\n\n"
			f"STRICT FORMATTING & TRANSLATION RULES:\n"
			f"1. Preserve ALL markdown layout structures exactly (headers like ### 1. Overview, bold text, bullet points, numbers, formulas, equation symbols).\n"
			f"2. Use accurate, standardized IMD meteorological Hindi terminology.\n"
			f"3. Include key English meteorological terms in parentheses alongside Hindi where helpful (e.g. तापीय संवहन (Thermal Advection), वायुमंडलीय दाब (Atmospheric Pressure)).\n"
			f"4. Do NOT output any intro text, conversational filler, or commentary. Output ONLY the translated markdown text."
		)

		messages = [
			{"role": "system", "content": system_prompt},
			{"role": "user", "content": text_to_translate},
		]

		translated_text = call_llm(messages, temperature=0.1, max_tokens=2000)
		if not translated_text:
			raise ValueError("Empty translation received from LLM")

		return {
			"translated_text": translated_text,
			"language": target_lang,
		}
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Translation failed: {exc}",
		)


@router.get("/history", response_model=list[HistoryItem])
def get_history(current_user: User = Depends(get_current_user)):
	return []


@router.delete("/history", response_model=DeleteResponse)
def delete_all_history(current_user: User = Depends(get_current_user)):
	return {"message": "All history cleared"}


@router.delete("/history/{history_id}", response_model=DeleteResponse)
def delete_history(history_id: int, current_user: User = Depends(get_current_user)):
	return {"message": "History entry cleared"}
