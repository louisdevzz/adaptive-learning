"use client";

import { Play } from "lucide-react";

export function VideoDemoSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white relative isolate overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-primary/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4 sm:text-4xl">
            Xem Adapt hoạt động
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Khám phá cách Adapt thay đổi cách học tập chỉ trong vài phút.
          </p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-slate-900 aspect-video group cursor-pointer">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-60 transition-all duration-500 transform group-hover:scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAxKICN0uGsQyu_u8JTPpFEnBnNVL-cHpMJL7U4ERc-khY6LzLSUK6dU-iGgt8XBGpqgyStEHj_iEgmOZLQHiCWwWsLxImNUgguqAEfp2ONL-80-AqSh8pmilmI95BZPSWm0BKraG2kcAvwBR82RgYxS_IhOyJhBIXh7X3r4-A4PS4WtlfTgg9iktI-RuHnYtktvuIHHvWwh-5-4liKKawPQ1mLjB7uDEdx6aprdG3f5Vnv7HZBThZLMhUneKbLdmFW7B1TCwUOi2w')",
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-300">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-primary shadow-lg">
                <Play className="w-8 h-8 ml-1 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

