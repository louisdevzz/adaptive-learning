"use client";

import {
  ClipboardCheck,
  BarChart3,
  Zap,
  BookOpen,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    Icon: ClipboardCheck,
    name: "Lộ trình học tập cá nhân hóa",
    description: "Mỗi học sinh nhận được hành trình học tập tùy chỉnh dựa trên mức độ nắm vững, tốc độ học và khoảng trống kiến thức. Hệ thống thích ứng theo thời gian thực để tối ưu tiến độ của bạn.",
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: BarChart3,
    name: "Theo dõi mức độ nắm vững thời gian thực",
    description: "Theo dõi sự hiểu biết của bạn về mỗi điểm kiến thức với công cụ mastery tiên tiến. Nhận phản hồi tức thì về tiến độ và xác định các lĩnh vực cần luyện tập thêm.",
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: BookOpen,
    name: "Điểm kiến thức có cấu trúc",
    description: "Nội dung được chia nhỏ thành các điểm kiến thức dễ tiêu hóa, giúp các môn học phức tạp dễ hiểu và nắm vững hơn. Mỗi điểm xây dựng dựa trên kiến thức trước đó.",
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: Zap,
    name: "Đề xuất thông minh bằng AI",
    description: "Công cụ đề xuất phân tích mô hình học tập của bạn và gợi ý nội dung tốt nhất để học tiếp theo, đảm bảo bạn luôn học ở mức độ khó tối ưu.",
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: CheckCircle,
    name: "Đánh giá thích ứng",
    description: "Làm các bài đánh giá tự động điều chỉnh theo trình độ của bạn. Câu hỏi trở nên khó hơn khi bạn tiến bộ, đảm bảo bạn luôn được thử thách phù hợp.",
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: TrendingUp,
    name: "Phân tích tiến độ",
    description: "Bảng điều khiển toàn diện cho học sinh, giáo viên và phụ huynh. Theo dõi tốc độ học tập, xác định điểm mạnh và điểm yếu, và ghi nhận thành tích.",
    className: "col-span-3 lg:col-span-1",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white flex flex-col gap-16 items-center overflow-clip px-0 py-24 relative w-full">
      <div className="flex flex-col items-start px-8 py-0 w-full max-w-[1280px]">
        <div className="flex flex-col items-center relative w-full">
          <div className="flex flex-col gap-5 items-center relative w-[768px] text-center">
            <div className="flex flex-col font-semibold gap-3 items-start relative w-full">
              <div className="w-full">
                <div className="leading-6 flex items-center justify-center relative text-base text-center">
                  <p className="w-46 text-sm bg-[#f9f5ff] px-3 py-1 rounded-2xl text-[#6941c6] border border-[#e9d7feb1] border-solid">
                    Tính năng
                  </p>
                </div>
              </div>
              <h2 className="leading-[48px] text-[#181d27] text-[32px] tracking-[-0.64px] w-full text-center">
                Học tập thích ứng với tốc độ của bạn
              </h2>
            </div>
            <p className="font-normal leading-[28px] text-[#535862] text-lg w-full">
              Trải nghiệm giáo dục được điều chỉnh theo phong cách học tập độc đáo của bạn. Nền tảng của chúng tôi sử dụng các thuật toán tiên tiến để tạo ra trải nghiệm học tập cá nhân hóa tối đa hóa tiềm năng của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start px-8 py-0 w-full max-w-[1280px]">
        <BentoGrid className="lg:grid-rows-2 auto-rows-[16rem] gap-6">
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

