"use client";

import { Button } from "@heroui/button";
import Image from "next/image";
import { BookOpen, BarChart3, Zap, ChevronRight } from "lucide-react";

const imgScreenMockupReplaceFill = "https://www.figma.com/api/mcp/asset/85bd9f3e-144c-49ed-9ab5-193820698d2c";
const img10 = "https://www.figma.com/api/mcp/asset/8c061463-89ec-4ce7-ad5e-615fb19010e0";

const features = [
  {
    icon: BookOpen,
    title: "Cấu trúc khóa học",
    description: "Lộ trình học tập có tổ chức từ Khóa học đến Module, Section và Điểm kiến thức. Điều hướng qua nội dung có cấu trúc được thiết kế để hiểu tối ưu.",
  },
  {
    icon: BarChart3,
    title: "Công cụ Mastery",
    description: "Các thuật toán tiên tiến theo dõi sự hiểu biết của bạn theo thời gian thực. Hệ thống liên tục đánh giá mức độ nắm vững và điều chỉnh đề xuất nội dung tương ứng.",
  },
  {
    icon: Zap,
    title: "Đề xuất thông minh",
    description: "Nhận gợi ý cá nhân hóa về những gì cần học tiếp theo dựa trên tiến độ hiện tại, khoảng trống kiến thức và mục tiêu học tập của bạn. Học thông minh hơn, không phải chăm chỉ hơn.",
  },
];

export function FeaturesWithMockupSection() {
  return (
    <section className="bg-white flex flex-col gap-16 items-center overflow-clip px-0 py-24 relative w-full">
      <div className="flex flex-col items-start px-8 py-0 w-full max-w-[1280px]">
        <div className="flex flex-col items-center relative w-full">
          <div className="flex flex-col gap-5 items-center relative w-[768px]">
            <div className="flex flex-col gap-4 items-center relative w-full">
              <div className="flex items-start mix-blend-multiply relative">
                <div className="bg-[#f9f5ff] flex items-center justify-center px-3 py-1 relative rounded-2xl">
                  <p className="font-medium leading-5 text-[#6941c6] text-sm text-center">
                    Tính năng
                  </p>
                </div>
              </div>
              <h2 className="font-semibold leading-[48px] min-w-full text-[#181d27] text-[32px] text-center tracking-[-0.64px] w-min">
                Tính năng tiên tiến cho học tập cá nhân hóa
              </h2>
            </div>
            <p className="font-normal leading-[28px] text-[#535862] text-lg text-center w-full">
              Trải nghiệm tương lai của giáo dục với cá nhân hóa AI, theo dõi mastery thời gian thực và phân phối nội dung thích ứng phù hợp với phong cách học tập của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-24 items-center px-8 py-0 w-full max-w-[1280px]">
        {/* Mockup section */}
        <div className="flex h-[558px] items-start relative w-full">
          <div className="flex-[1_0_0] h-[719px] min-h-px min-w-px relative">
            {/* Desktop mockup */}
            <div className="absolute border-4 border-[#181d27] border-solid h-[512px] left-[272px] rounded-[10px] top-0 w-[768px]">
              <div className="absolute bg-[#181d27] bottom-0 left-7 right-7 shadow-[0px_32px_64px_-12px_rgba(10,13,18,0.14)] top-0" />
              <div className="absolute border border-neutral-100 border-solid inset-0 rounded-[10px]">
                <Image
                  src={imgScreenMockupReplaceFill}
                  alt="Desktop mockup"
                  fill
                  className="object-cover rounded-[10px]"
                />
              </div>
            </div>
            {/* iPhone mockup */}
            <div className="absolute h-[497.34px] left-[152px] top-16 w-[244px]">
              <div className="absolute bg-white inset-[2.23%_5.26%_2.46%_5.02%] overflow-clip">
                <div className="absolute bottom-[-3.94%] left-0 right-0 top-[3.94%]">
                  <Image
                    src={img10}
                    alt="iPhone mockup"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="flex gap-8 items-start relative w-full">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex flex-[1_0_0] flex-col gap-4 items-center min-h-px min-w-px relative px-2">
                <div className="bg-[#f4ebff] border-8 border-[#f9f5ff] border-solid relative rounded-[28px] size-12 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#7f56d9]" />
                </div>
                <div className="flex flex-col gap-2 items-center text-center w-full">
                  <h3 className="font-semibold leading-[28px] text-[#181d27] text-lg w-full">
                    {feature.title}
                  </h3>
                  <p className="font-normal leading-[22px] text-[#535862] text-sm w-full">
                    {feature.description}
                  </p>
                </div>
                <div className="flex items-start relative">
                  <Button
                    variant="light"
                    className="text-[#6941c6] font-semibold"
                    endContent={<ChevronRight className="w-5 h-5" />}
                  >
                    Tìm hiểu thêm
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

