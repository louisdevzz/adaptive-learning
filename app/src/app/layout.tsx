import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import Provider from "@/components/Provider";
import { Toaster } from "sonner";
import localFont from "next/font/local";

import "./globals.css";

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dinRound = localFont({
  variable: "--font-din-round",
  src: [
    {
      path: "../fonts/GMV_DIN_Pro.ttf",
      style: "normal",
    },
  ],
});

const dinRoundMedium = localFont({
  variable: "--font-din-round-medium",
  src: [
    {
      path: "../fonts/GMV_DIN_Pro-Medium.ttf",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Adaptive Learning Platform v3.0 - Học tập thông minh, cá nhân hóa",
  description:
    "Nền tảng học tập thông minh được thiết kế để cá nhân hoá hành trình học của từng học sinh. Hệ thống phân rã kiến thức thành các đơn vị nhỏ (Knowledge Points), theo dõi mức độ nắm vững theo thời gian thực và tự động đề xuất nội dung phù hợp với năng lực hiện tại.",
  keywords: [
    "adaptive learning",
    "học tập thông minh",
    "cá nhân hóa",
    "education",
    "knowledge points",
    "mastery tracking",
    "AI learning",
    "personalized education",
    "học tập thích ứng",
  ],
  authors: [{ name: "Adaptive Learning Team" }],
  creator: "Adaptive Learning Platform",
  publisher: "Adaptive Learning Platform",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Adaptive Learning Platform v3.0 - Học tập thông minh, cá nhân hóa",
    description:
      "Nền tảng học tập thông minh với cá nhân hóa theo thời gian thực. Phân rã kiến thức, theo dõi mastery và tự động đề xuất nội dung phù hợp.",
    type: "website",
    locale: "vi_VN",
    siteName: "Adaptive Learning Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adaptive Learning Platform v3.0",
    description:
      "Nền tảng học tập thông minh với cá nhân hóa theo thời gian thực",
    creator: "@adaptivelearning",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${robotoFlex.className} ${dinRound.variable} ${dinRoundMedium.variable} font-sans antialiased`}
      >
        <Provider>
          {children}
          <Toaster position="bottom-right" />
        </Provider>
      </body>
    </html>
  );
}
