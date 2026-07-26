from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
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
	password_hash = Column(String(255), nullable=True)
	google_id = Column(String(255), unique=True, nullable=True, index=True)
	role = Column(String(120), nullable=True, default="Trainee Meteorologist")
	organization = Column(String(150), nullable=True, default="India Meteorological Department (IMD)")
	response_tone = Column(String(50), nullable=True, default="moderate")
	custom_instructions = Column(Text, nullable=True, default="")
	use_emojis = Column(Boolean, nullable=False, default=True)
	created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

	chats = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
	threads = relationship("ChatThread", back_populates="user", cascade="all, delete-orphan")


class ChatThread(Base):
	__tablename__ = "chat_threads"

	id = Column(String(50), primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
	title = Column(String(255), nullable=False)
	created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
	updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

	user = relationship("User", back_populates="threads")
	messages = relationship("ChatHistory", back_populates="thread", cascade="all, delete-orphan", order_by="ChatHistory.created_at")


class ChatHistory(Base):
	__tablename__ = "chat_history"

	id = Column(Integer, primary_key=True, index=True)
	thread_id = Column(String(50), ForeignKey("chat_threads.id", ondelete="CASCADE"), index=True, nullable=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
	question = Column(Text, nullable=False)
	answer = Column(Text, nullable=False)
	sources = Column(Text, nullable=True)
	created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

	user = relationship("User", back_populates="chats")
	thread = relationship("ChatThread", back_populates="messages")
