"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Bắt đầu hành trình học tập của bạn
          </h2>
          <p className="text-lg text-blue-100 mb-10">
            Tham gia cùng hàng nghìn học sinh đang trải nghiệm học tập cá nhân hóa, thích ứng.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="h-14 px-8 rounded-full bg-white text-primary text-base font-semibold shadow-xl hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group"
            >
              Bắt đầu học
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="h-14 px-8 flex justify-center items-center rounded-full bg-white/10 text-white border border-white/20 text-base font-semibold hover:bg-white/20 transition-all duration-300"
            >
              <span>Tìm hiểu thêm</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
