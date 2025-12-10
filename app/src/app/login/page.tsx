"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { mutate } from "swr";

// Image assets from Figma
const imgScreenMockupReplaceFill = "https://www.figma.com/api/mcp/asset/29b09a43-a041-46a3-878a-c7bf26444b65";

// Google icon SVG
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

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
      
      // Fetch full user profile after login to get complete data
      // This ensures we have all user information including info field
      try {
        const fullProfile = await api.auth.getProfile();
        // Update SWR cache with the full profile data
        await mutate("/auth/me", fullProfile, { revalidate: false });
      } catch (profileError) {
        // If getProfile fails, use the user data from login response
        if (response?.user) {
          await mutate("/auth/me", response.user, { revalidate: false });
        } else {
          // Fallback: revalidate the cache
          await mutate("/auth/me", undefined, { revalidate: true });
        }
      }
      
      // Redirect to the intended page or dashboard
      // Using replace instead of push to avoid adding to history
      router.replace(redirectTo);
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col items-center relative min-h-screen w-full">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-[960px] items-center relative w-full">
        {/* Left Section - Form */}
        <div className="flex flex-[1_0_0] flex-col h-full items-center justify-between min-h-px min-w-px relative">
          {/* Header */}
          <div className="flex h-20 items-start p-8 relative w-full">
            <p className="text-xl font-semibold text-[#181d27]">Adaptive Learning</p>
          </div>

          {/* Form Content */}
          <div className="flex flex-col items-center px-8 relative w-full">
            <div className="flex flex-col gap-8 items-center relative w-[360px]">
              {/* Heading */}
              <div className="flex flex-col gap-3 items-start relative w-full">
                <h1 className="font-semibold leading-[44px] text-[#181d27] text-[36px] tracking-[-0.72px] w-full">
                  Log in
                </h1>
                <p className="font-normal leading-6 text-[#535862] text-base w-full">
                  Welcome back! Please enter your details.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="flex flex-col gap-6 items-center relative rounded-[12px] w-full">
                <div className="flex flex-col gap-5 items-start relative w-full">
                  {/* Email Input */}
                  <div className="flex flex-col items-start relative w-full">
                    <div className="flex flex-col gap-1.5 items-start relative w-full">
                      <label className="font-medium leading-5 text-[#414651] text-sm">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                        classNames={{
                          input: "text-base text-[#717680]",
                          inputWrapper: "border border-[#d5d7da] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] px-[14px] py-[10px]",
                        }}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="flex flex-col items-start relative w-full">
                    <div className="flex flex-col gap-1.5 items-start relative w-full">
                      <label className="font-medium leading-5 text-[#414651] text-sm">
                        Password
                      </label>
                      <Input
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full"
                        endContent={
                          <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="focus:outline-none cursor-pointer"
                            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                          >
                            {isPasswordVisible ? (
                              <EyeOff className="size-5 text-[#717680]" />
                            ) : (
                              <Eye className="size-5 text-[#717680]" />
                            )}
                          </button>
                        }
                        classNames={{
                          input: "text-base text-[#717680]",
                          inputWrapper: "border border-[#d5d7da] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] px-[14px] py-[10px]",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between relative w-full">
                  <Checkbox
                    isSelected={rememberMe}
                    onValueChange={setRememberMe}
                    classNames={{
                      label: "font-medium leading-5 text-[#414651] text-sm",
                    }}
                  >
                    Remember for 30 days
                  </Checkbox>
                  <Button
                    variant="light"
                    className="text-[#6941c6] font-semibold text-sm p-0 min-w-0 h-auto"
                  >
                    Forgot password
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 items-start relative w-full">
                  <Button
                    type="submit"
                    className="bg-[#7f56d9] border border-[#7f56d9] text-white font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] w-full rounded-[8px]"
                    size="md"
                    isLoading={loading}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                  <div className="flex flex-col gap-3 items-center justify-center relative w-full">
                    <Button
                      variant="bordered"
                      className="bg-white border border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] w-full rounded-[8px]"
                      startContent={<GoogleIcon />}
                      size="md"
                    >
                      Sign in with Google
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="flex h-24 items-end p-8 relative w-full">
            <p className="font-normal leading-5 text-[#535862] text-sm">
              © Adaptive Learning 2025
            </p>
          </div>
        </div>

        {/* Right Section - Decorative Pattern & Mockup */}
        <div className="bg-neutral-100 flex-[1_0_0] h-full min-h-px min-w-px overflow-clip relative">
          {/* Decorative pattern background - simplified version */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }} />
          </div>
          
          {/* Screen Mockup */}
          <div className="absolute border-6 border-[#181d27] border-solid h-[682px] left-24 rounded-xl top-1/2 -translate-y-1/2 w-[1024px]">
            <div className="absolute bg-[#181d27] bottom-0 left-2 right-2 rounded-xl shadow-[0px_32px_64px_-12px_rgba(10,13,18,0.14)] top-0" />
            <div className="absolute border border-neutral-100 border-solid inset-0 rounded-xl">
              <Image
                src={imgScreenMockupReplaceFill}
                alt="Screen mockup"
                fill
                className="object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col h-[812px] items-center px-4 py-12 relative w-full">
        <div className="flex flex-col gap-8 items-start relative w-full">
          {/* Header */}
          <div className="flex flex-col gap-6 items-start relative w-full">
            <p className="text-xl font-semibold text-[#181d27]">Adaptive Learning</p>
            <div className="flex flex-col gap-2 items-start relative w-full">
              <h1 className="font-semibold leading-8 text-[#181d27] text-2xl w-full">
                Log in
              </h1>
              <p className="font-normal leading-6 text-[#535862] text-base w-full">
                Welcome back! Please enter your details.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-6 items-center relative rounded-[12px] w-full">
            <div className="flex flex-col gap-5 items-start relative w-full">
              {/* Email Input */}
              <div className="flex flex-col items-start relative w-full">
                <div className="flex flex-col gap-1.5 items-start relative w-full">
                  <label className="font-medium leading-5 text-[#414651] text-sm">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    classNames={{
                      input: "text-base text-[#717680]",
                      inputWrapper: "border border-[#d5d7da] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] px-[14px] py-[10px]",
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col items-start relative w-full">
                <div className="flex flex-col gap-1.5 items-start relative w-full">
                  <label className="font-medium leading-5 text-[#414651] text-sm">
                    Password
                  </label>
                  <Input
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    endContent={
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="focus:outline-none"
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                      >
                        {isPasswordVisible ? (
                          <EyeOff className="size-5 text-[#717680]" />
                        ) : (
                          <Eye className="size-5 text-[#717680]" />
                        )}
                      </button>
                    }
                    classNames={{
                      input: "text-base text-[#717680]",
                      inputWrapper: "border border-[#d5d7da] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] px-[14px] py-[10px]",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between relative w-full">
              <Checkbox
                isSelected={rememberMe}
                onValueChange={setRememberMe}
                classNames={{
                  label: "font-medium leading-5 text-[#414651] text-sm",
                }}
              >
                Remember for 30 days
              </Checkbox>
              <Button
                variant="light"
                className="text-[#6941c6] font-semibold text-sm p-0 min-w-0 h-auto"
              >
                Forgot password
              </Button>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 items-start relative w-full">
              <Button
                type="submit"
                className="bg-[#7f56d9] border border-[#7f56d9] text-white font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] w-full rounded-[8px]"
                size="md"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <div className="flex flex-col gap-3 items-center justify-center relative w-full">
                <Button
                  variant="bordered"
                  className="bg-white border border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] w-full rounded-[8px]"
                  startContent={<GoogleIcon />}
                  size="md"
                >
                  Sign in with Google
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

