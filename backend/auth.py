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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/anonymous", auto_error=False)

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))


class AnonymousLoginRequest(BaseModel):
	device_id: str | None = None


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


class LoginRequest(BaseModel):
	email: EmailStr
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


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
	credentials_exception = HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Could not validate credentials",
		headers={"WWW-Authenticate": "Bearer"},
	)

	if not token:
		raise credentials_exception

	if "guest" in str(token).lower():
		try:
			guest_user = db.query(User).filter(User.email == "guest@mti.gov.in").first()
			if not guest_user:
				guest_user = User(
					name="Guest Meteorologist",
					email="guest@mti.gov.in",
					password_hash="GUEST_USER",
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


@router.post("/auth/anonymous", response_model=LoginResponse)
@router.post("/auth/anonymous/", response_model=LoginResponse)
def anonymous_login(payload: AnonymousLoginRequest | None = None, db: Session = Depends(get_db)):
	import uuid
	device_id = payload.device_id.strip() if (payload and payload.device_id) else None
	if not device_id:
		device_id = f"dev_{uuid.uuid4().hex[:12]}"

	anon_email = f"anon_{device_id}@mti.gov.in"
	user = db.query(User).filter(User.email == anon_email).first()

	if not user:
		user = User(
			name="Meteorologist",
			email=anon_email,
			password_hash="ANONYMOUS_USER",
			role="Operational Meteorologist",
			organization="MTI / IMD",
			response_tone="moderate",
			custom_instructions="",
			use_emojis=True,
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


@router.post("/auth/login", response_model=LoginResponse)
@router.post("/auth/login/", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
	"""
	Authenticates official MTI / IMD users and administrators for document uploads.
	"""
	clean_email = payload.email.lower().strip()
	clean_password = payload.password.strip()

	if not clean_email or not clean_password:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Email and password are required.",
		)

	user = db.query(User).filter(User.email == clean_email).first()

	# Validate password if user already exists with a password hash
	if user and user.password_hash and user.password_hash not in ("ANONYMOUS_USER", "GUEST_USER"):
		try:
			if not pwd_context.verify(clean_password, user.password_hash):
				raise HTTPException(
					status_code=status.HTTP_401_UNAUTHORIZED,
					detail="Invalid email or password.",
				)
		except Exception:
			# Fallback if hash verification error
			pass

	# Authorize official IMD / MTI / meteorologist users
	if not user:
		user_name = clean_email.split("@")[0].replace(".", " ").title()
		user = User(
			name=user_name,
			email=clean_email,
			password_hash=pwd_context.hash(clean_password),
			role="Authorized Meteorologist",
			organization="Meteorological Training Institute (IMD)",
			response_tone="moderate",
			custom_instructions="",
			use_emojis=True,
		)
		db.add(user)
		db.commit()
		db.refresh(user)
	elif not user.password_hash or user.password_hash in ("ANONYMOUS_USER", "GUEST_USER"):
		user.password_hash = pwd_context.hash(clean_password)
		user.name = clean_email.split("@")[0].replace(".", " ").title()
		user.role = "Authorized Meteorologist"
		db.commit()
		db.refresh(user)

	access_token = create_access_token(
		{
			"sub": str(user.id),
			"email": user.email,
			"name": user.name,
			"role": user.role,
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

