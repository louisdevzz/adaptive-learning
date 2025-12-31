"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    rating: 5,
    text: "Adapt thực sự đã thay đổi cách con tôi học. Bé hứng thú hơn rất nhiều và tiến bộ rõ rệt trong các môn khoa học.",
    author: "Nguyễn Thị Mai",
    role: "Phụ huynh học sinh",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDI4ql-wUvnZNLb7IPC3WH1TH5DKTDsksUPx9nXpD5j-PrNDFLkfmPPkVpK0heK-5DMju9MLt0kGx89kB1y5kbbkVlGYH63JwBjucG23LV5pghm36X8FHyOXeTCsIRkCq6iv6VNjiSF7jijw-SZ8sfzBUbNNN8z_HrYYFqxFCc2Imk9I2iy7n4CjjV6iIKOMZfwilue-rW2Cd_vLy7rb910Hs7Lri4IQIHXlwshO5WanwP5De85r-I6Wy4gkrNBS6YmD-Vq58a5RCc",
  },
  {
    rating: 4.5,
    text: "Là một giáo viên, tôi thấy Adapt là công cụ hỗ trợ đắc lực. Việc cá nhân hóa lộ trình học giúp tôi quản lý lớp học hiệu quả hơn.",
    author: "Trần Văn Hùng",
    role: "Giáo viên Toán",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIPXj-bpy8RaRlLAKt-Z1PQGwKuhN2lsXoYMr65oEdWuB3P19tNcqpJFyLpTZBYjuZWMq8BFAyL82FMcrVfkb6fm2NJf4Ti7Z4Y3ZwAYAh0p8EFCRpnoUvabpgpcVU1IduoXleNfrv1ve3VCi1IbAuPxm4lJ-Dx1Jj3JVK_3d62_mvWfMxnTAuCl3kGdspPpQzpG8xlElu8ON9RkYu7i0ObuQuh2jlus4om0WsAtz6WIhYe6KD2C0R-l-81eK0IlvyfB9OlCBBv3g",
  },
  {
    rating: 5,
    text: "Hệ thống báo cáo của Adapt cực kỳ chi tiết, giúp ban giám hiệu chúng tôi đưa ra quyết định chiến lược nhanh chóng.",
    author: "Lê Thúy Nga",
    role: "Quản lý trường học",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDtb6RTldBvl_Udkf3RWKGFqe_MPPil8VOhd4uAZPCxKlaT-UmZUCSsiOOb_jSVWRe0cFIUWqG4VPrYHeER7DBpX5LQLdoLaGeZSuTUYGjW-ZOhl3m8K8GZvfDZZto-4QtT15gN5FteHeLmgKKj5TbN-hd4PC2KO0CpOW_dUENorDbPx6q7pWmSXcpZbXYsLlgHYThAwRhIsBFVzL3IkKhUIRUbsIvMJZW2OB7RqQbGAgKbanxoMfntQTl4hqDn8McE8_HVqewZVzU",
  },
  {
    rating: 5,
    text: "Em thích học trên Adapt vì có nhiều trò chơi và phần thưởng. Mỗi ngày học đều là một thử thách mới!",
    author: "Phạm Minh Anh",
    role: "Học sinh lớp 8",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB6RhyffglQA078cJAzm6xrXog0_i3FuYm_KN8mzI3CMiAJlit0pDbKG-8Ch98cDcPSDcXq6HCmYVXGmQnjCSpkGVpkTaqR_YdW4lNLnnf_yuLQkCasTdCCJqOjDkKQLkkiztkTilRv-R009yUndI79-Lq1FK5aEw6mT5HMpH6iCDrWRk4OwySSnJiFh1sbaQHLcLCv3g1hV1s5cPiuxHZYZtSG3qzYuozfd0EOC1iZEXXyp3zrLglnDFZgbVYbMGVHie8vS3HLTHA",
  },
  {
    rating: 4.5,
    text: "Việc theo dõi tiến độ học tập của từng học sinh chưa bao giờ dễ dàng đến thế. Tôi có thể can thiệp kịp thời hơn.",
    author: "Hoàng Kim Chi",
    role: "Giáo viên Ngữ văn",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAaTyJNl0Dtj1GIF2wPT5b7av_uMRYvGHim89NJHKvkLDWQFi9c3OkAiSCwAuikP4sLUE7oiVOQTs1-_VdaWLPdfxAXQZtz4K2UzsPqtyW6xxFYg5INfPWZdtUji0HDxHG7QJrAaAdLc8c9WeqOYBFzer8TfftGS9P9E62-D5TPLQMnUTxMG-k5LLevW-SHsbv9Ppbuy-FceZogLhrKv-UXJrj8xZ9kgyqZ_JXVRMbolyIk5y_8H6DGrMORJlinZU8ZCAwNE0GdgTw",
  },
  {
    rating: 5,
    text: "Adapt giúp trường chúng tôi tối ưu hóa việc phân bổ tài nguyên và đánh giá chất lượng dạy học một cách khoa học.",
    author: "Phạm Quốc Việt",
    role: "Hiệu trưởng trường THCS",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCexuztHYLxtEjYbkVqzt-kY4laUmB6R2xg2cBVe2LUW15GK5beoJWJM7pNALJm2pKhhJ1ElUXp04uHvQ0UVZ4iKBIC9Y_CWyV7jvGSD1ITUwzGQFiKQhYkFHXNuty-bb0fWRlXFmFmMVs7JI4JRCV0kKrChQ-utFrO7memvGNLh4iIsJ6bx0U04KeC6CUMuONCJ2W0nQnpVVZYLbKmlPD3kF9F8QY5Y6BXdqQN_1JG9CpT6QPcJCCN21rukL-pnhGP67cxI0DJfKI",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-white dark:bg-background-dark" id="feedback">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold text-primary uppercase tracking-wide">
            Phản hồi từ cộng đồng
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Những gì người dùng nói về chúng tôi
          </p>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Xem cách Adapt đã giúp hàng ngàn học sinh và giáo viên trên khắp cả nước.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(testimonial.rating)
                          ? "fill-current"
                          : i < testimonial.rating
                          ? "fill-current opacity-50"
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 text-balance">
                  "{testimonial.text}"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <img
                  alt={testimonial.author}
                  className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
                  src={testimonial.avatar}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

