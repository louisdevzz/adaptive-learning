"use client";

import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { DottedMap } from "@/components/ui/dotted-map";
import { 
  BookOpen, 
  Target, 
  Brain, 
  Route, 
  Layers, 
  Zap, 
  Sparkles, 
  BarChart3,
  Code2,
  Database,
  Shield,
  Globe
} from "lucide-react";


const coreConcepts = [
  {
    icon: BookOpen,
    title: "Knowledge Point (KP)",
    description: "Knowledge Point là đơn vị kiến thức nhỏ nhất. Mỗi KP đại diện cho một kỹ năng hoặc khái niệm cụ thể, ví dụ: 'Nhân đa thức với đơn thức', 'Định luật Newton 1', 'Phân biệt câu bị động'.",
  },
  {
    icon: Target,
    title: "Mastery",
    description: "Mastery mô tả mức độ hiểu biết của học sinh đối với một KP. Nó được đo bằng nhiều tín hiệu: điểm số bài tập, số lần sai, tốc độ giải, lịch sử học, mức độ khó của câu hỏi đã làm.",
  },
  {
    icon: Route,
    title: "Learning Path",
    description: "Learning Path là lộ trình học động, được hệ thống tự động sắp xếp dựa trên Mastery hiện tại, mục tiêu khóa học và các KP phụ thuộc nhau (dependency graph).",
  },
];

const systemFeatures = [
  {
    icon: Layers,
    title: "Cấu trúc khóa học",
    description: "Course → Module → Section → Knowledge Point. Mỗi lớp được thiết kế để hỗ trợ quản lý nội dung mạch lạc và tái sử dụng nội dung giữa các khóa học.",
  },
  {
    icon: Brain,
    title: "Mastery Engine",
    description: "Trung tâm phân tích dữ liệu học tập. Tính toán mastery score theo thời gian thực, dự đoán KP mà học sinh sẽ gặp khó, cập nhật trạng thái 'Ready to Learn', 'Struggling', 'Mastered'.",
  },
  {
    icon: Sparkles,
    title: "Recommendation Engine",
    description: "Engine gợi ý học tập dựa trên mức độ nắm vững, dependency graph của KP, Learning Path hiện tại và mục tiêu của khóa học. Quyết định bài học tiếp theo, bài tập luyện tập và thời điểm cần kiểm tra lại.",
  },
  {
    icon: BarChart3,
    title: "Assessment Engine",
    description: "Máy chấm điểm & phân tích tự sinh bài tập theo KP, phân cấp độ khó câu hỏi, phân tích lỗi thường gặp và sinh diagnostic report cho học sinh và giáo viên.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white flex flex-col items-center px-8 py-24 relative w-full">
        <div className="flex flex-col gap-6 items-center relative w-full max-w-[1280px]">
          <div className="flex flex-col gap-4 items-center text-center">
            <p className="font-semibold leading-6 text-[#6941c6] text-base">
              Về chúng tôi
            </p>
            <h1 className="font-semibold leading-[60px] text-[#181d27] text-[48px] tracking-[-0.96px]">
              Adaptive Learning Platform
            </h1>
            <p className="font-normal leading-[30px] text-[#535862] text-xl max-w-3xl">
              Nền tảng học tập thông minh được thiết kế để cá nhân hoá hành trình học của từng học sinh. Hệ thống phân rã kiến thức thành các đơn vị nhỏ (Knowledge Points), theo dõi mức độ nắm vững theo thời gian thực và tự động đề xuất nội dung phù hợp với năng lực hiện tại.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="bg-white flex items-start justify-center relative w-full">
        <div className="h-px relative w-full max-w-[1280px]">
          <div className="h-px w-full bg-[#e9eaeb]" />
        </div>
      </div>

      {/* Abstract Section */}
      <section className="bg-white flex flex-col items-center px-8 py-24 relative w-full">
        <div className="flex flex-col gap-12 items-start relative w-full max-w-[1280px]">
          <div className="flex flex-col gap-4 items-start w-full">
            <h2 className="font-semibold leading-[44px] text-[#181d27] text-[36px] tracking-[-0.72px]">
              Tổng quan
            </h2>
            <p className="font-normal leading-[30px] text-[#535862] text-xl max-w-4xl">
              Adaptive Learning Platform là hệ thống cá nhân hóa học tập dựa trên phân rã kiến thức, mô hình dự đoán và theo dõi năng lực theo thời gian thực. Hệ thống được thiết kế để giúp mỗi học sinh nhận được lộ trình học phù hợp với năng lực và tốc độ riêng. Bằng cách sử dụng kiến trúc Course → Module → Section → Knowledge Point và mô hình Mastery Tracking, nền tảng cung cấp khả năng đánh giá, gợi ý học tập và điều chỉnh nội dung một cách tự động nhằm tối ưu hiệu quả học tập.
            </p>
          </div>
        </div>
      </section>

      {/* Core Concepts Section */}
      <section className="bg-white flex flex-col items-center px-8 py-24 relative w-full">
        <div className="flex flex-col gap-16 items-start relative w-full max-w-[1280px]">
          <div className="flex flex-col gap-4 items-start">
            <p className="font-semibold leading-6 text-[#6941c6] text-base">
              Khái niệm cốt lõi
            </p>
            <h2 className="font-semibold leading-[44px] text-[#181d27] text-[36px] tracking-[-0.72px]">
              Nền tảng của hệ thống
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {coreConcepts.map((concept, index) => {
              const Icon = concept.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col gap-4 items-start p-6 rounded-xl border border-[#e9eaeb] bg-white hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#f9f5ff]">
                    <Icon className="w-6 h-6 text-[#6941c6]" />
                  </div>
                  <h3 className="font-semibold leading-7 text-[#181d27] text-lg">
                    {concept.title}
                  </h3>
                  <p className="font-normal leading-6 text-[#535862] text-base">
                    {concept.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* System Architecture Section */}
      <section className="bg-[#f9fafb] flex flex-col items-center px-8 py-24 relative w-full">
        <div className="flex flex-col gap-16 items-start relative w-full max-w-[1280px]">
          <div className="flex flex-col gap-4 items-start">
            <p className="font-semibold leading-6 text-[#6941c6] text-base">
              Kiến trúc hệ thống
            </p>
            <h2 className="font-semibold leading-[44px] text-[#181d27] text-[36px] tracking-[-0.72px]">
              Các thành phần chính
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {systemFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col gap-4 items-start p-8 rounded-xl bg-white border border-[#e9eaeb]"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#f9f5ff]">
                    <Icon className="w-6 h-6 text-[#6941c6]" />
                  </div>
                  <h3 className="font-semibold leading-7 text-[#181d27] text-lg">
                    {feature.title}
                  </h3>
                  <p className="font-normal leading-6 text-[#535862] text-base">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Evaluation Section */}
      <section className="bg-[#f9fafb] flex flex-col items-center px-8 py-24 relative w-full">
        <div className="flex flex-col gap-12 items-start relative w-full max-w-[1280px]">
          <div className="flex flex-col gap-4 items-start">
            <p className="font-semibold leading-6 text-[#6941c6] text-base">
              Đánh giá
            </p>
            <h2 className="font-semibold leading-[44px] text-[#181d27] text-[36px] tracking-[-0.72px]">
              Kết quả và hiệu quả
            </h2>
          </div>
          <div className="flex flex-col gap-6 items-start w-full">
            <p className="font-normal leading-6 text-[#535862] text-base max-w-4xl">
              Hệ thống được đánh giá dựa trên tốc độ nắm vững kiến thức, tỉ lệ giảm lỗi lặp lại, thời gian hoàn thành khóa học, mức độ phù hợp của gợi ý và độ chính xác của mô hình mastery.
            </p>
            <div className="flex items-center gap-3 p-6 rounded-xl bg-white border border-[#e9eaeb]">
              <Zap className="w-6 h-6 text-[#6941c6]" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold leading-6 text-[#181d27] text-base">
                  Kết quả nổi bật
                </p>
                <p className="font-normal leading-5 text-[#535862] text-sm">
                  Adaptive learning giảm 20–40% thời gian học và tăng đáng kể khả năng ghi nhớ dài hạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="bg-white flex items-start justify-center relative w-full">
        <div className="h-px relative w-full max-w-[1280px]">
          <div className="h-px w-full bg-[#e9eaeb]" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
