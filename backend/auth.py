import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, ConfigDict, EmailStr, Field

router = APIRouter(tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/anonymous", auto_error=False)

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "mti-rag-stateless-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))


class User(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: int = 1
	name: str = "Meteorologist"
	email: str = "meteorologist@imd.gov.in"
	role: str | None = "Operational Meteorologist"
	organization: str | None = "India Meteorological Department (IMD)"
	response_tone: str | None = "moderate"
	custom_instructions: str | None = ""
	use_emojis: bool = True


class AnonymousLoginRequest(BaseModel):
	device_id: str | None = None


class UserResponse(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: int
	name: str
	email: str
	role: str | None = "Operational Meteorologist"
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


class LoginRequest(BaseModel):
	email: str
	password: str


class LoginResponse(BaseModel):
	access_token: str
	token_type: str = "bearer"
	user: UserResponse


class LogoutResponse(BaseModel):
	message: str


def create_access_token(payload: dict, expires_delta: timedelta | None = None) -> str:
	to_encode = payload.copy()
	expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
	to_encode.update({"exp": expire})
	return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
	"""Stateless in-memory authentication dependency."""
	default_user = User()
	if not token or token == "undefined" or "guest" in str(token).lower():
		return default_user

	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		return User(
			id=1,
			name=payload.get("name", "Meteorologist"),
			email=payload.get("email", "meteorologist@imd.gov.in"),
			role=payload.get("role", "Operational Meteorologist"),
			organization=payload.get("organization", "India Meteorological Department (IMD)"),
		)
	except (JWTError, ValueError):
		return default_user


@router.post("/auth/anonymous", response_model=LoginResponse)
@router.post("/auth/anonymous/", response_model=LoginResponse)
def anonymous_login(payload: AnonymousLoginRequest | None = None):
	user = User()
	token = create_access_token({"sub": "1", "name": user.name, "email": user.email})
	return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/auth/login", response_model=LoginResponse)
@router.post("/auth/login/", response_model=LoginResponse)
def login(payload: LoginRequest):
	clean_email = payload.email.lower().strip()
	name = clean_email.split("@")[0].replace(".", " ").title() if "@" in clean_email else "Meteorologist"
	user = User(
		id=1,
		name=name,
		email=clean_email,
		role="Authorized Meteorologist",
		organization="Meteorological Training Institute (IMD)",
	)
	token = create_access_token({"sub": "1", "name": user.name, "email": user.email, "role": user.role})
	return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/logout", response_model=LogoutResponse)
def logout(_: User = Depends(get_current_user)):
	return {"message": "Logged out successfully"}


@router.get("/user/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
	return current_user


@router.put("/user/profile", response_model=UserResponse)
def update_user_profile(
	payload: UpdateProfileRequest,
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
	return current_user
