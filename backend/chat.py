import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

try:
	from .auth import get_current_user
	from .database import get_db
	from .models import ChatHistory, User
	from .rag_service import generate_answer
except ImportError:
	from auth import get_current_user
	from database import get_db
	from models import ChatHistory, User
	from rag_service import generate_answer


router = APIRouter(tags=["Chat"])


class ChatRequest(BaseModel):
	question: str = Field(min_length=1, max_length=4000)


class ChatResponse(BaseModel):
	id: int
	answer: str
	sources: list[str]
	timestamp: datetime


class HistoryItem(BaseModel):
	id: int
	question: str
	answer: str
	sources: list[str]
	timestamp: datetime


class DeleteHistoryResponse(BaseModel):
	message: str


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	result = generate_answer(payload.question.strip())
	answer = str(result.get("answer", "")).strip()
	sources = result.get("sources", []) or []

	chat_entry = ChatHistory(
		user_id=current_user.id,
		question=payload.question.strip(),
		answer=answer,
		sources=json.dumps([str(item) for item in sources]),
	)

	db.add(chat_entry)
	db.commit()
	db.refresh(chat_entry)

	return {
		"id": chat_entry.id,
		"answer": chat_entry.answer,
		"sources": sources,
		"timestamp": chat_entry.created_at,
	}


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
			"question": row.question,
			"answer": row.answer,
			"sources": json.loads(row.sources) if row.sources else [],
			"timestamp": row.created_at,
		}
		for row in rows
	]


@router.delete("/history/{history_id}", response_model=DeleteHistoryResponse)
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
