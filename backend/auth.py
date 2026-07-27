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
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


class RegisterRequest(BaseModel):
	name: str = Field(min_length=2, max_length=120)
	email: EmailStr
	password: str = Field(min_length=8)


class LoginRequest(BaseModel):
	email: EmailStr
	password: str


class GoogleLoginRequest(BaseModel):
	credential: str


class UserResponse(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: int
	name: str
	email: EmailStr
	role: str | None = "Trainee Meteorologist"
	organization: str | None = "India Meteorological Department (IMD)"
	response_tone: str | None = "moderate"
	custom_instructions: str | None = ""
	use_emojis: bool = True


class UpdateProfileRequest(BaseModel):
	name: str | None = Field(default=None, max_length=120)
	role: str | None = Field(default=None, max_length=120)
	organization: str | None = Field(default=None, max_length=150)
	response_tone: str | None = Field(default="moderate", max_length=50)
	custom_instructions: str | None = Field(default="", max_length=2000)
	use_emojis: bool | None = True


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

	if token and ("guest" in str(token).lower()):
		try:
			guest_user = db.query(User).filter(User.email == "guest@mti.gov.in").first()
			if not guest_user:
				guest_user = User(
					name="Guest Meteorologist",
					email="guest@mti.gov.in",
					role="Trainee Meteorologist",
					organization="India Meteorological Department (IMD)",
					response_tone="moderate",
					custom_instructions="",
					use_emojis=True,
				)
				db.add(guest_user)
				db.commit()
				db.refresh(guest_user)
			return guest_user
		except Exception:
			db.rollback()
			return User(
				id=0,
				name="Guest Meteorologist",
				email="guest@mti.gov.in",
				role="Trainee Meteorologist",
				organization="India Meteorological Department (IMD)",
				response_tone="moderate",
				custom_instructions="",
				use_emojis=True,
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

	if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
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


@router.post("/auth/google", response_model=LoginResponse)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
	"""Authenticate a user via Google Sign-In.

	Receives the Google ID token (credential) from the frontend,
	verifies it against Google's servers, and returns a JWT session.
	"""
	from google.auth.transport import requests as google_requests
	from google.oauth2 import id_token

	try:
		id_info = id_token.verify_oauth2_token(
			payload.credential,
			google_requests.Request(),
			GOOGLE_CLIENT_ID,
		)
	except ValueError as exc:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail=f"Invalid Google token: {exc}",
		)

	google_sub = id_info.get("sub")
	email = id_info.get("email", "").lower().strip()
	name = id_info.get("name", email.split("@")[0])

	if not email:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Google account does not have an email address",
		)

	# Try to find existing user by google_id first, then by email
	user = db.query(User).filter(User.google_id == google_sub).first()

	if not user:
		user = db.query(User).filter(User.email == email).first()
		if user:
			# Link existing email-registered user to their Google account
			user.google_id = google_sub
			db.commit()
			db.refresh(user)
		else:
			# Create a brand new Google user (no password)
			user = User(
				name=name,
				email=email,
				password_hash=None,
				google_id=google_sub,
			)
			db.add(user)
			db.commit()
			db.refresh(user)

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


@router.get("/user/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
	return current_user


@router.put("/user/profile", response_model=UserResponse)
def update_user_profile(
	payload: UpdateProfileRequest,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	if payload.name is not None:
		current_user.name = payload.name.strip()
	if payload.role is not None:
		current_user.role = payload.role.strip()
	if payload.organization is not None:
		current_user.organization = payload.organization.strip()
	if payload.response_tone is not None:
		current_user.response_tone = payload.response_tone.strip()
	if payload.custom_instructions is not None:
		current_user.custom_instructions = payload.custom_instructions.strip()
	if payload.use_emojis is not None:
		current_user.use_emojis = payload.use_emojis

	db.commit()
	db.refresh(current_user)
	return current_user

