"use client";

import { School, GraduationCap, ShieldCheck, Check } from "lucide-react";

const solutions = [
  {
    badge: {
      icon: School,
      text: "Học sinh",
      color: "blue",
    },
    title: "Học nhanh hơn, vui hơn mỗi ngày",
    description:
      "Adapt biến việc học thành một hành trình thú vị. Không còn áp lực, chỉ còn niềm vui khám phá với lộ trình riêng biệt và phần thưởng hấp dẫn.",
    features: [
      "Giao diện thân thiện, dễ sử dụng",
      "Theo dõi tiến độ cá nhân chi tiết",
      "Hệ thống huy hiệu và bảng xếp hạng",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiZG_xB06bAH6HER24cy2ClH4krNCBOpmVqh2BI5pOQNSexc9m7HL5nubLLNxkKMx5rBGnB4wSa7kJ629rnJlQe_YB63oO-T7zU-NyQ0HgwqpWdNZ5NCN6J4wyhZF2kjNDKmQ__gGWFAGmTl4Su_yPg1CRhbDoyWo5o8rAZk9qIFUfdrA8skcsxMu9muWhQXhsa5rBb4APeKP42RtLWTMGvn4C_ouTZD5EnmclLn2GR996Sc3ZE5gcDucU_ekkoviaN96WNOKRHpo",
    gradient: "from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30",
    order: "reverse",
  },
  {
    badge: {
      icon: GraduationCap,
      text: "Giáo viên",
      color: "purple",
    },
    title: "Dạy thông minh, giảm tải áp lực",
    description:
      "Giáo viên có cái nhìn toàn cảnh về lớp học. Hệ thống tự động chấm điểm và gợi ý can thiệp sư phạm kịp thời cho những học sinh cần giúp đỡ.",
    features: [
      "Dashboard phân tích thời gian thực",
      "Tự động hóa giao bài tập về nhà",
      "Báo cáo chi tiết từng kỹ năng",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBa63h99_enzqAHBqiqf7cPNyK6przwIDUz6Lc579M3ctU601omX9_R_lcPqYfYyaISAF9BPzfqkfngiEZUpXKabtvfhbAJYf95m1e-E9DyUyVd3QGuHyQqu3xDCxkq77Xo4zqyc8RbRBDSc4fVijc6LHEiNNE9pHEUZnBl64uBWelg2cGCA-udYA0omugTxFOCH-VHs1p_3sKAjs3LJj4_UGfmqRYsBP9Fh_81V499jTvEfO-6rjVTIs4O5iAYvFue2aeHklxDb9E",
    gradient: "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30",
    order: "normal",
  },
  {
    badge: {
      icon: ShieldCheck,
      text: "Quản trị viên",
      color: "orange",
    },
    title: "Quản lý hệ thống dễ dàng, minh bạch",
    description:
      "Kiểm soát toàn bộ hệ thống từ một nơi duy nhất. Quản lý người dùng, nội dung chương trình và theo dõi hiệu suất toàn trường.",
    features: [
      "Phân quyền người dùng đa cấp độ",
      "Tích hợp API với LMS hiện có",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAb5Sc80Zg44_sJsz3pXQtHHBidG5e-WBYxscN6nrMQpuFMpPhFAShBhsHY036PbH3vn7VgQvj3ck6V_XCzwUQT99hbcwnCcyyQsFmlpGDIsZ10NTWIUDRc0Tk__6UdeFGmnRnMCpzXHabcpqJRX3pVYcc1_e9BheZc9I06BZdjveTsmI4Lqr5j9C0Tpng-AFhk6puBTTuSWYAzFu-AI1YZgqVIGkY1PbQczQ-Zv-44V8b8WHG1KV5DFVZjXUeo0tEYkWr98C_GwHA",
    gradient: "from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30",
    order: "reverse",
  },
];

const badgeColors = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
};

export function SolutionsSection() {
  return (
    <section
      className="py-24 bg-background-soft dark:bg-slate-900 overflow-hidden"
      id="solutions"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-32">
        {solutions.map((solution, idx) => {
          const BadgeIcon = solution.badge.icon;
          const isReverse = solution.order === "reverse";

          return (
            <div
              key={idx}
              className={`flex flex-col lg:flex-row items-center gap-16 ${
                isReverse ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="w-full lg:w-1/2 relative order-2 lg:order-1">
                <div
                  className={`absolute -inset-4`}
                ></div>
                <div className="relative overflow-hidden">
                  <div
                    className="aspect-[4/3] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${solution.image}')` }}
                  ></div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <div
                  className={`inline-flex items-center gap-2 rounded-lg ${badgeColors[solution.badge.color as keyof typeof badgeColors]} px-3 py-1 text-sm font-semibold mb-6`}
                >
                  <BadgeIcon className="w-5 h-5" />
                  {solution.badge.text}
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                  {solution.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                  {solution.description}
                </p>
                <ul className="space-y-4">
                  {solution.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-1">
                        <Check className="w-4 h-4 font-bold" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

