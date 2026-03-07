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
  Check,
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
// Primary: Purple hsl(252 75% 60%) - #7c5dfa
// Lime: hsl(72 100% 60%) - #d4f938
// Background: hsl(240 10% 96%)
// Card Dark: hsl(240 10% 8%)

const colors = {
  primary: "hsl(252 75% 60%)",
  primaryHex: "#7c5dfa",
  lime: "hsl(72 100% 60%)",
  limeHex: "#d4f938",
  background: "hsl(240 10% 96%)",
  foreground: "hsl(240 10% 8%)",
  card: "hsl(0 0% 100%)",
  cardDark: "hsl(240 10% 8%)",
  muted: "hsl(240 5% 46%)",
  border: "hsl(240 6% 88%)",
};

// ==================== ANIMATION VARIANTS ====================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

// ==================== NAVBAR ====================
const navLinks = [
  { label: "Tutors", href: "#" },
  { label: "Khóa học", href: "#courses" },
  { label: "Bài viết", href: "#" },
  { label: "Về chúng tôi", href: "#", active: true },
  { label: "Liên hệ", href: "#" },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
    >
      <div className="flex items-center justify-between px-6 lg:px-10 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-xl font-bold"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.limeHex }}
            >
              <GraduationCap className="w-5 h-5" style={{ color: colors.foreground }} />
            </div>
            <span style={{ color: colors.primaryHex }}>Adapt</span>
          </Link>
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#7c5dfa] ${
                    link.active
                      ? "text-[#7c5dfa] underline underline-offset-4 decoration-wavy decoration-[#7c5dfa]"
                      : "text-[#717680]"
                  }`}
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
            style={{ backgroundColor: colors.primaryHex }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </button>
          <Button
            as={Link}
            href="/login"
            className="hidden sm:flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105"
            style={{ backgroundColor: colors.cardDark }}
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
        <div className="md:hidden bg-background border-t border-border px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-[#717680] hover:text-[#7c5dfa] py-2"
            >
              {link.label}
            </Link>
          ))}
          <Button
            as={Link}
            href="/login"
            className="flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium w-full justify-center mt-2"
            style={{ backgroundColor: colors.cardDark }}
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
    <section className="px-6 lg:px-10 pt-16 pb-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
        <div className="flex-1">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: "rgba(124, 93, 250, 0.1)", color: colors.primaryHex }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Adaptive Learning
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.05] tracking-tight text-[#0f172a]">
            Nâng cao tư duy:
            <br />
            <span style={{ color: colors.primaryHex }}>Học trực tuyến</span>
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
              stroke={colors.limeHex}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M92 40 L102 33 L98 45"
              stroke={colors.limeHex}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="max-w-sm space-y-5 lg:pt-8">
          <p className="text-[#717680] text-base leading-relaxed">
            Trải nghiệm học tập thích ứng cá nhân hóa hành trình giáo dục của bạn,
            giúp bạn nắm vững kỹ năng với tốc độ của riêng mình.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white"
                  style={{ backgroundColor: "rgba(124, 93, 250, 0.2)" }}
                >
                  <Users className="w-4 h-4" style={{ color: colors.primaryHex }} />
                </div>
              ))}
            </div>
            <span className="text-sm font-medium">Tham gia cộng đồng</span>
          </div>
          <Button
            as={Link}
            href="/login"
            className="flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-medium transition-transform hover:scale-105"
            style={{ backgroundColor: colors.primaryHex }}
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
          style={{ backgroundColor: colors.primaryHex }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white text-[#0f172a] text-xs font-medium px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" /> Nội dung đa phương tiện
            </span>
            <span className="bg-white text-[#0f172a] text-xs font-medium px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Pencil className="w-3 h-3" /> Bài tập thực hành
            </span>
            <button className="ml-auto w-9 h-9 rounded-full bg-white text-[#0f172a] flex items-center justify-center hover:scale-110 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between mt-auto pt-8">
            <h3 className="text-2xl font-heading font-bold leading-tight max-w-[220px]">
              Trải nghiệm học tập tương tác
            </h3>
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.limeHex }}
            >
              <Brain className="w-5 h-5" style={{ color: colors.foreground }} />
            </div>
          </div>
        </div>

        {/* Card 2: Community - Lime */}
        <div
          className="rounded-3xl p-7 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden"
          style={{ backgroundColor: colors.limeHex, color: colors.foreground }}
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
            <Users className="w-5 h-5 text-[#0f172a]" />
          </div>
          <p className="text-sm font-medium z-10">Cộng đồng học tập hỗ trợ</p>
          <p className="text-3xl font-heading font-bold z-10 mt-1">
            +4000 học viên!
          </p>
        </div>

        {/* Card 3: Stats */}
        <div className="bg-white rounded-3xl p-7 flex flex-col items-center justify-center min-h-[240px] border border-[#e2e8f0]">
          <div
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center relative"
            style={{ backgroundColor: colors.limeHex }}
          >
            <Zap className="w-5 h-5 mb-1" style={{ color: colors.foreground }} />
            <span
              className="text-4xl font-heading font-bold"
              style={{ color: colors.foreground }}
            >
              +95
            </span>
            <span
              className="text-xs font-medium text-center leading-tight mt-0.5"
              style={{ color: colors.foreground }}
            >
              Bài học v<br />
              tài nguyên
            </span>
          </div>
        </div>

        {/* Card 4: Testimonial - Dark */}
        <div
          className="rounded-3xl p-7 text-white flex flex-col justify-between min-h-[260px]"
          style={{ backgroundColor: colors.cardDark }}
        >
          <div>
            <span
              className="text-5xl font-heading leading-none"
              style={{ color: "rgba(124, 93, 250, 0.5)" }}
            >
              "
            </span>
            <p className="text-sm leading-relaxed opacity-90 mt-2">
              Giáo dục là hộ chiếu đến tương lai, vì ngày mai thuộc về những ai
              nắm bắt sức mạnh của học tập thích ứng
            </p>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(124, 93, 250, 0.3)" }}
            >
              <Users className="w-4 h-4" style={{ color: colors.primaryHex }} />
            </div>
            <div>
              <p className="font-heading font-bold text-sm">Helen Jones</p>
              <p className="text-xs opacity-50">Giáo viên</p>
            </div>
          </div>
        </div>

        {/* Card 5: Premium CTA with 3D teacher */}
        
        <div className="lg:col-span-2 rounded-3xl overflow-hidden min-h-[260px] flex flex-col md:flex-row"
        >
          
          <div
            className="p-7 flex-1 flex flex-col justify-between text-white"
            style={{ backgroundColor: colors.primaryHex }}
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
              className="mt-5 text-white text-sm font-medium px-6 py-2.5 rounded-full self-start transition-transform hover:scale-105 inline-flex items-center gap-2"
              style={{ backgroundColor: colors.cardDark }}
            >
              Nâng cấp Premium! <ArrowRight className="w-4 h-4" />
            </button>
          
          </div>
          
          <div
            className="flex-1 flex items-end justify-center relative"
            style={{ backgroundColor: colors.primaryHex }}
          >
            
            <img
              src="/teacher-3d.png"
              alt="3D Teacher"
              className="h-56 object-contain animate-float"
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
  },
  {
    icon: Target,
    title: "Mục tiêu cá nhân",
    description:
      "Đặt cột mốc tùy chỉnh và theo dõi tiến độ với các đề xuất thông minh.",
  },
  {
    icon: BarChart3,
    title: "Phân tích thông minh",
    description:
      "Thông tin chi tiết về điểm mạnh và lĩnh vực cần cải thiện với dữ liệu hành động.",
  },
  {
    icon: Lightbulb,
    title: "Micro-Learning",
    description:
      "Bài học ngắn được tối ưu hóa cho khả năng tập trung và lịch trình của bạn.",
  },
];

function FeaturesSection() {
  return (
    <section className="px-6 lg:px-10 py-20 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Visual */}
        
        <div className="flex-1 flex justify-center">
          
          <div className="relative">
            
            <div
              className="w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(124, 93, 250, 0.1)" }}
            >
              
              <img 
                src="/brain-ai.png" 
                alt="AI Brain" 
                className="w-48 md:w-60 object-contain animate-float"
              />
            
            </div>
            
            <div
              className="absolute -top-4 -right-4 text-xs font-bold px-4 py-2 rounded-full"
              style={{ backgroundColor: colors.limeHex, color: colors.foreground }}
            >
              AI Inside
            
            </div>
          
          </div>
        
        </div>

        {/* Right: Features */}
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold leading-tight text-[#0f172a]">
            Tại sao học tập thích ứng
            <br />
            <span style={{ color: colors.primaryHex }}>thay đổi mọi thứ</span>
          </h2>
          <div className="grid gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[rgba(124,93,250,0.3)] transition-colors group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:text-white transition-colors"
                  style={{
                    backgroundColor: "rgba(124, 93, 250, 0.1)",
                    color: colors.primaryHex,
                  }}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm mb-1 text-[#0f172a]">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#717680] leading-relaxed">
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
    <section className="px-6 lg:px-10 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0f172a]">
          Được yêu thích bởi{" "}
          <span style={{ color: colors.primaryHex }}>học viên</span> trên toàn
          thế giới
        </h2>
        <p className="text-[#717680] mt-3 max-w-md mx-auto text-sm">
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
                : "bg-white border border-[#e2e8f0]"
            }`}
            style={i === active ? { backgroundColor: colors.primaryHex } : {}}
          >
            <div>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      i === active
                        ? "fill-[#d4f938] text-[#d4f938]"
                        : "fill-[rgba(124,93,250,0.3)] text-[rgba(124,93,250,0.3)]"
                    }`}
                  />
                ))}
              </div>
              <p
                className={`text-sm leading-relaxed ${
                  i === active ? "opacity-95" : "text-[#717680]"
                }`}
              >
                "{t.text}"
              </p>
            </div>
            <div className="mt-5">
              <p className="font-heading font-bold text-sm">{t.name}</p>
              <p
                className={`text-xs ${
                  i === active ? "opacity-60" : "text-[#717680]"
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
          className="w-10 h-10 rounded-full border border-[#e2e8f0] flex items-center justify-center hover:bg-[#f1f5f9] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            setActive((p) => (p === testimonials.length - 1 ? 0 : p + 1))
          }
          className="w-10 h-10 rounded-full border border-[#e2e8f0] flex items-center justify-center hover:bg-[#f1f5f9] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

// ==================== PRICING SECTION ====================
const plans = [
  {
    name: "Miễn phí",
    price: "0đ",
    period: "/mãi mãi",
    description: "Hoàn hảo để khám phá học tập thích ứng",
    features: [
      "5 khóa học thích ứng",
      "Phân tích cơ bản",
      "Truy cập cộng đồng",
      "Hỗ trợ email",
    ],
    cta: "Bắt đầu miễn phí",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "99k",
    period: "/tháng",
    description: "Dành cho học viên nghiêm túc muốn tất cả",
    features: [
      "Khóa học không giới hạn",
      "Phân tích AI nâng cao",
      "Hỗ trợ ưu tiên",
      "Lộ trình tùy chỉnh",
      "Chứng chỉ",
    ],
    cta: "Nâng cấp Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "299k",
    period: "/tháng",
    description: "Dành cho tổ chức và lớp học",
    features: [
      "Tất cả tính năng Pro",
      "Dashboard nhóm",
      "Quyền quản trị",
      "Truy cập API",
      "Quản lý riêng",
    ],
    cta: "Liên hệ bán hàng",
    highlighted: false,
  },
];

function PricingSection() {
  return (
    <section className="px-6 lg:px-10 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
          style={{ backgroundColor: "rgba(212, 249, 56, 0.2)" }}
        >
          <Sparkles
            className="w-3.5 h-3.5"
            style={{ color: colors.foreground }}
          />{" "}
          Giá đơn giản
        </div>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0f172a]">
          Chọn gói{" "}
          <span style={{ color: colors.primaryHex }}>học tập</span> của bạn
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl p-7 flex flex-col ${
              plan.highlighted
                ? "text-white scale-[1.03]"
                : "bg-white border border-[#e2e8f0]"
            }`}
            style={
              plan.highlighted
                ? {
                    backgroundColor: colors.primaryHex,
                    boxShadow: `0 0 0 4px rgba(212, 249, 56, 0.4)`,
                  }
                : {}
            }
          >
            <p
              className={`text-sm font-semibold ${
                plan.highlighted ? "" : "text-[#7c5dfa]"
              }`}
            >
              {plan.name}
            </p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-heading font-bold">{plan.price}</span>
              <span
                className={`text-sm ${
                  plan.highlighted ? "opacity-60" : "text-[#717680]"
                }`}
              >
                {plan.period}
              </span>
            </div>
            <p
              className={`text-xs mt-2 ${
                plan.highlighted ? "opacity-75" : "text-[#717680]"
              }`}
            >
              {plan.description}
            </p>
            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check
                    className={`w-4 h-4 flex-shrink-0 ${
                      plan.highlighted
                        ? "text-[#d4f938]"
                        : "text-[#7c5dfa]"
                    }`}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`mt-7 w-full py-3 rounded-full text-sm font-medium transition-transform hover:scale-105 inline-flex items-center justify-center gap-2 ${
                plan.highlighted
                  ? "text-[#0f172a]"
                  : "text-white"
              }`}
              style={{
                backgroundColor: plan.highlighted
                  ? colors.limeHex
                  : colors.cardDark,
              }}
            >
              {plan.cta} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ==================== CTA SECTION ====================
function CTASection() {
  return (
    <section className="px-6 lg:px-10 py-20 max-w-7xl mx-auto">
      <div
        className="rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden"
        style={{ backgroundColor: colors.cardDark }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-6 right-6 w-20 h-20 rounded-full"
          style={{ backgroundColor: "rgba(124, 93, 250, 0.2)" }}
        />
        <div
          className="absolute bottom-10 left-10 w-14 h-14 rounded-full"
          style={{ backgroundColor: "rgba(212, 249, 56, 0.2)" }}
        />

        <div className="flex-1 text-white z-10">
          <h2 className="text-3xl md:text-4xl font-heading font-bold leading-tight">
            Sẵn sàng bắt đầu
            <br />
            <span style={{ color: colors.primaryHex }}>hành trình thích ứng</span>?
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
              style={{ backgroundColor: colors.primaryHex }}
            >
              Bắt đầu miễn phí <ArrowRight className="w-4 h-4" />
            </Button>
            <button className="text-white border border-white/20 px-7 py-3 rounded-full text-sm font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: colors.cardDark }}
            >
              Xem demo
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center z-10">
          <img 
            src="/students-3d.png" 
            alt="Happy Students" 
            className="w-72 md:w-80 object-contain animate-float"
          />
        </div>
      </div>
    </section>
  );
}

// ==================== FOOTER ====================
function Footer() {
  const links = {
    Sản_phẩm: ["Tính năng", "Bảng giá", "Khóa học", "Hướng dẫn"],
    Công_ty: ["Về chúng tôi", "Tuyển dụng", "Blog", "Liên hệ"],
    Hỗ_trợ: ["Trung tâm trợ giúp", "Cộng đồng", "Trạng thái", "API Docs"],
  };

  return (
    <footer
      className="text-white"
      style={{ backgroundColor: colors.cardDark }}
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
                style={{ backgroundColor: colors.limeHex }}
              >
                <GraduationCap className="w-5 h-5" style={{ color: colors.foreground }} />
              </div>
              <span style={{ color: colors.primaryHex }}>Adapt</span>
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
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:text-white transition-colors"
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
                      className="text-sm opacity-50 hover:opacity-100 transition-all"
                      style={{ color: "white" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = colors.primaryHex)
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.color = "white")
                      }
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
    <main className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <Navbar />
      <HeroSection />
      <BentoGrid />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
