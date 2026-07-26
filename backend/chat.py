import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

try:
	from .auth import get_current_user
	from .database import get_db
	from .diagram_service import generate_meteorological_diagram
	from .models import ChatHistory, ChatThread, User
	from .rag_service import generate_answer
except ImportError:
	from auth import get_current_user
	from database import get_db
	from diagram_service import generate_meteorological_diagram
	from models import ChatHistory, ChatThread, User
	from rag_service import generate_answer


router = APIRouter(tags=["Chat"])


class ChatRequest(BaseModel):
	question: str = Field(min_length=1, max_length=4000)
	mode: str = Field(default="moderate", max_length=50)
	thread_id: str | None = Field(default=None)


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


class GenerateDiagramRequest(BaseModel):
	prompt: str = Field(min_length=2, max_length=1000)


class GenerateDiagramResponse(BaseModel):
	url: str
	caption: str
	provider: str


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
def get_threads(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	threads = (
		db.query(ChatThread)
		.filter(ChatThread.user_id == current_user.id)
		.order_by(ChatThread.updated_at.desc())
		.all()
	)
	return [
		{
			"id": t.id,
			"title": t.title,
			"created_at": t.created_at,
			"updated_at": t.updated_at,
		}
		for t in threads
	]


@router.get("/threads/{thread_id}/messages", response_model=list[HistoryItem])
def get_thread_messages(
	thread_id: str,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	thread = db.query(ChatThread).filter(ChatThread.id == thread_id, ChatThread.user_id == current_user.id).first()
	if not thread:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

	return [
		{
			"id": row.id,
			"thread_id": row.thread_id,
			"question": row.question,
			"answer": row.answer,
			"sources": json.loads(row.sources) if row.sources else [],
			"timestamp": row.created_at,
		}
		for row in thread.messages
	]


@router.put("/threads/{thread_id}", response_model=ThreadItem)
def update_thread(
	thread_id: str,
	payload: UpdateThreadRequest,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	thread = db.query(ChatThread).filter(ChatThread.id == thread_id, ChatThread.user_id == current_user.id).first()
	if not thread:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

	thread.title = payload.title.strip()
	thread.updated_at = datetime.utcnow()
	db.commit()
	db.refresh(thread)

	return {
		"id": thread.id,
		"title": thread.title,
		"created_at": thread.created_at,
		"updated_at": thread.updated_at,
	}


@router.delete("/threads/{thread_id}", response_model=DeleteResponse)
def delete_thread(
	thread_id: str,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	thread = db.query(ChatThread).filter(ChatThread.id == thread_id, ChatThread.user_id == current_user.id).first()
	if not thread:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

	db.delete(thread)
	db.commit()
	return {"message": "Thread deleted successfully"}


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	question_text = payload.question.strip()
	thread = None

	if payload.thread_id:
		thread = db.query(ChatThread).filter(ChatThread.id == payload.thread_id, ChatThread.user_id == current_user.id).first()

	if not thread:
		title_snippet = question_text[:35] + ("..." if len(question_text) > 35 else "")
		thread = ChatThread(
			id=f"thread_{uuid.uuid4().hex[:12]}",
			user_id=current_user.id,
			title=title_snippet,
		)
		db.add(thread)
		db.commit()
		db.refresh(thread)
	# Gather past turns in this thread for context memory
	history_turns = []
	if thread and thread.messages:
		history_turns = [
			{"question": msg.question, "answer": msg.answer}
			for msg in thread.messages
		]

	user_profile = {
		"name": current_user.name,
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

	chat_entry = ChatHistory(
		user_id=current_user.id,
		thread_id=thread.id,
		question=question_text,
		answer=answer,
		sources=json.dumps([str(item) for item in sources]),
	)

	db.add(chat_entry)
	db.commit()
	db.refresh(chat_entry)

	return {
		"id": chat_entry.id,
		"thread_id": thread.id,
		"answer": chat_entry.answer,
		"sources": sources,
		"images": images,
		"timestamp": chat_entry.created_at,
	}


@router.post("/chat/generate-diagram", response_model=GenerateDiagramResponse)
def generate_diagram(
	payload: GenerateDiagramRequest,
	current_user: User = Depends(get_current_user),
):
	"""Generate a high-quality scientific/meteorological diagram for a concept on demand."""
	try:
		diagram_info = generate_meteorological_diagram(payload.prompt)
		return diagram_info
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Diagram generation failed: {exc}",
		)


@router.get("/history", response_model=list[HistoryItem])
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	rows = (
		db.query(ChatHistory)
		.filter(ChatHistory.user_id == current_user.id)
		.order_by(ChatHistory.created_at.desc())
		.all()
	)

	return [
		{
			"id": row.id,
			"thread_id": row.thread_id,
			"question": row.question,
			"answer": row.answer,
			"sources": json.loads(row.sources) if row.sources else [],
			"timestamp": row.created_at,
		}
		for row in rows
	]


@router.delete("/history", response_model=DeleteResponse)
def delete_all_history(
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete(synchronize_session=False)
	db.query(ChatThread).filter(ChatThread.user_id == current_user.id).delete(synchronize_session=False)
	db.commit()
	return {"message": "All threads and chat history deleted"}


@router.delete("/history/{history_id}", response_model=DeleteResponse)
def delete_history(
	history_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	row = db.query(ChatHistory).filter(ChatHistory.id == history_id, ChatHistory.user_id == current_user.id).first()
	if not row:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History record not found")

	db.delete(row)
	db.commit()
	return {"message": "History deleted"}
