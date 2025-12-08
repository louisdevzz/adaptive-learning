"use client";

import Image from "next/image";

const imgImage = "https://www.figma.com/api/mcp/asset/90e2bf62-ebc5-44fb-a0bc-56c744e6ffa0";

const metrics = [
  {
    value: "10,000+",
    title: "Học sinh đang học",
    description: "Tham gia cùng hàng nghìn học sinh đã học với nền tảng của chúng tôi.",
  },
  {
    value: "40%",
    title: "Học nhanh hơn",
    description: "Học sinh học nhanh hơn 20-40% với lộ trình thích ứng cá nhân hóa.",
  },
  {
    value: "500+",
    title: "Điểm kiến thức",
    description: "Thư viện nội dung toàn diện bao phủ nhiều môn học.",
  },
  {
    value: "95%",
    title: "Tỷ lệ hài lòng",
    description: "Học sinh và giáo viên yêu thích phương pháp học tập thích ứng của chúng tôi.",
  },
];

export function MetricsSection() {
  return (
    <section className="bg-white flex flex-col gap-16 items-center overflow-clip px-0 py-24 relative w-full">
      <div className="flex flex-col items-start px-8 py-0 w-full max-w-[1280px]">
        <div className="flex flex-col items-start relative w-full">
          <div className="flex flex-col gap-5 items-start w-[768px]">
            <div className="flex flex-col font-semibold gap-3 items-start relative w-full">
              <p className="leading-6 text-[#6941c6] text-sm w-full">
                Kết quả đã được chứng minh
              </p>
              <h2 className="leading-[48px] text-[#181d27] text-[32px] tracking-[-0.64px] w-full">
                Học nhanh hơn, nhớ lâu hơn
              </h2>
            </div>
            <p className="font-normal leading-[28px] text-[#535862] text-lg w-full">
              Nền tảng học tập thích ứng của chúng tôi đã được chứng minh giảm thời gian học 20-40% đồng thời cải thiện đáng kể khả năng ghi nhớ dài hạn và hiểu biết.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-24 items-center px-8 py-0 w-full max-w-[1280px]">
        <div className="flex flex-[1_0_0] flex-col gap-16 items-start min-h-px min-w-px relative">
          {/* First row */}
          <div className="flex gap-8 items-start relative w-full">
            {metrics.slice(0, 2).map((metric, index) => (
              <div key={index} className="flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative">
                <div className="flex flex-col gap-3 items-start relative w-full">
                  <p className="font-semibold leading-[72px] text-[#7f56d9] text-[60px] text-center tracking-[-1.2px] w-full">
                    {metric.value}
                  </p>
                  <div className="flex flex-col gap-2 items-center text-center w-full">
                    <p className="font-medium leading-6 text-[#181d27] text-base w-full">
                      {metric.title}
                    </p>
                    <p className="font-normal leading-[22px] text-[#535862] text-sm w-full">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second row */}
          <div className="flex gap-8 items-start relative w-full">
            {metrics.slice(2, 4).map((metric, index) => (
              <div key={index + 2} className="flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative">
                <div className="flex flex-col gap-3 items-start relative w-full">
                  <p className="font-semibold leading-[72px] text-[#7f56d9] text-[60px] text-center tracking-[-1.2px] w-full">
                    {metric.value}
                  </p>
                  <div className="flex flex-col gap-2 items-center text-center w-full">
                    <p className="font-medium leading-6 text-[#181d27] text-base w-full">
                      {metric.title}
                    </p>
                    <p className="font-normal leading-[22px] text-[#535862] text-sm w-full">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="aspect-square flex-[1_0_0] min-h-px min-w-px relative">
          <Image
            src={imgImage}
            alt="Metrics visualization"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}

