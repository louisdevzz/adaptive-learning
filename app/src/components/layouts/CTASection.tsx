"use client";

import { Button } from "@heroui/button";

export function CTASection() {
  return (
    <section className="bg-neutral-50 flex flex-col items-center overflow-clip px-0 py-24 relative w-full">
      <div className="flex flex-col items-start px-8 py-0 w-full max-w-[1280px]">
        <div className="flex flex-col gap-10 items-center relative w-full">
          <div className="flex flex-col gap-5 items-center text-center w-[768px]">
            <h2 className="font-semibold leading-[48px] text-[#181d27] text-[32px] tracking-[-0.64px] w-full">
              Bắt đầu hành trình học tập của bạn
            </h2>
            <p className="font-normal leading-[28px] text-[#535862] text-lg w-full">
              Tham gia cùng hàng nghìn học sinh đang trải nghiệm học tập cá nhân hóa, thích ứng.
            </p>
          </div>
          <div className="flex gap-3 items-start relative">
            <Button
              variant="bordered"
              className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
            >
              Tìm hiểu thêm
            </Button>
            <Button className="bg-[#7f56d9] text-white font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
              Bắt đầu học
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

