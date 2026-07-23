import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy.orm import Session

try:
	from .database import get_db
	from .models import User
except ImportError:
	from database import get_db
	from models import User


router = APIRouter(tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


class RegisterRequest(BaseModel):
	name: str = Field(min_length=2, max_length=120)
	email: EmailStr
	password: str = Field(min_length=8)


class LoginRequest(BaseModel):
	email: EmailStr
	password: str


class UserResponse(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: int
	name: str
	email: EmailStr


class LoginResponse(BaseModel):
	access_token: str
	token_type: str = "bearer"
	user: UserResponse


class LogoutResponse(BaseModel):
	message: str


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
	return pwd_context.hash(password)


def create_access_token(payload: dict, expires_delta: timedelta | None = None) -> str:
	to_encode = payload.copy()
	expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
	to_encode.update({"exp": expire})
	return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
	credentials_exception = HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Could not validate credentials",
		headers={"WWW-Authenticate": "Bearer"},
	)

	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		subject = payload.get("sub")
		if subject is None:
			raise credentials_exception
		user_id = int(subject)
	except (JWTError, ValueError):
		raise credentials_exception

	user = db.query(User).filter(User.id == user_id).first()
	if not user:
		raise credentials_exception
	return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
	normalized_email = payload.email.lower().strip()
	existing_user = db.query(User).filter(User.email == normalized_email).first()
	if existing_user:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

	user = User(
		name=payload.name.strip(),
		email=normalized_email,
		password_hash=get_password_hash(payload.password),
	)
	db.add(user)
	db.commit()
	db.refresh(user)
	return user


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
	normalized_email = payload.email.lower().strip()
	user = db.query(User).filter(User.email == normalized_email).first()

	if not user or not verify_password(payload.password, user.password_hash):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

	access_token = create_access_token(
		{
			"sub": str(user.id),
			"email": user.email,
			"name": user.name,
		}
	)

	return {
		"access_token": access_token,
		"token_type": "bearer",
		"user": user,
	}


@router.post("/logout", response_model=LogoutResponse)
def logout(_: User = Depends(get_current_user)):
	return {"message": "Logged out successfully"}
