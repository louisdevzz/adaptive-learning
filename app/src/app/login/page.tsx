"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { mutate } from "swr";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

// Google icon SVG
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.auth.login(email, password);

      // Set cookie on frontend domain for Next.js middleware (cross-domain fix)
      if (response?.accessToken) {
        await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: response.accessToken }),
        });
      }

      try {
        const fullProfile = await api.auth.getProfile();
        await mutate("/auth/me", fullProfile, { revalidate: false });
      } catch (profileError) {
        if (response?.user) {
          await mutate("/auth/me", response.user, { revalidate: false });
        } else {
          await mutate("/auth/me", undefined, { revalidate: true });
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
      window.location.href = redirectTo;
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await api.auth.loginWithGoogle(idToken);

      // Set cookie on frontend domain for Next.js middleware (cross-domain fix)
      if (response?.accessToken) {
        await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: response.accessToken }),
        });
      }

      try {
        const fullProfile = await api.auth.getProfile();
        await mutate("/auth/me", fullProfile, { revalidate: false });
      } catch (profileError) {
        await mutate("/auth/me", undefined, { revalidate: true });
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
      window.location.href = redirectTo;
    } catch (err: any) {
      console.error("Google login error:", err);
      const errorMessage =
        err.message || "Đăng nhập Google thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full overflow-hidden flex flex-col lg:flex-row min-h-[700px]"
      >
        {/* Left Side - Gradient Background with Quote */}
        <div className="lg:w-1/2 relative overflow-hidden">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-800 to-slate-900">
            {/* Animated waves */}
            <div className="absolute inset-0 opacity-60">
              <svg
                className="absolute w-full h-full"
                viewBox="0 0 800 800"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="wave1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M0,400 Q200,200 400,400 T800,400 L800,800 L0,800 Z"
                  fill="url(#wave1)"
                  animate={{
                    d: [
                      "M0,400 Q200,200 400,400 T800,400 L800,800 L0,800 Z",
                      "M0,300 Q200,500 400,300 T800,300 L800,800 L0,800 Z",
                      "M0,400 Q200,200 400,400 T800,400 L800,800 L0,800 Z",
                    ],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </svg>
            </div>
            {/* Second wave layer */}
            <div className="absolute inset-0 opacity-40">
              <svg
                className="absolute w-full h-full"
                viewBox="0 0 800 800"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="wave2"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#1e40af" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M0,500 Q300,300 600,500 T800,500 L800,800 L0,800 Z"
                  fill="url(#wave2)"
                  animate={{
                    d: [
                      "M0,500 Q300,300 600,500 T800,500 L800,800 L0,800 Z",
                      "M0,400 Q300,600 600,400 T800,400 L800,800 L0,800 Z",
                      "M0,500 Q300,300 600,500 T800,500 L800,800 L0,800 Z",
                    ],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </svg>
            </div>
            {/* Accent glow */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/30 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-10 md:p-14">
            {/* Top Label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-white/60 text-xs tracking-[0.3em] uppercase font-medium">
                Câu nói truyền cảm hứng
              </span>
              <div className="w-16 h-px bg-white/30 mt-3" />
            </motion.div>

            {/* Main Quote */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex-1 flex flex-col justify-center"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] mb-6">
                Học Mỗi Ngày
                <br />
                <span className="text-blue-200">Thành Công</span>
                <br />
                Mỗi Ngày
              </h2>
              <p className="text-white/70 text-base md:text-lg max-w-sm leading-relaxed">
                Bạn có thể đạt được mọi thứ nếu kiên trì học tập, tin tưởng vào
                quá trình và tuân thủ kế hoạch.
              </p>
            </motion.div>

            {/* Bottom decorative element */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/10"
                  />
                ))}
              </div>
              <span className="text-white/60 text-sm">
                10,000+ học sinh đang học
              </span>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 bg-white flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            {/* Logo */}
            <div className="flex justify-center mb-10">
              <Link href="/" className="flex items-center">
                <img
                  src="/logo-text.png"
                  alt="Adapt"
                  className="h-8 object-contain"
                />
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-serif text-black mb-3">
                Chào mừng trở lại
              </h1>
              <p className="text-gray-500 text-sm">
                Nhập email và mật khẩu để truy cập tài khoản của bạn
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  classNames={{
                    input: "text-base text-black placeholder:text-gray-400",
                    inputWrapper:
                      "bg-gray-50 border-0 rounded-xl h-12 hover:bg-gray-100 focus-within:bg-gray-100",
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Mật khẩu
                </label>
                <Input
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  endContent={
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="focus:outline-none text-gray-400 hover:text-gray-600"
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  classNames={{
                    input: "text-base text-black placeholder:text-gray-400",
                    inputWrapper:
                      "bg-gray-50 border-0 rounded-xl h-12 hover:bg-gray-100 focus-within:bg-gray-100",
                  }}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <Checkbox
                  isSelected={rememberMe}
                  onValueChange={setRememberMe}
                  classNames={{
                    label: "text-sm text-gray-600",
                  }}
                >
                  Ghi nhớ đăng nhập
                </Checkbox>
                <Link
                  href="#"
                  className="text-sm font-medium text-black hover:text-blue-600 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white h-12 text-base font-medium rounded-xl hover:bg-gray-800"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-gray-400 text-sm">
                    hoặc
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="bordered"
                className="w-full h-12 text-base font-medium border-gray-200 rounded-xl hover:bg-gray-50"
                startContent={<GoogleIcon />}
                onClick={handleGoogleLogin}
                isDisabled={loading}
              >
                Đăng nhập với Google
              </Button>
            </form>

            <div className="mt-10 text-center text-sm text-gray-500" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
