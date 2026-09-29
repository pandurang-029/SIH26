"use client";

import { useRouter } from "next/navigation";
import AuthPage from "@/components/auth/AuthPage";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (user: { name: string; role: string; email: string }) => {
    try {
      localStorage.setItem("transformai_auth", JSON.stringify(user));
    } catch {}
    router.push("/");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <AuthPage
      initialMode="login"
      onLoginSuccess={handleLoginSuccess}
      onBackToHome={handleBackToHome}
    />
  );
}
