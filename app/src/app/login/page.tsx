"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";
import { mutate } from "swr";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const palette = {
  primary: "#6244F4",
  lime: "#D7F654",
  black: "#010101",
  white: "#FFFFFF",
};

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null) {
    const maybeError = err as {
      message?: unknown;
      response?: { data?: { message?: unknown } };
    };

    if (typeof maybeError.response?.data?.message === "string") {
      return maybeError.response.data.message;
    }

    if (typeof maybeError.message === "string") {
      return maybeError.message;
    }
  }

  return fallback;
}

function isPopupClosedByUserError(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code?: unknown }).code;
    return (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    );
  }

  return false;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isGooglePopupPendingRef = useRef(false);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (!isGooglePopupPendingRef.current) {
        return;
      }

      window.setTimeout(() => {
        if (!isGooglePopupPendingRef.current) {
          return;
        }

        if (!auth.currentUser) {
          isGooglePopupPendingRef.current = false;
          setLoading(false);
        }
      }, 250);
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.auth.login(email, password, rememberMe);

      if (response?.accessToken) {
        try {
          await fetch("/api/auth/set-cookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken: response.accessToken,
              rememberMe,
            }),
          });
        } catch (cookieError) {
          console.error("Failed to set frontend cookie:", cookieError);
        }
      }

      try {
        const fullProfile = await api.auth.getProfile();
        await mutate("/auth/me", fullProfile, { revalidate: false });
      } catch {
        if (response?.user) {
          await mutate("/auth/me", response.user, { revalidate: false });
        } else {
          await mutate("/auth/me", undefined, { revalidate: true });
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
      window.location.href = redirectTo;
    } catch (err: unknown) {
      console.error("Login error:", err);
      const errorMessage = getErrorMessage(
        err,
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) {
      return;
    }

    setError("");
    setLoading(true);
    isGooglePopupPendingRef.current = true;

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await api.auth.loginWithGoogle(idToken, rememberMe);

      if (response?.accessToken) {
        try {
          await fetch("/api/auth/set-cookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken: response.accessToken,
              rememberMe,
            }),
          });
        } catch (cookieError) {
          console.error("Failed to set frontend cookie:", cookieError);
        }
      }

      try {
        const fullProfile = await api.auth.getProfile();
        await mutate("/auth/me", fullProfile, { revalidate: false });
      } catch {
        await mutate("/auth/me", undefined, { revalidate: true });
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
      window.location.href = redirectTo;
    } catch (err: unknown) {
      if (isPopupClosedByUserError(err)) {
        return;
      }

      console.error("Google login error:", err);
      setError(getErrorMessage(err, "Đăng nhập Google thất bại. Vui lòng thử lại."));
    } finally {
      isGooglePopupPendingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      <main className="min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full min-h-screen bg-white overflow-hidden"
        >
          <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="relative bg-[#010101] text-white p-8 md:p-12 lg:p-14 overflow-hidden">
              <div
                className="absolute -top-20 -right-16 w-72 h-72 rounded-full blur-3xl"
                style={{ backgroundColor: "rgba(98, 68, 244, 0.35)" }}
              />
              <div
                className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full blur-3xl"
                style={{ backgroundColor: "rgba(215, 246, 84, 0.2)" }}
              />

              <div className="relative z-10 h-full flex flex-col">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold w-fit"
                  style={{
                    backgroundColor: "rgba(98, 68, 244, 0.22)",
                    color: palette.white,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Adaptive Learning Platform
                </div>

                <h1 className="mt-6 text-4xl md:text-5xl font-heading font-bold leading-tight">
                  Học cá nhân hoá,
                  <br />
                  tăng tiến bộ
                  <br />
                  mỗi ngày
                </h1>

                <p className="mt-5 text-sm md:text-base text-white/70 max-w-md leading-relaxed">
                  Đăng nhập để quản lý lớp học, giao bài tập, theo dõi tiến độ và
                  tối ưu lộ trình học cho từng học sinh.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    "Theo dõi mastery theo thời gian thực",
                    "Giao bài tập theo lớp nhanh chóng",
                    "Phân tích kết quả để cá nhân hoá học tập",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: palette.lime }}
                      >
                        <Check className="w-3.5 h-3.5 text-black" />
                      </div>
                      <span className="text-sm text-white/85">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="p-8 md:p-12 lg:p-14 flex items-center">
              <div className="w-full max-w-md mx-auto">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#010101]">
                  Chào mừng trở lại
                </h2>
                <p className="text-sm text-[#666666] mt-2">
                  Nhập thông tin đăng nhập để tiếp tục sử dụng hệ thống.
                </p>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 p-4 rounded-2xl border border-red-100 bg-red-50 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleLogin} className="mt-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#181d27] mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      classNames={{
                        input:
                          "text-base text-[#181d27] placeholder:text-[#717680]",
                        inputWrapper:
                          "h-12 border border-[#d5d7da] rounded-xl bg-white hover:bg-[#fafafa] focus-within:bg-white",
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#181d27] mb-2">
                      Mật khẩu
                    </label>
                    <Input
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      endContent={
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                          className="text-[#717680] hover:text-[#181d27]"
                        >
                          {isPasswordVisible ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      }
                      classNames={{
                        input:
                          "text-base text-[#181d27] placeholder:text-[#717680]",
                        inputWrapper:
                          "h-12 border border-[#d5d7da] rounded-xl bg-white hover:bg-[#fafafa] focus-within:bg-white",
                      }}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Checkbox
                      isSelected={rememberMe}
                      onValueChange={setRememberMe}
                      classNames={{ label: "text-sm text-[#666666]" }}
                    >
                      Ghi nhớ đăng nhập
                    </Checkbox>
                    <Link
                      href="#"
                      className="text-sm font-medium text-[#6244F4] hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-white text-base font-medium"
                    style={{ backgroundColor: palette.black }}
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#eaecf0]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white text-[#717680] text-sm">
                        hoặc
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="bordered"
                    onClick={handleGoogleLogin}
                    isDisabled={loading}
                    className="w-full h-12 rounded-xl border-[#d5d7da] text-base font-medium text-[#181d27]"
                    startContent={<GoogleIcon />}
                  >
                    Đăng nhập với Google
                  </Button>
                </form>

                <p className="mt-7 text-sm text-[#666666]">
                  Chưa có tài khoản?{" "}
                  <Link href="/" className="text-[#6244F4] font-medium hover:underline">
                    Tìm hiểu nền tảng
                  </Link>
                </p>

                <div
                  className="mt-6 h-1.5 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #6244F4 0%, #D7F654 50%, #6244F4 100%)",
                  }}
                />
              </div>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f7f7fb]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#6244F4] border-t-transparent rounded-full"
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
