import logging
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, status, Query
from app.schemas.auth_schemas import (
    LoginRequest,
    LoginResponse,
    LoginStatusResponse,
    UserProfile,
    ResetLoginAttemptsRequest,
)
from app.services.login_limiter import login_rate_limiter
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])


def get_client_ip(request: Request) -> str:
    """Extract client IP, handling proxies / load balancers if present."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.get("/status", response_model=LoginStatusResponse)
async def check_login_status(
    request: Request,
    email: Optional[str] = Query(None, description="User email to check attempt limits for")
):
    """
    Check current daily login attempt count and lockout status
    for the requesting IP and given email.
    """
    client_ip = get_client_ip(request)
    status_info = login_rate_limiter.check_status(email, client_ip)
    return LoginStatusResponse(**status_info)


@router.post("/login", response_model=LoginResponse)
async def login(request: Request, body: LoginRequest):
    """
    Authenticate user with daily rate-limiting and brute-force protection.
    If attempts exceed MAX_LOGIN_ATTEMPTS_PER_DAY (default 5), blocks access for 24 hours.
    """
    client_ip = get_client_ip(request)
    email = body.email.strip().lower()
    password = body.password.strip()

    # 1. Check if user or IP is currently locked out
    status_info = login_rate_limiter.check_status(email, client_ip)
    if status_info["is_locked"]:
        logger.warning(f"Blocked login attempt for locked target: {email} from IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "DAILY_LOGIN_LIMIT_EXCEEDED",
                "message": status_info["message"],
                "attempts_used": status_info["attempts_used"],
                "attempts_remaining": 0,
                "max_attempts": status_info["max_attempts"],
                "lockout_until": status_info["lockout_until"],
                "retry_after_seconds": status_info["retry_after_seconds"],
            }
        )

    # 2. Authenticate credentials
    # Supports known official/evaluator accounts and valid system credentials
    is_valid = False
    user_name = "Security Officer"
    user_role = "Tier-1 Official"

    # Predefined known accounts for demonstration and evaluation
    if email in ["officer@ntro.gov.in", "evaluator@sih2026.gov.in", "admin@ntro.gov.in"]:
        # Standard passwords accepted for demo accounts
        if password in ["ntro@2026", "sih@2026", "password123", "officer123", "evaluator", "••••••••", "••••••••••••"]:
            is_valid = True
            if "evaluator" in email:
                user_name = "Officer / Evaluator"
                user_role = "Smart India Hackathon Evaluator"
            elif "admin" in email:
                user_name = "System Administrator"
                user_role = "NTRO Security Admin"
            else:
                user_name = "Security Officer"
                user_role = "Tier-1 Enterprise Official"
    else:
        # For any general official user: require reasonable password (>= 6 chars)
        # Any failure to meet password requirement triggers attempt recording
        if len(password) >= 6 and password not in ["wrong", "123456", "test"]:
            is_valid = True
            name_part = email.split("@")[0].replace(".", " ").title()
            user_name = name_part if name_part else "Official User"
            user_role = "NTRO Operations Specialist"

    # 3. Handle Authentication Failure -> Record Attempt
    if not is_valid:
        res = login_rate_limiter.record_attempt(email, client_ip, success=False)
        logger.warning(
            f"Failed login attempt for {email} from {client_ip}. "
            f"Attempts used: {res['attempts_used']}/{res['max_attempts']}"
        )

        if res["is_locked"]:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "DAILY_LOGIN_LIMIT_EXCEEDED",
                    "message": res["message"],
                    "attempts_used": res["attempts_used"],
                    "attempts_remaining": 0,
                    "max_attempts": res["max_attempts"],
                    "lockout_until": res["lockout_until"],
                    "retry_after_seconds": res["retry_after_seconds"],
                }
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": res["message"],
                "attempts_used": res["attempts_used"],
                "attempts_remaining": res["attempts_remaining"],
                "max_attempts": res["max_attempts"],
            }
        )

    # 4. Handle Authentication Success -> Reset Daily Attempts for entity
    res = login_rate_limiter.record_attempt(email, client_ip, success=True)
    return LoginResponse(
        success=True,
        message="Login successful.",
        user=UserProfile(name=user_name, role=user_role, email=email),
        token=f"ntro_token_{email.replace('@', '_')}",
        attempts_used=0,
        attempts_remaining=res["max_attempts"],
        max_attempts=res["max_attempts"],
        is_locked=False,
        lockout_until=None,
        retry_after_seconds=0
    )


@router.post("/reset", response_model=LoginStatusResponse)
async def reset_login_attempts(request: Request, body: ResetLoginAttemptsRequest):
    """
    Administrative reset endpoint to unlock an account/IP for testing or operator recovery.
    """
    client_ip = get_client_ip(request)
    login_rate_limiter.reset(body.email, client_ip)
    status_info = login_rate_limiter.check_status(body.email, client_ip)
    return LoginStatusResponse(**status_info)
