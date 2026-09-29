from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: str = Field(..., description="User government / official email address")
    password: str = Field(..., description="Account password")


class UserProfile(BaseModel):
    name: str
    role: str
    email: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserProfile] = None
    token: Optional[str] = None
    attempts_used: int
    attempts_remaining: int
    max_attempts: int
    is_locked: bool
    lockout_until: Optional[str] = None
    retry_after_seconds: int = 0


class LoginStatusResponse(BaseModel):
    is_locked: bool
    attempts_used: int
    attempts_remaining: int
    max_attempts: int
    lockout_until: Optional[str] = None
    retry_after_seconds: int = 0
    message: str


class ResetLoginAttemptsRequest(BaseModel):
    email: Optional[str] = None
    admin_key: Optional[str] = None
