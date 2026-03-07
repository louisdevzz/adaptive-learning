"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 -z-20 h-full w-full bg-white dark:bg-background-dark"></div>
      <div className="absolute top-0 right-0 -z-10 w-[50%] h-[70%] bg-gradient-to-bl from-[#E8F4FF]/50 to-transparent blur-3xl opacity-60 rounded-bl-full pointer-events-none dark:from-[#0085FF]/10"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[40%] h-[60%] bg-gradient-to-tr from-cyan-50/50 to-transparent blur-3xl opacity-60 rounded-tr-full pointer-events-none dark:from-cyan-900/20"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 max-w-2xl lg:max-w-none text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8F4FF] bg-[#F0F8FF]/50 px-4 py-1.5 text-sm font-medium text-[#0066CC] mb-8 dark:border-[#0066CC]/40 dark:bg-[#0085FF]/10 dark:text-[#00AAFF] backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00AAFF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F0F8FF]0"></span>
              </span>
              AI Learning Platform 2.0
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-[4rem] lg:leading-[1.1] dark:text-white text-balance">
              Nâng tầm giáo dục với{" "}
              <span className="relative whitespace-nowrap text-primary">
                <span className="relative z-10 text-[#0085FF]">Adaptive AI</span>
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 -z-10 h-3 w-full text-[#E8F4FF] dark:text-blue-900"
                  preserveAspectRatio="none"
                  viewBox="0 0 200 9"
                >
                  <path
                    d="M2.00025 6.99996C23.3621 3.52296 82.597 0.992293 197.999 2.00035"
                    pathLength="1"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="3"
                  ></path>
                </svg>
              </span>
            </h1>

            <p className="mt-8 text-xl leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0">
              Nền tảng học tập thông minh tự động điều chỉnh lộ trình theo năng lực cá nhân, giúp học sinh tiếp thu kiến thức nhanh hơn 3.5x.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/login"
                className="h-14 px-8 rounded-full bg-[#0085FF] text-white text-base font-semibold shadow-xl shadow-[#0085FF]/20 hover:bg-[#0066CC] hover:shadow-[#0085FF]/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                Trải nghiệm miễn phí
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="h-14 px-8 rounded-full bg-white text-slate-700 border border-slate-200 text-base font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center dark:bg-white/5 dark:border-slate-700 dark:text-white dark:hover:bg-white/10">
                <PlayCircle className="w-5 h-5 text-primary" />
                Xem Demo
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-slate-100 pt-8 dark:border-slate-800">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">500+</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Trường học</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">1M+</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Học viên</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">98%</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Hài lòng</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <div className="relative w-full aspect-[4/3] max-w-[650px] mx-auto lg:ml-auto">
              <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-transform hover:scale-[1.01] duration-500">
                <div className="absolute top-0 inset-x-0 h-10 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex items-center px-4 gap-2 z-20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  </div>
                </div>
                <div className="absolute inset-0 top-10 bg-slate-50 dark:bg-slate-900">
                  <div
                    className="w-full h-full bg-cover bg-top"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUaBQ_7NqZWCFZNNOfKwJaa1aLJoXPhKVn4TqRRDCpyv0iROgByoYdeRKVel5y2ItlJ9EgsCc6zi73cJuDMoL_XwqFJxSMw2-HnKltY3o3__CTl34K5PYzaehfxUH_c2cf1sGOHKorstStxGxZAlWuvxhbh8_dgwVe3dIunzlUZqz62dPscIyxLSqXoR6HQ2XpJduxaIGPqTTVkQX8qAFTxPDcdQB3l44cmuV257LTWHzbgn5u6TwORoAD9YKzFkUfJ7TA-LUDfiw')",
                    }}
                  ></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
              </div>

              <div className="absolute -left-12 top-1/4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 w-48 animate-[bounce_4s_infinite]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tiến độ</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">+125%</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 bottom-12 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 w-52 animate-[bounce_5s_infinite]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8F4FF] text-[#0085FF] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Gợi ý AI</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Ôn tập Toán Logic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
