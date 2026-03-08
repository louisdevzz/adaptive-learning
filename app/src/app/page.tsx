"use client";

import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Users,
  Sparkles,
  BookOpen,
  Pencil,
  Brain,
  Zap,
  Headphones,
  Star,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Menu,
  X,
  Target,
  BarChart3,
  Lightbulb,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from "lucide-react";

// ==================== COLOR PALETTE ====================
// Exact colors from the reference image
// Purple: #6244F4 (primary)
// Lime: #D7F654 / #DAF851 (accent)
// Black: #010101 (dark elements)
// White: #FFFFFF (background, text)

const colors = {
  // Primary Purple
  primary: "#6244F4",
  
  // Lime Green Accent
  lime: "#D7F654",
  limeAlt: "#DAF851",
  
  // Black
  black: "#010101",
  
  // White
  white: "#FFFFFF",
  
  // Utility
  text: "#010101",
  textMuted: "#666666",
  border: "#E5E5E5",
};

// ==================== NAVBAR ====================
const navLinks = [
  { label: "Trang chủ", href: "#hero" },
  { label: "Khóa học", href: "#courses" },
  { label: "Tính năng", href: "#features" },
  { label: "Đánh giá", href: "#testimonials" },
  { label: "Lộ trình", href: "#roadmap" },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5]/50"
    >
      <div className="flex items-center justify-between px-6 lg:px-10 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-xl font-bold"
          >
            <img src="/logo-text.png" alt="Adapt" className="w-28 object-contain" />
          </Link>
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-medium transition-colors text-[#666666] hover:text-[#6244F4]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </button>
          <Button
            as={Link}
            href="/login"
            className="hidden sm:flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105"
            style={{ backgroundColor: colors.black }}
          >
            Đăng ký <ArrowRight className="w-4 h-4" />
          </Button>
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E5E5] px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-[#666666] hover:text-[#6244F4] py-2"
            >
              {link.label}
            </Link>
          ))}
          <Button
            as={Link}
            href="/login"
            className="flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium w-full justify-center mt-2"
            style={{ backgroundColor: colors.black }}
          >
            Đăng ký <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </motion.nav>
  );
}

// ==================== HERO SECTION ====================
function HeroSection() {
  return (
    <section id="hero" className="px-6 lg:px-10 pt-16 pb-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
        <div className="flex-1">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: "rgba(98, 68, 244, 0.1)", color: colors.primary }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Adaptive Learning
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.05] tracking-tight"
            style={{ color: colors.black }}
          >
            Nâng cao tư duy:
            <br />
            <span style={{ color: colors.primary }}>Học trực tuyến</span>
            <br />
            ngay hôm nay!
          </h1>
          {/* Arrow SVG */}
          <svg
            className="hidden lg:block w-28 h-16 mt-2 ml-auto mr-20"
            viewBox="0 0 120 70"
            fill="none"
          >
            <path
              d="M10 15 Q 60 65 100 35"
              stroke={colors.lime}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M92 40 L102 33 L98 45"
              stroke={colors.lime}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="max-w-sm space-y-5 lg:pt-8">
          <p className="text-[#666666] text-base leading-relaxed">
            Trải nghiệm học tập thích ứng cá nhân hóa hành trình giáo dục của bạn,
            giúp bạn nắm vững kỹ năng với tốc độ của riêng mình.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white"
                  style={{ backgroundColor: "rgba(98, 68, 244, 0.2)" }}
                >
                  <Users className="w-4 h-4" style={{ color: colors.primary }} />
                </div>
              ))}
            </div>
            <span className="text-sm font-medium">Tham gia cộng đồng</span>
          </div>
          <Button
            as={Link}
            href="/login"
            className="flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-medium transition-transform hover:scale-105"
            style={{ backgroundColor: colors.primary }}
          >
            Bắt đầu miễn phí <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// ==================== BENTO GRID ====================
function BentoGrid() {
  return (
    <section id="courses" className="px-6 lg:px-10 py-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Interactive Learning - Purple */}
        <div
          className="rounded-3xl p-7 text-white flex flex-col justify-between min-h-[300px]"
          style={{ backgroundColor: colors.primary }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white text-black text-xs font-medium px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" /> Nội dung đa phương tiện
            </span>
            <span className="bg-white text-black text-xs font-medium px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Pencil className="w-3 h-3" /> Bài tập thực hành
            </span>
            <button className="ml-auto w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between mt-auto pt-8">
            <h3 className="text-2xl font-heading font-bold leading-tight max-w-[220px]">
              Trải nghiệm học tập tương tác
            </h3>
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.lime }}
            >
              <Brain className="w-5 h-5" style={{ color: colors.black }} />
            </div>
          </div>
        </div>

        {/* Card 2: Community - Lime */}
        <div
          className="rounded-3xl p-7 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden"
          style={{ backgroundColor: colors.lime, color: colors.black }}
        >
          <svg
            className="absolute inset-0 w-full h-full opacity-15"
            viewBox="0 0 200 200"
          >
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="160"
              cy="80"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="70"
              cy="160"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="140"
              cy="170"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 z-10">
            <Users className="w-5 h-5 text-black" />
          </div>
          <p className="text-sm font-medium z-10">Cộng đồng học tập hỗ trợ</p>
          <p className="text-3xl font-heading font-bold z-10 mt-1">
            +4000 học viên!
          </p>
        </div>

        {/* Card 3: Stats - Black */}
        <div 
          className="rounded-3xl p-7 flex flex-col items-center justify-center min-h-[240px] relative overflow-hidden"
          style={{ backgroundColor: "hsl(240 10% 96%)" }}
        >
          <div 
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center relative"
            style={{ backgroundColor: colors.lime }}
          >
            <Zap className="w-5 h-5 mb-1" style={{ color: colors.black }} />
            <span
              className="text-4xl font-heading font-bold"
              style={{ color: colors.black }}
            >
              +95
            </span>
            <span
              className="text-xs font-medium text-center leading-tight mt-0.5"
              style={{ color: colors.black }}
            >
              Bài học &<br />
              tài nguyên
            </span>
          </div>
        </div>

        {/* Card 4: Testimonial - Black */}
        <div
          className="rounded-3xl p-7 text-white flex flex-col justify-between min-h-[260px] relative overflow-hidden"
          style={{ backgroundColor: colors.black }}
        >
          <div className="relative z-10">
            <span
              className="text-5xl font-heading leading-none"
              style={{ color: colors.primary }}
            >
              "
            </span>
            <p className="text-sm leading-relaxed opacity-95 mt-2">
              Giáo dục là hộ chiếu đến tương lai, vì ngày mai thuộc về những ai
              nắm bắt sức mạnh của học tập thích ứng
            </p>
          </div>
          <div className="flex items-center gap-3 mt-5 relative z-10">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm">Helen Jones</p>
              <p className="text-xs opacity-70">Giáo viên</p>
            </div>
          </div>
        </div>

        {/* Card 5: Premium CTA with 3D teacher - Purple */}
        
        <div className="lg:col-span-2 rounded-3xl overflow-hidden min-h-[260px] flex flex-col md:flex-row"
        >
          
          <div
            className="p-7 flex-1 flex flex-col justify-between text-white relative"
            style={{ backgroundColor: colors.primary }}
          >
            
            <div>
              
              <div className="flex items-center gap-2 mb-3">
                
                <Headphones className="w-5 h-5" />
                
                <h3 className="text-xl font-heading font-bold">Cần hỗ trợ?</h3>
              
              </div>
              
              <p className="text-sm opacity-90 leading-relaxed max-w-xs">
                Tận hưởng hỗ trợ ưu tiên và lộ trình thích ứng từ nền tảng học
                tập AI của chúng tôi.
              
              </p>
            
            </div>
            
            <button
              className="mt-5 text-sm font-medium px-6 py-2.5 rounded-full self-start transition-transform hover:scale-105 inline-flex items-center gap-2"
              style={{ backgroundColor: colors.black, color: 'white' }}
            >
              Nâng cấp Premium! <ArrowRight className="w-4 h-4" />
            </button>
          
          </div>
          
          <div
            className="flex-1 flex items-end justify-center relative"
            style={{ backgroundColor: colors.primary }}
          >
            
            <img
              src="/teacher-3d.png"
              alt="3D Teacher"
              className="h-56 object-contain"
            />
          
          </div>
        
        </div>
      </div>
    </section>
  );
}

// ==================== FEATURES SECTION ====================
const features = [
  {
    icon: Brain,
    title: "Lộ trình AI",
    description:
      "AI phân tích phong cách học của bạn và điều chỉnh nội dung theo thờigian thực để tối đa hóa khả năng ghi nhớ.",
    color: colors.primary,
  },
  {
    icon: Target,
    title: "Mục tiêu cá nhân",
    description:
      "Đặt cột mốc tùy chỉnh và theo dõi tiến độ với các đề xuất thông minh.",
    color: colors.lime,
  },
  {
    icon: BarChart3,
    title: "Phân tích thông minh",
    description:
      "Thông tin chi tiết về điểm mạnh và lĩnh vực cần cải thiện với dữ liệu hành động.",
    color: colors.primary,
  },
  {
    icon: Lightbulb,
    title: "Micro-Learning",
    description:
      "Bài học ngắn được tối ưu hóa cho khả năng tập trung và lịch trình của bạn.",
    color: colors.lime,
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="px-6 lg:px-10 py-20 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Visual */}
        
        <div className="flex-1 flex justify-center">
          
          <div className="relative">
            
            <div
              className="w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(98, 68, 244, 0.1)" }}
            >
              
              <img 
                src="/brain-ai.png" 
                alt="AI Brain" 
                className="w-48 md:w-60 object-contain animate-float"
              />
            
            </div>
            
            <div
              className="absolute -top-4 -right-4 text-xs font-bold px-4 py-2 rounded-full"
              style={{ backgroundColor: colors.lime, color: colors.black }}
            >
              AI Inside
            
            </div>
          
          </div>
        
        </div>

        {/* Right: Features */}
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold leading-tight"
            style={{ color: colors.black }}
          >
            Tại sao học tập thích ứng
            <br />
            <span style={{ color: colors.primary }}>thay đổi mọi thứ</span>
          </h2>
          <div className="grid gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E5E5E5] hover:border-[#6244F4]/30 transition-colors group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: feature.color === colors.primary 
                      ? "rgba(98, 68, 244, 0.1)" 
                      : "rgba(215, 246, 84, 0.3)",
                    color: feature.color === colors.primary ? colors.primary : colors.black,
                  }}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm mb-1" style={{ color: colors.black }}>
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== TESTIMONIALS SECTION ====================
const testimonials = [
  {
    name: "Nguyễn Thị Mai",
    role: "Học sinh lớp 11",
    text: "Hệ thống thích ứng phát hiện tôi đang gặp khó khăn với thuật toán và điều chỉnh độ khó hoàn hảo. Tôi đã từ trượt lên top 10% lớp!",
    rating: 5,
  },
  {
    name: "Trần Văn Hùng",
    role: "Chuyển ngành",
    text: "Chuyển từ marketing sang khoa học dữ liệu tưởng chừng không thể cho đến khi Adapt tạo lộ trình cá nhân. Gia sư AI như có ngườimemtor riêng.",
    rating: 5,
  },
  {
    name: "Lê Phụng Hà",
    role: "Giáo viên THPT",
    text: "Tôi sử dụng Adapt cho phát triển chuyên môn. Nền tảng hiểu chính xác khoảng trống kiến thức và lấp đầy chúng hiệu quả.",
    rating: 5,
  },
];

function TestimonialsSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="testimonials" className="px-6 lg:px-10 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-heading font-bold" style={{ color: colors.black }}>
          Được yêu thích bởi{" "}
          <span style={{ color: colors.primary }}>học viên</span> trên toàn
          thế giới
        </h2>
        <p className="text-[#666666] mt-3 max-w-md mx-auto text-sm">
          Xem cách học tập thích ứng đã thay đổi hành trình giáo dục trên toàn
          cầu.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`rounded-3xl p-7 flex flex-col justify-between min-h-[220px] transition-all ${
              i === active
                ? "text-white scale-[1.02]"
                : "bg-white border border-[#E5E5E5]"
            }`}
            style={i === active ? { backgroundColor: colors.primary } : {}}
          >
            <div>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${i === active ? "fill-[#D7F654] text-[#D7F654]" : "fill-[#6244F4]/30 text-[#6244F4]/30"}`}
                  />
                ))}
              </div>
              <p
                className={`text-sm leading-relaxed ${
                  i === active ? "opacity-95" : "text-[#666666]"
                }`}
              >
                "{t.text}"
              </p>
            </div>
            <div className="mt-5">
              <p className="font-heading font-bold text-sm">{t.name}</p>
              <p
                className={`text-xs ${
                  i === active ? "opacity-60" : "text-[#666666]"
                }`}
              >
                {t.role}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3 mt-8">
        <button
          onClick={() =>
            setActive((p) => (p === 0 ? testimonials.length - 1 : p - 1))
          }
          className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            setActive((p) => (p === testimonials.length - 1 ? 0 : p + 1))
          }
          className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

// ==================== LEARNING FLOW SECTION ====================
const learningFlow = [
  {
    step: "Bước 1",
    title: "Đánh giá điểm xuất phát",
    description:
      "Bài kiểm tra ngắn giúp AI nhận diện lỗ hổng kiến thức và tốc độ học phù hợp với bạn.",
    icon: Target,
    tint: "rgba(98, 68, 244, 0.1)",
    iconColor: colors.primary,
  },
  {
    step: "Bước 2",
    title: "Cá nhân hóa lộ trình",
    description:
      "Hệ thống tự động chọn Knowledge Point ưu tiên, sắp xếp bài học theo thứ tự tối ưu hóa tiến bộ.",
    icon: Brain,
    tint: "rgba(215, 246, 84, 0.35)",
    iconColor: colors.black,
  },
  {
    step: "Bước 3",
    title: "Theo dõi và bứt phá",
    description:
      "Dashboard trực quan cập nhật mastery theo thời gian thực và gợi ý hành động tiếp theo cho mỗi buổi học.",
    icon: BarChart3,
    tint: "rgba(98, 68, 244, 0.1)",
    iconColor: colors.primary,
  },
];

function LearningFlowSection() {
  return (
    <section id="roadmap" className="px-6 lg:px-10 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
          style={{ backgroundColor: "rgba(215, 246, 84, 0.3)" }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: colors.black }} />
          Cách học hiệu quả
        </div>
        <h2
          className="text-3xl md:text-4xl font-heading font-bold"
          style={{ color: colors.black }}
        >
          Lộ trình học với <span style={{ color: colors.primary }}>3 bước</span>{" "}
          rõ ràng
        </h2>
        <p className="text-[#666666] mt-3 max-w-2xl mx-auto text-sm leading-relaxed">
          Không cần đoán mò nên học gì tiếp theo. Adapt tự động dẫn bạn đi từ
          nền tảng đến nâng cao bằng dữ liệu học tập thực tế.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {learningFlow.map((item, index) => (
          <div
            key={item.step}
            className={`rounded-3xl p-7 flex flex-col ${
              index === 1
                ? "text-white scale-[1.02]"
                : "bg-white border border-[#E5E5E5]"
            }`}
            style={
              index === 1
                ? {
                    backgroundColor: colors.primary,
                    boxShadow: "0 0 0 4px rgba(215, 246, 84, 0.35)",
                  }
                : {}
            }
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                index === 1 ? "bg-white/20" : ""
              }`}
              style={index === 1 ? {} : { backgroundColor: item.tint }}
            >
              <item.icon
                className="w-5 h-5"
                style={{ color: index === 1 ? colors.lime : item.iconColor }}
              />
            </div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.12em] mt-4 ${
                index === 1 ? "text-white/70" : "text-[#6244F4]"
              }`}
            >
              {item.step}
            </p>
            <h3 className="text-xl font-heading font-bold mt-2">{item.title}</h3>
            <p
              className={`text-sm mt-3 leading-relaxed ${
                index === 1 ? "text-white/80" : "text-[#666666]"
              }`}
            >
              {item.description}
            </p>
            <div
              className={`mt-6 inline-flex items-center gap-2 text-xs font-medium ${
                index === 1 ? "text-white/90" : "text-[#666666]"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: index === 1 ? colors.lime : colors.primary,
                }}
              />
              Hoàn thành trong 5-10 phút mỗi buổi
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-3xl mt-7 p-7 md:p-8 border border-[#E5E5E5] flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ backgroundColor: "hsl(240 10% 98%)" }}
      >
        <div className="flex items-center gap-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(98, 68, 244, 0.12)" }}
          >
            <Zap className="w-6 h-6" style={{ color: colors.primary }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.black }}>
              87% học viên duy trì thói quen học sau 4 tuần
            </p>
            <p className="text-xs text-[#666666] mt-1">
              Nhờ bài học ngắn, mục tiêu rõ ràng và phản hồi tức thì sau mỗi
              lần luyện tập.
            </p>
          </div>
        </div>
        <Button
          as={Link}
          href="/login"
          className="rounded-full text-white px-6 py-3 text-sm font-medium transition-transform hover:scale-105 inline-flex items-center gap-2"
          style={{ backgroundColor: colors.black }}
        >
          Trải nghiệm lộ trình AI <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </section>
  );
}

// ==================== CTA SECTION ====================
function CTASection() {
  return (
    <section id="cta" className="px-6 lg:px-10 py-20 max-w-7xl mx-auto">
      <div
        className="rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden"
        style={{ backgroundColor: colors.black }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-6 right-6 w-20 h-20 rounded-full"
          style={{ backgroundColor: "rgba(98, 68, 244, 0.2)" }}
        />
        <div
          className="absolute bottom-10 left-10 w-14 h-14 rounded-full"
          style={{ backgroundColor: "rgba(215, 246, 84, 0.2)" }}
        />

        <div className="flex-1 text-white z-10">
          <h2 className="text-3xl md:text-4xl font-heading font-bold leading-tight">
            Sẵn sàng bắt đầu
            <br />
            <span style={{ color: colors.primary }}>hành trình thích ứng</span>?
          </h2>
          <p className="text-sm opacity-70 mt-4 max-w-md leading-relaxed">
            Tham gia cùng hàng nghìn học viên đã thay đổi giáo dục với lộ trình
            học tập cá nhân hóa, AI-driven.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Button
              as={Link}
              href="/login"
              className="text-white px-7 py-3 rounded-full text-sm font-medium transition-transform hover:scale-105 inline-flex items-center gap-2"
              style={{ backgroundColor: colors.primary }}
            >
              Bắt đầu miễn phí <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center z-10">
          <img 
            src="/students-3d.png" 
            alt="Happy Students" 
            className="w-72 md:w-80 object-contain"
          />
        </div>
      </div>
    </section>
  );
}

// ==================== FOOTER ====================
function Footer() {
  const links = {
    Sản_phẩm: ["Tính năng", "Lộ trình", "Khóa học", "Hướng dẫn"],
    Công_ty: ["Về chúng tôi", "Tuyển dụng", "Blog", "Liên hệ"],
    Hỗ_trợ: ["Trung tâm trợ giúp", "Cộng đồng", "Trạng thái", "API Docs"],
  };

  return (
    <footer
      className="text-white"
      style={{ backgroundColor: colors.black }}
    >
      <div className="px-6 lg:px-10 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading text-xl font-bold"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.lime }}
              >
                <GraduationCap className="w-5 h-5" style={{ color: colors.black }} />
              </div>
              <span style={{ color: colors.primary }}>Adapt</span>
            </Link>
            <p className="text-sm opacity-60 leading-relaxed max-w-xs">
              Trao quyền cho học viên trên toàn thế giới với giáo dục thích ứng
              AI-driven đáp ứng bạn ở nơi bạn đang đứng.
            </p>
            <div className="flex gap-3 pt-2">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#6244F4] transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-sm mb-4">
                {title.replace("_", " ")}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm opacity-50 hover:opacity-100 hover:text-[#6244F4] transition-all"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-40">© 2026 Adapt Learning. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs opacity-40 hover:opacity-100 transition-opacity">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="text-xs opacity-40 hover:opacity-100 transition-opacity">
              Điều khoản
            </Link>
            <Link href="#" className="text-xs opacity-40 hover:opacity-100 transition-opacity">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== MAIN PAGE ====================
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <BentoGrid />
      <FeaturesSection />
      <TestimonialsSection />
      <LearningFlowSection />
      <CTASection />
      <Footer />
    </main>
  );
}
