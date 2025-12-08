"use client";

import Image from "next/image";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { InteractiveHoverButtonCustom } from "./InteractiveHoverButtonCustom";

const imgMacBookPro16 = "https://www.figma.com/api/mcp/asset/b51ba77d-bdd5-4dbd-b42c-a2f6f8ddea38";
const imgShadow = "https://www.figma.com/api/mcp/asset/07c6f504-e734-4ea2-b0b1-b5ccd17ec257";
const imgCamera = "https://www.figma.com/api/mcp/asset/d3661080-282d-408a-9a39-93f940262243";
const imgLogo = "https://www.figma.com/api/mcp/asset/3f1b6caa-c6a3-4bcd-9378-93a5817c883e";
const imgScreenMockupReplaceFill11 = "https://www.figma.com/api/mcp/asset/ebb36926-ec82-4b1a-a42e-4056ea528b0f";

export function HeroSection() {
  return (
    <section className="flex flex-col isolate items-center overflow-clip relative w-full bg-white">
      <div className="flex flex-col gap-16 items-center pb-0 pt-24 px-0 relative w-full z-10">
        <div className="flex flex-col items-center px-8 py-0 w-full max-w-[1280px]">
          <div className="flex flex-col gap-12 items-center relative w-full">
            {/* Heading and supporting text */}
            <div className="flex flex-col gap-6 items-center relative w-[1024px]">
              <div className="flex flex-col gap-4 items-center relative w-full">
                {/* Badge */}
                <div className="bg-[#f9f5ff] flex gap-3 items-center mix-blend-multiply pl-1 pr-[10px] py-1 relative rounded-2xl">
                  <div className="bg-white border border-[#e9d7fe] border-solid flex items-center justify-center px-[10px] py-0.5 relative rounded-2xl">
                    <p className="font-medium leading-5 text-[#6941c6] text-sm text-center">
                      Tính năng mới
                    </p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <p className="font-medium leading-5 text-[#6941c6] text-sm">
                      Khám phá lộ trình học tập cá nhân hóa
                    </p>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Main heading */}
                <h1 className="font-semibold leading-[72px] min-w-full text-[#181d27] text-[58px] text-center tracking-[-1.2px] w-min">
                  Học tập thông minh, thích ứng với bạn
                </h1>
              </div>

              {/* Supporting text */}
              <p className="font-normal leading-[30px] text-[#535862] text-lg text-center w-[768px]">
                Nền tảng học tập thông minh cá nhân hóa hành trình giáo dục của bạn. Nắm vững các điểm kiến thức theo tốc độ riêng với đề xuất AI và theo dõi tiến độ theo thời gian thực.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 items-start">
              <InteractiveHoverButton
                className="border-[#d5d7da] text-[#414651] bg-white hover:bg-[#f9fafb]"
              >
                Xem demo
              </InteractiveHoverButton>
              <InteractiveHoverButtonCustom />
            </div>
          </div>
        </div>

        {/* MacBook Mockup */}
        <div className="flex flex-col items-center px-8 py-0 w-full max-w-[1280px]">
          <div className="h-[480px] relative w-full">
            <div className="absolute h-[710.125px] left-1/2 overflow-clip top-0 -translate-x-1/2 w-[1216px]">
              {/* Shadow */}
              <div className="absolute inset-[98.69%_-0.02%_0.22%_-1.67%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <Image src={imgShadow} alt="" fill className="object-cover" />
                </div>
              </div>
              {/* MacBook */}
              <div className="absolute bottom-[0.58%] left-[0.94%] right-[0.92%] top-0">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <Image src={imgMacBookPro16} alt="" fill className="object-cover" />
                </div>
              </div>
              {/* Camera */}
              <div className="absolute inset-[1.67%_49.43%_97.53%_50.1%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <Image src={imgCamera} alt="" fill className="object-cover" />
                </div>
              </div>
              {/* Logo */}
              <div className="absolute inset-[91.73%_46.91%_7%_47.58%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <Image src={imgLogo} alt="" fill className="object-cover" />
                </div>
              </div>
              {/* Screen */}
              <div className="absolute inset-[3.1%_9.13%_10.44%_9.95%]">
                <Image src={imgScreenMockupReplaceFill11} alt="" fill className="object-cover rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

