"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

// Image assets from Figma
const imgScreenMockupReplaceFill = "https://www.figma.com/api/mcp/asset/29b09a43-a041-46a3-878a-c7bf26444b65";
const imgGrid = "https://www.figma.com/api/mcp/asset/067cc687-0a7c-426a-b712-d86250427f5d";
const imgReflection = "https://www.figma.com/api/mcp/asset/d0699b9f-9e7e-4049-8a5f-40f71dac1857";
const imgVector2 = "https://www.figma.com/api/mcp/asset/5cec5328-0084-4911-b649-59f7720de5d6";
const imgGridMobile = "https://www.figma.com/api/mcp/asset/df5f8e34-e92e-4d79-9e5c-6568fe73cd09";
const imgReflectionMobile = "https://www.figma.com/api/mcp/asset/22235135-1fe2-4616-ac33-88a7b0a670e0";

// Google icon SVG
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function Logomark({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const isMobile = size === "lg";
  const sizeClass = isMobile ? "size-12" : "size-8";
  const borderWidth = isMobile ? "border-[0.3px]" : "border-[0.2px]";
  const rounded = isMobile ? "rounded-xl" : "rounded-lg";
  
  return (
    <div className={className}>
      <div className={`${borderWidth} border-[rgba(10,13,18,0.12)] border-solid overflow-clip relative ${rounded} shadow-[0px_1px_1px_-0.5px_rgba(10,13,18,0.13),0px_1px_3px_0px_rgba(10,13,18,0.1),0px_1px_2px_0px_rgba(10,13,18,0.06)] shrink-0 ${sizeClass}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-[rgba(10,13,18,0.2)] rounded-lg" />
        <div className="absolute inset-[-0.2px]">
          <Image
            src={isMobile ? imgGridMobile : imgGrid}
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-[calc(25%+-0.2px)_calc(25%-0.2px)_calc(25%-0.2px)_calc(25%+-0.2px)] overflow-clip rounded-full shadow-[0px_1px_3px_0px_rgba(10,13,18,0.1),0px_1px_2px_0px_rgba(10,13,18,0.06)]">
          <div className="absolute h-[3.2px] left-[3.2px] top-[1.6px] w-[9.6px]">
            <Image
              src={isMobile ? imgReflectionMobile : imgReflection}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="absolute backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0.2)] inset-[calc(50%+-0.2px)_-0.2px_-0.2px_-0.2px] rounded-bl-lg rounded-br-lg" />
      </div>
    </div>
  );
}

function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={className}>
      <div className="h-8 relative shrink-0 w-[139px]">
        <Logomark className="absolute bottom-0 left-0 right-[76.98%] top-0" />
        {showText && (
          <div className="absolute bottom-0 left-[30.22%] right-0 top-0">
            <div className="absolute bottom-[27.46%] left-0 top-[23.82%] w-[96.673px]">
              <Image
                src={imgVector2}
                alt="Untitled"
                width={97}
                height={24}
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.auth.login(email, password);
      // Redirect to the intended page or dashboard
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
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
          <div className="flex h-24 items-start p-8 relative w-full">
            <Logo className="flex items-start relative shrink-0" />
          </div>

          {/* Form Content */}
          <div className="flex flex-col items-center px-8 py-0 relative w-full">
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
              <form onSubmit={handleLogin} className="flex flex-col gap-6 items-center relative rounded-xl w-full">
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
                          inputWrapper: "border-[#d5d7da] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]",
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
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full"
                        classNames={{
                          input: "text-base text-[#717680]",
                          inputWrapper: "border-[#d5d7da] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]",
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
                    className="bg-[#7f56d9] text-white font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] w-full"
                    size="lg"
                    isLoading={loading}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                  <Button
                    variant="bordered"
                    className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] w-full"
                    startContent={<GoogleIcon />}
                    size="lg"
                  >
                    Sign in with Google
                  </Button>
                </div>
              </form>

              {/* Sign up link */}
              <div className="flex gap-1 items-start justify-center relative w-full">
                <p className="font-normal leading-5 text-[#535862] text-sm">
                  Don't have an account?
                </p>
                <Link href="/signup">
                  <Button
                    variant="light"
                    className="text-[#6941c6] font-semibold text-sm p-0 min-w-0 h-auto"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex h-24 items-end p-8 relative w-full">
            <p className="font-normal leading-5 text-[#535862] text-sm">
              © Untitled UI 2077
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
            <Logomark size="lg" className="flex items-start relative" />
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
          <form onSubmit={handleLogin} className="flex flex-col gap-6 items-center relative rounded-xl w-full">
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
                      inputWrapper: "border-[#d5d7da] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]",
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
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    classNames={{
                      input: "text-base text-[#717680]",
                      inputWrapper: "border-[#d5d7da] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]",
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
                className="bg-[#7f56d9] text-white font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] w-full"
                size="lg"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <Button
                variant="bordered"
                className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] w-full"
                startContent={<GoogleIcon />}
                size="lg"
              >
                Sign in with Google
              </Button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="flex flex-col items-center relative w-full">
            <div className="flex gap-1 items-start justify-center relative w-full">
              <p className="font-normal leading-5 text-[#535862] text-sm">
                Don't have an account?
              </p>
              <Link href="/signup">
                <Button
                  variant="light"
                  className="text-[#6941c6] font-semibold text-sm p-0 min-w-0 h-auto"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

