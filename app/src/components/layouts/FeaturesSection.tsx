"use client";

import { Brain, MemoryStick, BarChart3, Gamepad2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive Learning",
    description: "AI phân tích và đề xuất lộ trình học tập cá nhân hóa tự động dựa trên năng lực.",
    color: "blue",
  },
  {
    icon: MemoryStick,
    title: "Smart KP Engine",
    description: "Hệ thống Knowledge Points thông minh giúp xác định chính xác lỗ hổng kiến thức.",
    color: "cyan",
  },
  {
    icon: BarChart3,
    title: "Real-time Data",
    description: "Báo cáo dữ liệu trực quan theo thời gian thực cho giáo viên và quản trị viên.",
    color: "indigo",
  },
  {
    icon: Gamepad2,
    title: "Gamification",
    description: "Học qua trò chơi nhỏ (micro-learning) giúp tăng hứng thú và khả năng ghi nhớ.",
    color: "purple",
  },
];

const colorClasses = {
  blue: "bg-blue-100 dark:bg-blue-900/50 text-primary",
  cyan: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600",
  indigo: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600",
  purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-600",
};

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white dark:bg-background-dark" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold text-primary uppercase tracking-wide">
            Giá trị cốt lõi
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Tính năng mạnh mẽ cho giáo dục
          </p>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Công nghệ Adaptive Learning giúp tối ưu hóa từng điểm chạm trong hành trình học tập.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="relative p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100 group dark:hover:bg-slate-800 dark:hover:border-slate-700"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
