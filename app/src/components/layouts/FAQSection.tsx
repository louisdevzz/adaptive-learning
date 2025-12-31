"use client";

import { Search } from "lucide-react";

const faqs = [
  {
    question: "Adapt hoạt động như thế nào?",
    answer:
      "Adapt sử dụng trí tuệ nhân tạo để phân tích năng lực và tiến độ học tập của từng học sinh, sau đó tự động điều chỉnh nội dung và lộ trình học tập cá nhân hóa. Điều này giúp học sinh tập trung vào những kiến thức cần cải thiện và phát triển tối đa tiềm năng.",
  },
  {
    question: "Adapt có phù hợp với mọi cấp học không?",
    answer:
      "Hiện tại, Adapt được thiết kế tối ưu cho cấp THCS và THPT. Chúng tôi đang phát triển để mở rộng ra các cấp học khác trong tương lai gần.",
  },
  {
    question: "Tôi có thể dùng thử Adapt miễn phí không?",
    answer:
      "Có, chúng tôi cung cấp gói dùng thử miễn phí cho các lớp học nhỏ hoặc cá nhân. Bạn có thể đăng ký trực tiếp trên trang web của chúng tôi để trải nghiệm các tính năng cơ bản.",
  },
  {
    question: "Làm thế nào để tích hợp Adapt với hệ thống LMS hiện có của trường tôi?",
    answer:
      "Adapt hỗ trợ tích hợp qua API với hầu hết các hệ thống LMS phổ biến. Vui lòng liên hệ đội ngũ hỗ trợ của chúng tôi để được tư vấn chi tiết về quy trình tích hợp.",
  },
  {
    question: "Dữ liệu học sinh có được bảo mật không?",
    answer:
      "Chúng tôi cam kết bảo mật tuyệt đối dữ liệu học sinh theo các tiêu chuẩn cao nhất. Tất cả thông tin đều được mã hóa và tuân thủ các quy định về quyền riêng tư.",
  },
];

const categories = ["Tính năng", "Tài khoản", "Thanh toán", "Tích hợp", "Bảo mật"];

export function FAQSection() {
  return (
    <section className="py-24 bg-background-soft dark:bg-slate-900" id="faq">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold text-primary uppercase tracking-wide">
            Hỗ trợ
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Câu hỏi thường gặp
          </p>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Tìm câu trả lời cho những thắc mắc phổ biến nhất của bạn về Adapt.
          </p>
        </div>

        <div className="relative w-full mb-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
            placeholder="Tìm kiếm câu hỏi..."
            type="text"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {categories.map((category, idx) => (
            <button
              key={idx}
              className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`pb-6 ${
                idx < faqs.length - 1
                  ? "border-b border-slate-200 dark:border-slate-700"
                  : ""
              }`}
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
