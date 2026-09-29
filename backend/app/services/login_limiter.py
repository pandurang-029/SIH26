import json
import logging
import threading
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from app.core.config import settings

logger = logging.getLogger(__name__)


class LoginRateLimiter:
    """
    Thread-safe, persistent Daily Login Rate Limiter.
    Enforces a strict daily limit on login attempts per account/email and IP address
    to protect against brute-force attacks and credential stuffing.
    """

    def __init__(self):
        self._lock = threading.RLock()
        self.state_file = settings.UPLOAD_DIR / ".login_attempts.json"
        self._data: Dict[str, Dict[str, Any]] = {}
        self._load_state()

    def _load_state(self) -> None:
        """Load persistent attempt history from disk if present."""
        try:
            if self.state_file.exists():
                with open(self.state_file, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            else:
                self._data = {}
        except Exception as e:
            logger.warning(f"Could not load login rate limiter state: {e}")
            self._data = {}

    def _save_state(self) -> None:
        """Save attempt history to disk atomically."""
        try:
            settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            with open(self.state_file, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not save login rate limiter state: {e}")

    def _normalize_key(self, identifier: Optional[str], ip: Optional[str]) -> Tuple[str, str]:
        user_key = f"user:{identifier.strip().lower()}" if identifier else "user:anonymous"
        ip_key = f"ip:{ip.strip()}" if ip else "ip:unknown"
        return user_key, ip_key

    def _prune_and_get_entry(self, key: str, now: datetime) -> Dict[str, Any]:
        """
        Prune attempts older than 24 hours.
        Return active record for key.
        """
        entry = self._data.get(key, {
            "attempts": [],
            "locked_until": None,
            "lock_count": 0
        })

        cutoff = (now - timedelta(hours=settings.LOGIN_LOCKOUT_HOURS)).isoformat()
        
        # Filter attempts within the rolling 24-hour window
        active_attempts = [ts for ts in entry.get("attempts", []) if ts >= cutoff]
        entry["attempts"] = active_attempts

        # Check if lockout expired
        locked_until_str = entry.get("locked_until")
        if locked_until_str:
            try:
                locked_until_dt = datetime.fromisoformat(locked_until_str)
                if now >= locked_until_dt:
                    entry["locked_until"] = None
                    # Once lockout expires, clear attempts for a fresh start
                    entry["attempts"] = []
            except Exception:
                entry["locked_until"] = None

        self._data[key] = entry
        return entry

    def check_status(self, identifier: Optional[str], ip: Optional[str]) -> Dict[str, Any]:
        """
        Inspect current status for identifier and IP without recording a new attempt.
        """
        now = datetime.now(timezone.utc)
        with self._lock:
            user_key, ip_key = self._normalize_key(identifier, ip)
            user_entry = self._prune_and_get_entry(user_key, now)
            ip_entry = self._prune_and_get_entry(ip_key, now)

            # Check if either user or IP is currently locked
            is_locked = False
            lockout_until = None
            retry_after_seconds = 0

            for entry, label in [(user_entry, "account"), (ip_entry, "IP address")]:
                if entry.get("locked_until"):
                    lock_dt = datetime.fromisoformat(entry["locked_until"])
                    if lock_dt > now:
                        is_locked = True
                        if not lockout_until or lock_dt > datetime.fromisoformat(lockout_until):
                            lockout_until = entry["locked_until"]
                            retry_after_seconds = max(1, int((lock_dt - now).total_seconds()))

            max_limit = settings.MAX_LOGIN_ATTEMPTS_PER_DAY
            attempts_used = max(len(user_entry["attempts"]), len(ip_entry["attempts"]))
            attempts_remaining = max(0, max_limit - attempts_used)

            message = "Authentication status normal."
            if is_locked:
                hours_left = max(1, round(retry_after_seconds / 3600))
                message = (
                    f"Account security lockout: Maximum login attempts per day ({max_limit}) exceeded. "
                    f"Login is locked for security purposes (~{hours_left}h remaining)."
                )
            elif attempts_remaining <= 2:
                message = f"Warning: {attempts_remaining} login attempt(s) remaining for today before security lockout."

            return {
                "is_locked": is_locked,
                "attempts_used": attempts_used,
                "attempts_remaining": attempts_remaining,
                "max_attempts": max_limit,
                "lockout_until": lockout_until,
                "retry_after_seconds": retry_after_seconds,
                "message": message
            }

    def record_attempt(
        self,
        identifier: Optional[str],
        ip: Optional[str],
        success: bool = False
    ) -> Dict[str, Any]:
        """
        Record a login attempt.
        If attempts exceed MAX_LOGIN_ATTEMPTS_PER_DAY, triggers a 24-hour lockout.
        """
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()

        with self._lock:
            user_key, ip_key = self._normalize_key(identifier, ip)
            user_entry = self._prune_and_get_entry(user_key, now)
            ip_entry = self._prune_and_get_entry(ip_key, now)

            # Check if already locked
            status = self.check_status(identifier, ip)
            if status["is_locked"]:
                return status

            max_limit = settings.MAX_LOGIN_ATTEMPTS_PER_DAY
            lockout_duration = timedelta(hours=settings.LOGIN_LOCKOUT_HOURS)

            if success:
                # On successful login, clear the attempt history for user
                user_entry["attempts"] = []
                user_entry["locked_until"] = None
                self._save_state()
                return {
                    "is_locked": False,
                    "attempts_used": 0,
                    "attempts_remaining": max_limit,
                    "max_attempts": max_limit,
                    "lockout_until": None,
                    "retry_after_seconds": 0,
                    "message": "Login successful. Attempt counters reset."
                }

            # On failed attempt, increment for both user and IP
            user_entry["attempts"].append(now_iso)
            ip_entry["attempts"].append(now_iso)

            attempts_count = max(len(user_entry["attempts"]), len(ip_entry["attempts"]))
            is_locked = False
            lockout_until = None
            retry_after_seconds = 0

            if attempts_count >= max_limit:
                # Lockout triggered!
                locked_until_dt = now + lockout_duration
                lockout_until = locked_until_dt.isoformat()
                user_entry["locked_until"] = lockout_until
                ip_entry["locked_until"] = lockout_until
                user_entry["lock_count"] = user_entry.get("lock_count", 0) + 1
                ip_entry["lock_count"] = ip_entry.get("lock_count", 0) + 1
                is_locked = True
                retry_after_seconds = int(lockout_duration.total_seconds())

            self._save_state()

            attempts_remaining = max(0, max_limit - attempts_count)
            if is_locked:
                message = (
                    f"Security Alert: Daily login limit of {max_limit} attempts exceeded! "
                    f"This account and IP are locked for {settings.LOGIN_LOCKOUT_HOURS} hours for security purposes."
                )
            else:
                message = (
                    f"Invalid login credentials. {attempts_remaining} attempt(s) remaining today "
                    f"before 24-hour security lockout."
                )

            return {
                "is_locked": is_locked,
                "attempts_used": attempts_count,
                "attempts_remaining": attempts_remaining,
                "max_attempts": max_limit,
                "lockout_until": lockout_until,
                "retry_after_seconds": retry_after_seconds,
                "message": message
            }

    def reset(self, identifier: Optional[str], ip: Optional[str] = None) -> None:
        """Administrative unlock to reset limits for an account or IP."""
        now = datetime.now(timezone.utc)
        with self._lock:
            user_key, ip_key = self._normalize_key(identifier, ip)
            if user_key in self._data:
                self._data[user_key] = {"attempts": [], "locked_until": None, "lock_count": 0}
            if ip_key in self._data:
                self._data[ip_key] = {"attempts": [], "locked_until": None, "lock_count": 0}
            self._save_state()


# Global singleton instance
login_rate_limiter = LoginRateLimiter()
