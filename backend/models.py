from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

try:
	from .database import Base
except ImportError:
	from database import Base


class User(Base):
	__tablename__ = "users"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(120), nullable=False)
	email = Column(String(255), unique=True, nullable=False, index=True)
	password_hash = Column(String(255), nullable=False)
	created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

	chats = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")


class ChatHistory(Base):
	__tablename__ = "chat_history"

	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
	question = Column(Text, nullable=False)
	answer = Column(Text, nullable=False)
	sources = Column(Text, nullable=True)
	created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

	user = relationship("User", back_populates="chats")
