"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@heroui/button";
import Link from "next/link";
import { 
  BookOpen, 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  Star,
  CheckCircle2,
  BarChart3,
  Clock,
  ChevronDown,
  GraduationCap,
  Award,
  Sparkles,
  FileText,
  Video,
  Lightbulb
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

// Floating card component
function FloatingCard({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Partner logo component
function PartnerLogo({ name }: { name: string }) {
  return (
    <div className="text-gray-400 font-semibold text-sm tracking-wider hover:text-gray-600 transition-colors cursor-default">
      {name}
    </div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const scaleSpring = useSpring(scale, springConfig);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img src="/logo-text.png" alt="Adapt" className="h-8 object-contain" />
            </Link>
            
            {/* Center Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors">
                Khóa học
                <ChevronDown className="w-4 h-4" />
              </button>
              <Link href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Lộ trình học
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Tài liệu
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Bảng giá
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Button variant="light" as={Link} href="/login" className="text-sm">
                Đăng nhập
              </Button>
              <Button 
                className="bg-black text-white rounded-full px-6 text-sm hover:bg-gray-800" 
                as={Link} 
                href="/login"
              >
                Bắt đầu học
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 overflow-hidden">
        <motion.div style={{ opacity, scale: scaleSpring }} className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Hero Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-serif text-black leading-[1.1] mb-6"
            >
              Học Thông Minh Hơn Với
              <br />
              AI Cá Nhân Hóa
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto"
            >
              Từ kiến thức đến thành thạo — hàng nghìn lộ trình học tập 
              được cá nhân hóa cho từng học sinh với công nghệ AI thích ứng.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-black text-white rounded-full px-8 h-12 text-sm font-medium hover:bg-gray-800"
                as={Link}
                href="/login"
              >
                Học miễn phí ngay
              </Button>
              <Button 
                size="lg" 
                variant="bordered" 
                className="rounded-full px-8 h-12 text-sm font-medium border-gray-300"
                as={Link}
                href="/login"
              >
                Xem demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Floating Cards Layout */}
          <div className="relative mt-16 max-w-5xl mx-auto">
            {/* Center Phone/Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative z-10 mx-auto w-72 md:w-80"
            >
              <div className="relative">
                {/* Phone Frame */}
                <div className="bg-black rounded-[3rem] p-2 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/16]">
                    {/* Mock Content */}
                    <div className="p-4 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-black">Nguyễn Văn A</p>
                          <p className="text-[10px] text-gray-400">Đang học</p>
                        </div>
                        <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] rounded-full flex items-center gap-1">
                          <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                          Online
                        </span>
                      </div>
                      {/* Main Content Area */}
                      <div className="flex-1 bg-gradient-to-b from-blue-50 to-white rounded-2xl flex flex-col items-center justify-center p-4">
                        <GraduationCap className="w-16 h-16 text-blue-500 mb-3" />
                        <p className="text-sm font-semibold text-black">Toán học</p>
                        <p className="text-[10px] text-gray-400">Chương 3: Đạo hàm</p>
                        <div className="mt-4 w-full">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-blue-500 rounded-full" />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 text-center">75% hoàn thành</p>
                        </div>
                      </div>
                      {/* Stats */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-black">85%</p>
                          <p className="text-[10px] text-gray-400">Tiến độ</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-black">12</p>
                          <p className="text-[10px] text-gray-400">Ngày liên tiếp</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Arc */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[150%] h-32">
                  <svg viewBox="0 0 400 100" className="w-full h-full opacity-20">
                    <path
                      d="M 0 100 Q 200 0 400 100"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Floating Card - Top Left - Study Time */}
            <FloatingCard 
              className="absolute top-0 left-0 md:left-12"
              delay={0.5}
            >
              <div className="bg-blue-100 rounded-2xl p-4 w-40">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Thời gian</span>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-black">2h</p>
                  <p className="text-[10px] text-gray-400">Hôm nay</p>
                </div>
              </div>
            </FloatingCard>

            {/* Floating Card - Top Right - Completed Lessons */}
            <FloatingCard 
              className="absolute top-4 right-0 md:right-12"
              delay={0.7}
            >
              <div className="bg-green-100 rounded-2xl p-4 w-44">
                <p className="text-3xl font-bold text-black">8<span className="text-lg"> bài</span></p>
                <p className="text-xs text-gray-600">Hoàn thành tuần này</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-white rounded-lg text-sm font-bold text-green-600">+12%</span>
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </FloatingCard>

            {/* Floating Card - Left Middle - Mastery Score */}
            <FloatingCard 
              className="absolute top-1/2 -left-4 md:left-0 -translate-y-1/2"
              delay={0.9}
            >
              <div className="bg-yellow-100 rounded-2xl p-4 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-yellow-700" />
                  <span className="text-xs text-yellow-700 font-medium">Điểm nắm vững</span>
                </div>
                <p className="text-3xl font-bold text-black">85%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-yellow-700" />
                  <span className="text-xs text-yellow-700">+5% tuần trước</span>
                </div>
              </div>
            </FloatingCard>

            {/* Floating Card - Rating */}
            <FloatingCard 
              className="absolute top-1/3 left-1/4 hidden lg:block"
              delay={1.1}
            >
              <div className="bg-pink-100 rounded-full px-4 py-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-black fill-black" />
                ))}
                <span className="text-xs font-bold ml-1">4.9</span>
              </div>
            </FloatingCard>

            {/* Floating Card - Right Bottom - XP Achievement */}
            <FloatingCard 
              className="absolute bottom-12 right-0 md:right-8"
              delay={1.3}
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-3 w-48 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Thành tích</p>
                    <p className="text-sm font-bold text-black">1.5k XP</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  <button className="p-1.5 hover:bg-gray-100 rounded-full">
                    <div className="w-4 h-4 bg-red-500 rounded-full" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full">
                    <div className="w-4 h-4 bg-gray-300 rounded-full" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full">
                    <div className="w-4 h-4 bg-gray-300 rounded-full" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full ml-auto">
                    <span className="text-xs text-gray-400">Chia sẻ</span>
                  </button>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* Partner Logos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-20 pt-12 border-t border-gray-100"
          >
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {["Vinschool", "Nguyễn Khuyến", "Marie Curie", "Wellspring", "FPT", "Ngô Thời Nhiệm", "Lương Thế Vinh", "Trí Đức"].map((name) => (
                <PartnerLogo key={name} name={name} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">
              Mọi thứ bạn cần để học tập hiệu quả
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Tính năng mạnh mẽ giúp bạn học nhanh hơn và đạt được mục tiêu
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Brain, 
                title: "AI Cá Nhân Hóa", 
                desc: "Lộ trình học tập được điều chỉnh theo phong cách và tốc độ riêng của từng học sinh",
                color: "bg-blue-100"
              },
              { 
                icon: Target, 
                title: "Mục Tiêu Thông Minh", 
                desc: "Thiết lập và theo dõi mục tiêu học tập với gợi ý từ AI",
                color: "bg-green-100"
              },
              { 
                icon: TrendingUp, 
                title: "Phân Tích Tiến Độ", 
                desc: "Báo cáo chi tiết về quá trình học tập với biểu đồ trực quan",
                color: "bg-yellow-100"
              },
              { 
                icon: Users, 
                title: "Học Tập Cộng Đồng", 
                desc: "Kết nối với bạn bè và học cùng nhau trong không gian hợp tác",
                color: "bg-pink-100"
              },
              { 
                icon: Lightbulb, 
                title: "Bài Tập Thông Minh", 
                desc: "Bài tập được tạo tự động dựa trên mức độ nắm vững của bạn",
                color: "bg-purple-100"
              },
              { 
                icon: Award, 
                title: "Thành Tích & Chứng Chỉ", 
                desc: "Nhận huy hiệu và chứng chỉ khi đạt các cột mốc quan trọng",
                color: "bg-orange-100"
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 hover:shadow-xl transition-shadow"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-gray-800" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">
              Con số nói lên hiệu quả
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Học sinh", icon: Users },
              { value: "500+", label: "Bài học", icon: BookOpen },
              { value: "95%", label: "Tỷ lệ hoàn thành", icon: Target },
              { value: "3x", label: "Tốc độ học nhanh hơn", icon: Zap },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mb-4">
                  <stat.icon className="w-7 h-7 text-gray-800" />
                </div>
                <p className="text-4xl font-bold text-black mb-2">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Sẵn sàng bắt đầu hành trình học tập?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn học sinh đang học thông minh hơn với Adapt
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-black rounded-full px-8 h-12 text-sm font-medium hover:bg-gray-100"
                as={Link}
                href="/login"
              >
                Bắt đầu miễn phí
              </Button>
              <Button 
                size="lg" 
                variant="bordered" 
                className="rounded-full px-8 h-12 text-sm font-medium border-gray-700 text-white hover:bg-gray-900"
              >
                Xem demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center mb-4">
                <img src="/logo-text.png" alt="Adapt" className="h-8 object-contain" />
              </Link>
              <p className="text-gray-500 text-sm max-w-sm">
                Nền tảng học tập thích ứng sử dụng AI để cá nhân hóa giáo dục cho mọi học sinh.
              </p>
            </div>
            <div>
              <h4 className="text-black font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-3">
                {["Khóa học", "Lộ trình", "Tài liệu", "API"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-500 text-sm hover:text-black transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-black font-semibold mb-4">Công ty</h4>
              <ul className="space-y-3">
                {["Về chúng tôi", "Blog", "Tuyển dụng", "Liên hệ"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-500 text-sm hover:text-black transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2025 Adapt. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 text-sm hover:text-black transition-colors">Chính sách bảo mật</Link>
              <Link href="#" className="text-gray-400 text-sm hover:text-black transition-colors">Điều khoản sử dụng</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
