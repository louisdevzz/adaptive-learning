"use client";

import { useState } from "react";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { DottedMap } from "@/components/ui/dotted-map";
import { Button } from "@/components/ui/button";
import { ChevronDown, Mail, Phone, HelpCircle } from "lucide-react";

const markers = [
  { lat: 10.762622, lng: 106.660172, size: 0.4 }, // Ho Chi Minh City
  { lat: 21.028511, lng: 105.804817, size: 0.4 }, // Hanoi
  { lat: 16.054407, lng: 108.202167, size: 0.4 }, // Da Nang
  { lat: 40.7128, lng: -74.006, size: 0.3 }, // New York
  { lat: 51.5074, lng: -0.1278, size: 0.3 }, // London
  { lat: 35.6762, lng: 139.6503, size: 0.3 }, // Tokyo
  { lat: -33.8688, lng: 151.2093, size: 0.3 }, // Sydney
  { lat: 48.8566, lng: 2.3522, size: 0.3 }, // Paris
  { lat: 52.52, lng: 13.405, size: 0.3 }, // Berlin
];

const countries = [
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
];

const contactInfo = [
  {
    icon: HelpCircle,
    title: "Hỗ trợ",
    description: "Đội ngũ thân thiện của chúng tôi sẵn sàng hỗ trợ bạn.",
    contact: "support@adaptivelearning.com",
  },
  {
    icon: Mail,
    title: "Bán hàng",
    description: "Có câu hỏi hoặc thắc mắc? Hãy liên hệ với chúng tôi!",
    contact: "sales@adaptivelearning.com",
  },
  {
    icon: Phone,
    title: "Điện thoại",
    description: "Thứ Hai - Thứ Sáu từ 8 giờ sáng đến 5 giờ chiều.",
    contact: "+84 (28) 3829 3829",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "VN",
    phone: "",
    message: "",
    agreeToPrivacy: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const selectedCountry = countries.find((c) => c.code === formData.phoneCode);

  return (
    <div className="relative min-h-screen bg-white">
      <Header />

      {/* Header Section */}
      <section className="bg-white flex flex-col items-center px-8 py-24 relative w-full">
        <div className="flex flex-col gap-6 items-center relative w-full max-w-[1280px]">
          <div className="flex flex-col gap-6 items-center text-center">
            <p className="font-semibold leading-6 text-[#6941c6] text-base">
              Liên hệ với chúng tôi
            </p>
            <h1 className="font-semibold leading-[60px] text-[#181d27] text-[48px] tracking-[-0.96px]">
              Chúng tôi rất muốn nghe từ bạn
            </h1>
            <p className="font-normal leading-[30px] text-[#535862] text-xl max-w-3xl">
              Chúng tôi có văn phòng và đội ngũ trên khắp thế giới.
            </p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-white flex flex-col items-center px-8 pb-24 relative w-full">
        <div className="flex flex-col gap-16 items-center relative w-full max-w-[1280px]">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col gap-5 items-center text-center"
                >
                  <div className="flex flex-col gap-2 items-center">
                    <h3 className="font-semibold leading-[30px] text-[#181d27] text-xl">
                      {info.title}
                    </h3>
                    <p className="font-normal leading-6 text-[#535862] text-base">
                      {info.description}
                    </p>
                  </div>
                  <a
                    href={
                      info.icon === Phone
                        ? `tel:${info.contact}`
                        : `mailto:${info.contact}`
                    }
                    className="font-semibold leading-6 text-[#6941c6] text-base hover:underline"
                  >
                    {info.contact}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="bg-white flex items-start justify-center relative w-full">
        <div className="h-px relative w-full max-w-[1280px]">
          <div className="h-px w-full bg-[#e9eaeb]" />
        </div>
      </div>

      {/* Contact Form Section */}
      <section className="bg-white flex flex-col items-center px-8 py-24 relative w-full">
        <div className="flex flex-col gap-16 items-center relative w-full max-w-[1280px]">
          <div className="flex flex-col gap-5 items-center text-center max-w-[768px]">
            <p className="font-semibold leading-6 text-[#6941c6] text-base">
              Liên hệ với chúng tôi
            </p>
            <h2 className="font-semibold leading-[44px] text-[#181d27] text-[36px] tracking-[-0.72px]">
              Hãy liên hệ
            </h2>
            <p className="font-normal leading-[30px] text-[#535862] text-xl">
              Chúng tôi rất muốn nghe từ bạn. Vui lòng điền vào biểu mẫu này.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-8 items-start w-full max-w-[480px]"
          >
            {/* Form Fields */}
            <div className="flex flex-col gap-6 items-start w-full">
              {/* First Name & Last Name Row */}
              <div className="flex gap-8 items-start w-full">
                <div className="flex flex-[1_0_0] flex-col gap-1.5 items-start min-w-0">
                  <label
                    htmlFor="firstName"
                    className="font-medium leading-5 text-[#414651] text-sm"
                  >
                    Họ
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Họ"
                    className="bg-white border border-[#d5d7da] flex-1 px-4 py-3 rounded-lg shadow-sm w-full text-base text-[#181d27] placeholder:text-[#717680] focus:outline-none focus:ring-2 focus:ring-[#6941c6] focus:border-transparent"
                  />
                </div>
                <div className="flex flex-[1_0_0] flex-col gap-1.5 items-start min-w-0">
                  <label
                    htmlFor="lastName"
                    className="font-medium leading-5 text-[#414651] text-sm"
                  >
                    Tên
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Tên"
                    className="bg-white border border-[#d5d7da] flex-1 px-4 py-3 rounded-lg shadow-sm w-full text-base text-[#181d27] placeholder:text-[#717680] focus:outline-none focus:ring-2 focus:ring-[#6941c6] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 items-start w-full">
                <label
                  htmlFor="email"
                  className="font-medium leading-5 text-[#414651] text-sm"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="bg-white border border-[#d5d7da] px-4 py-3 rounded-lg shadow-sm w-full text-base text-[#181d27] placeholder:text-[#717680] focus:outline-none focus:ring-2 focus:ring-[#6941c6] focus:border-transparent"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5 items-start w-full">
                <label
                  htmlFor="phone"
                  className="font-medium leading-5 text-[#414651] text-sm"
                >
                  Số điện thoại
                </label>
                <div className="flex items-center w-full border border-[#d5d7da] rounded-lg shadow-sm overflow-hidden bg-white">
                  <div className="relative flex items-center justify-between px-4 py-3 border-r border-[#d5d7da] bg-white">
                    <select
                      value={formData.phoneCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phoneCode: e.target.value,
                        }))
                      }
                      className="font-normal text-base text-[#181d27] bg-transparent border-none outline-none cursor-pointer appearance-none pr-6 focus:ring-0"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-[#535862] absolute right-4 pointer-events-none" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+84 (28) 3829 3829"
                    className="flex-1 px-4 py-3 bg-white border-none text-base text-[#181d27] placeholder:text-[#717680] focus:outline-none"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5 items-start w-full">
                <label
                  htmlFor="message"
                  className="font-medium leading-5 text-[#414651] text-sm"
                >
                  Tin nhắn
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Nhập tin nhắn của bạn..."
                  rows={6}
                  className="bg-white border border-[#d5d7da] px-4 py-3 rounded-lg shadow-sm w-full text-base text-[#181d27] placeholder:text-[#717680] focus:outline-none focus:ring-2 focus:ring-[#6941c6] focus:border-transparent resize-none"
                />
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex gap-3 items-center w-full">
                <input
                  id="agreeToPrivacy"
                  name="agreeToPrivacy"
                  type="checkbox"
                  checked={formData.agreeToPrivacy}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-[#d5d7da] text-[#6941c6] focus:ring-2 focus:ring-[#6941c6] cursor-pointer"
                />
                <label
                  htmlFor="agreeToPrivacy"
                  className="flex-1 font-normal leading-6 text-[#535862] text-base cursor-pointer"
                >
                  Bạn đồng ý với{" "}
                  <a
                    href="#"
                    className="underline text-[#6941c6] hover:text-[#7f56d9]"
                  >
                    chính sách bảo mật
                  </a>{" "}
                  của chúng tôi.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#7f56d9] hover:bg-[#6941c6] text-white font-semibold text-base py-3 px-5 rounded-lg shadow-sm"
            >
              Gửi tin nhắn
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

