import unittest
from app.services.login_limiter import login_rate_limiter
from app.core.config import settings

class TestLoginLimiter(unittest.TestCase):
    def test_login_limiter(self):
        email = "intruder@domain.com"
        ip = "192.168.1.55"
        
        # Reset
        login_rate_limiter.reset(email, ip)
        
        status = login_rate_limiter.check_status(email, ip)
        self.assertFalse(status["is_locked"], "Initial status should not be locked")
        self.assertEqual(status["attempts_remaining"], settings.MAX_LOGIN_ATTEMPTS_PER_DAY)
        
        # Perform failed attempts up to limit
        for i in range(settings.MAX_LOGIN_ATTEMPTS_PER_DAY):
            res = login_rate_limiter.record_attempt(email, ip, success=False)
            if i < settings.MAX_LOGIN_ATTEMPTS_PER_DAY - 1:
                self.assertFalse(res["is_locked"], f"Attempt {i+1} should not be locked yet")
            else:
                self.assertTrue(res["is_locked"], "Final attempt should trigger lockout")
                self.assertEqual(res["attempts_remaining"], 0)
        
        # Next check should report locked
        check = login_rate_limiter.check_status(email, ip)
        self.assertTrue(check["is_locked"], "Should remain locked")
        self.assertGreater(check["retry_after_seconds"], 0)
        
        # Test reset
        login_rate_limiter.reset(email, ip)
        after_reset = login_rate_limiter.check_status(email, ip)
        self.assertFalse(after_reset["is_locked"], "Should be unlocked after reset")

if __name__ == "__main__":
    unittest.main()

