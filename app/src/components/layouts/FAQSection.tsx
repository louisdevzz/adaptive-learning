"use client";

import { useState } from "react";
import { MinusCircle, PlusCircle } from "lucide-react";

const faqs = [
  {
    question: "Học tập thích ứng hoạt động như thế nào?",
    answer: "Nền tảng của chúng tôi chia nhỏ nội dung thành các điểm kiến thức nhỏ và theo dõi mức độ nắm vững của bạn về từng điểm. Dựa trên hiệu suất của bạn, hệ thống đề xuất nội dung tốt nhất tiếp theo để học, đảm bảo bạn luôn học ở mức độ khó phù hợp để tiến bộ tối ưu.",
    isOpen: true,
  },
  {
    question: "Phụ huynh có thể theo dõi tiến độ của con mình không?",
    answer: "Có! Phụ huynh có quyền truy cập vào bảng điều khiển toàn diện hiển thị tiến độ học tập, mức độ nắm vững, thời gian học tập và các lĩnh vực cần cải thiện của con bạn. Bạn sẽ nhận được cập nhật thường xuyên về hành trình giáo dục của con mình.",
    isOpen: false,
  },
  {
    question: "Hệ thống theo dõi mastery hoạt động như thế nào?",
    answer: "Công cụ mastery phân tích nhiều tín hiệu bao gồm điểm số bài kiểm tra, số lần thử, thời gian hoàn thành bài tập và lịch sử học tập. Nó tính toán điểm mastery cho mỗi điểm kiến thức và cập nhật theo thời gian thực khi bạn học.",
    isOpen: false,
  },
  {
    question: "Có những môn học và khóa học nào?",
    answer: "Nền tảng của chúng tôi hỗ trợ các khóa học trên nhiều môn học bao gồm Toán học, Khoa học, Ngôn ngữ và nhiều hơn nữa. Giáo viên có thể tạo và quản lý nội dung khóa học, tổ chức thành modules, sections và điểm kiến thức để học tập có cấu trúc.",
    isOpen: false,
  },
  {
    question: "Có hỗ trợ cho giáo viên không?",
    answer: "Chắc chắn rồi! Giáo viên có quyền truy cập vào các công cụ mạnh mẽ để tạo nội dung, quản lý lớp học, xem tiến độ học sinh và tạo báo cáo chi tiết. Nền tảng giúp giáo viên xác định học sinh cần hỗ trợ thêm và những học sinh sẵn sàng cho tài liệu nâng cao.",
    isOpen: false,
  },
  {
    question: "Làm thế nào để bắt đầu?",
    answer: "Chỉ cần đăng ký tài khoản, chọn vai trò của bạn (Học sinh, Giáo viên, Phụ huynh hoặc Quản trị viên) và bắt đầu khám phá. Học sinh có thể đăng ký khóa học, giáo viên có thể tạo nội dung và phụ huynh có thể liên kết với tài khoản con mình để theo dõi tiến độ.",
    isOpen: false,
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-white flex flex-col gap-16 items-center overflow-clip px-0 py-24 relative w-full">
      <div className="flex flex-col items-start px-8 py-0 w-full max-w-[1280px]">
        <div className="flex flex-col items-center relative w-full">
          <div className="flex flex-col gap-5 items-center text-center w-[768px]">
            <h2 className="font-semibold leading-[48px] text-[#181d27] text-[32px] tracking-[-0.64px] w-full">
              Câu hỏi thường gặp
            </h2>
            <p className="font-normal leading-[28px] text-[#535862] text-lg w-full">
              Tất cả những gì bạn cần biết về học tập thích ứng và cách nó hoạt động.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center px-8 py-0 w-full max-w-[1280px]">
        <div className="flex flex-col gap-8 items-start relative w-[768px]">
          {faqs.map((faq, index) => (
            <div key={index} className="flex flex-col gap-6 items-center relative w-full">
              {index > 0 && <div className="bg-[#e9eaeb] h-px w-full" />}
              <div className="flex gap-6 items-start relative w-full">
                <div className="flex flex-[1_0_0] flex-col gap-2 items-start min-h-px min-w-px relative pr-4">
                  <p className="font-semibold leading-6 text-[#181d27] text-base w-full">
                    {faq.question}
                  </p>
                  {openIndex === index && faq.answer && (
                    <p className="font-normal leading-[22px] text-[#535862] text-sm w-full mt-1">
                      {faq.answer}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  className="flex flex-col items-start pb-0 pt-0.5 px-0 relative shrink-0"
                >
                  {openIndex === index ? (
                    <MinusCircle className="w-6 h-6 text-[#7f56d9]" />
                  ) : (
                    <PlusCircle className="w-6 h-6 text-[#7f56d9]" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

