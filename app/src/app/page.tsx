'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo & Title */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-blue-600">
              🎓 PiStudy
            </h1>
            <p className="text-2xl text-gray-700 font-medium">
              AI Adaptive Learning Platform
            </p>
            <p className="text-lg text-gray-600 max-w-2xl">
              Hệ thống học tập thích ứng với AI - Cá nhân hóa lộ trình học tập của bạn
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl">
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pi-Map</h3>
              <p className="text-gray-600">
                Bản đồ tri thức trực quan hóa kiến thức và sự phụ thuộc
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Tutor</h3>
              <p className="text-gray-600">
                Gia sư AI cá nhân hóa hỗ trợ học tập 24/7
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600">
                Theo dõi tiến độ và phân tích năng lực học tập
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Link
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-full font-semibold text-lg hover:bg-blue-50 transition"
            >
              Đăng ký ngay
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">1000+</div>
              <div className="text-gray-600 mt-2">Knowledge Points</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">95%</div>
              <div className="text-gray-600 mt-2">Độ chính xác AI</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600 mt-2">Hỗ trợ học tập</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 PiStudy - Adaptive Learning Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
