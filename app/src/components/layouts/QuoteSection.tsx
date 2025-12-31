"use client";

import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

// Mock data cho quotes
const quotes = [
  {
    name: "Nguyễn Thị Lan",
    role: "Giáo viên Toán học, Trường THPT Lê Hồng Phong",
    body: "Nền tảng này đã thay đổi cách học sinh của tôi học tập. Các lộ trình cá nhân hóa giúp mỗi học sinh tiến bộ theo tốc độ riêng của mình.",
  },
  {
    name: "Trần Văn Minh",
    role: "Giáo viên Vật lý, Trường THCS Nguyễn Du",
    body: "Học sinh của tôi học nhanh hơn 30% và hiểu sâu hơn nhờ hệ thống theo dõi mastery. Đây là tương lai của giáo dục.",
  },
  {
    name: "Lê Thị Hoa",
    role: "Phụ huynh học sinh",
    body: "Con tôi yêu thích học tập hơn nhiều với nền tảng này. Tôi có thể theo dõi tiến độ của con mọi lúc mọi nơi.",
  },
  {
    name: "Phạm Đức Anh",
    role: "Hiệu trưởng, Trường THPT Chuyên Lê Hồng Phong",
    body: "Hệ thống đề xuất AI thực sự thông minh. Nó luôn biết học sinh cần học gì tiếp theo để đạt kết quả tốt nhất.",
  },
  {
    name: "Hoàng Thị Mai",
    role: "Học sinh lớp 10, Trường THPT Lê Hồng Phong",
    body: "Tôi thích cách nền tảng chia nhỏ kiến thức thành các điểm nhỏ. Điều này giúp tôi học hiệu quả hơn rất nhiều.",
  },
  {
    name: "Võ Minh Tuấn",
    role: "Giáo viên Hóa học, Trường THPT Nguyễn Huệ",
    body: "Bảng điều khiển phân tích tiến độ giúp tôi nhanh chóng xác định học sinh nào cần hỗ trợ thêm. Rất hữu ích!",
  },
  {
    name: "Đỗ Thị Hương",
    role: "Phụ huynh học sinh",
    body: "Tôi có thể xem báo cáo chi tiết về tiến độ học tập của con. Điều này giúp tôi hỗ trợ con tốt hơn.",
  },
  {
    name: "Lương Văn Đức",
    role: "Học sinh lớp 11, Trường THPT Chuyên Lê Hồng Phong",
    body: "Các bài đánh giá thích ứng thực sự thử thách tôi đúng mức. Tôi cảm thấy mình tiến bộ rõ rệt mỗi ngày.",
  },
];

const firstRow = quotes.slice(0, Math.ceil(quotes.length / 2));
const secondRow = quotes.slice(Math.ceil(quotes.length / 2));

const ReviewCard = ({
  name,
  role,
  body,
}: {
  name: string;
  role: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-6",
        // light styles
        "border-gray-950/[.1] bg-white hover:bg-gray-50/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-col gap-3">
        <blockquote className="text-sm leading-6 text-[#181d27] dark:text-white">
          "{body}"
        </blockquote>
        <div className="flex flex-col gap-1">
          <figcaption className="text-sm font-medium text-[#181d27] dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-normal text-[#535862] dark:text-white/60">
            {role}
          </p>
        </div>
      </div>
    </figure>
  );
};

export function QuoteSection() {
  return (
    <section className="bg-neutral-50 flex flex-col items-center overflow-clip px-0 py-24 relative w-full">
      <div className="flex flex-col items-start px-8 py-0 w-full max-w-[1280px]">
        <div className="flex flex-col items-center relative w-full">
          <div className="flex flex-col gap-12 items-center relative w-full">
            {/* Section Title */}
            <div className="flex flex-col gap-2 items-center">
              <h2 className="font-semibold font-dinMedium leading-[48px] text-[#181d27] text-[32px] tracking-[-0.64px] text-center">
                Những gì người dùng nói về chúng tôi
              </h2>
              <p className="font-normal leading-[28px] text-[#535862] text-lg text-center max-w-2xl">
                Hàng nghìn giáo viên, học sinh và phụ huynh đã tin tưởng nền tảng của chúng tôi
              </p>
            </div>

            {/* Marquee với 2 hàng */}
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
              <Marquee pauseOnHover className="[--duration:20s]">
                {firstRow.map((review, index) => (
                  <ReviewCard key={`first-${index}`} {...review} />
                ))}
              </Marquee>
              <Marquee reverse pauseOnHover className="[--duration:20s]">
                {secondRow.map((review, index) => (
                  <ReviewCard key={`second-${index}`} {...review} />
                ))}
              </Marquee>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/10 bg-gradient-to-r from-neutral-50"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/10 bg-gradient-to-l from-neutral-50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

