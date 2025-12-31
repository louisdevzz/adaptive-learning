"use client";

export function TrustedBySection() {
  return (
    <section className="py-10 border-y border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-500 mb-8">
          Được tin dùng bởi các tổ chức giáo dục hàng đầu
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="text-xl font-bold text-slate-700 dark:text-slate-300">EduTech</span>
          <span className="text-xl font-bold text-slate-700 dark:text-slate-300">UniSmart</span>
          <span className="text-xl font-bold text-slate-700 dark:text-slate-300">LearnOS</span>
          <span className="text-xl font-bold text-slate-700 dark:text-slate-300">FutureSch</span>
          <span className="text-xl font-bold text-slate-700 dark:text-slate-300">GlobalAcad</span>
        </div>
      </div>
    </section>
  );
}

