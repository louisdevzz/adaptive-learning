"use client";

import Link from "next/link";
import { School } from "lucide-react";

const footerLinks = {
  "Sản phẩm": ["Tính năng", "Dành cho Giáo viên", "Dành cho Học sinh"],
  "Hỗ trợ": ["Câu hỏi thường gặp", "Tài liệu", "Hướng dẫn", "Trạng thái"],
  "Công ty": ["Về chúng tôi", "Blog", "Tuyển dụng"],
  "Pháp lý": ["Quyền riêng tư", "Điều khoản"],
};

export function Footer() {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Adapt" className="w-8 object-cover" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">Adapt</span>
            </div>
            <p className="text-sm leading-6 text-slate-500 max-w-xs">
              Nền tảng giáo dục thông minh giúp định hình tương lai của việc học tập thông qua
              AI và dữ liệu.
            </p>
            <div className="flex space-x-5">
              <a
                className="text-slate-400 hover:text-primary transition-colors"
                href="#"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    clipRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </a>
              <a
                className="text-slate-400 hover:text-primary transition-colors"
                href="#"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                  Sản phẩm
                </h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks["Sản phẩm"].map((link, idx) => (
                    <li key={idx}>
                      <a
                        className="text-sm leading-6 text-slate-500 hover:text-primary transition-colors"
                        href="#"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                  Hỗ trợ
                </h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks["Hỗ trợ"].map((link, idx) => (
                    <li key={idx}>
                      <a
                        className="text-sm leading-6 text-slate-500 hover:text-primary transition-colors"
                        href={link === "Câu hỏi thường gặp" ? "#faq" : "#"}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                  Công ty
                </h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks["Công ty"].map((link, idx) => (
                    <li key={idx}>
                      <a
                        className="text-sm leading-6 text-slate-500 hover:text-primary transition-colors"
                        href="#"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                  Pháp lý
                </h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks["Pháp lý"].map((link, idx) => (
                    <li key={idx}>
                      <a
                        className="text-sm leading-6 text-slate-500 hover:text-primary transition-colors"
                        href="#"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800 py-8 text-center">
        <p className="text-xs leading-5 text-slate-400">
          © 2025 Adapt Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
