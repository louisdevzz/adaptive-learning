"use client";

import Image from "next/image";

const companyLogos = [
  {
    name: "Layers",
    logomark: "/asset/2d699369-72c3-4431-9d12-4a012cd915b0.svg",
    logotype: "/asset/06ee8c3f-9e6a-4606-b5a6-cdf9cc549f1b.svg",
  },
  {
    name: "Sisyphus",
    logomark: "/asset/e4484391-26ab-43fa-945b-f8abf9dea1f6.svg",
    logotype: "/asset/55c1a0af-2ab9-4c44-8fb4-e89bd8f71230.svg",
  },
  {
    name: "Circooles",
    logomark: "/asset/0c55de01-6114-4bc3-80ad-db0032b5350e.svg",
    logotype: "/asset/49affa70-44a9-4878-a64b-df39a67147b9.svg",
  },
  {
    name: "Catalog",
    logomark: "/asset/2277bbee-a167-4bf7-9078-c14ea0a7c9c4.svg",
    logotype: "/asset/3940607e-1e01-4267-8801-857568e47c1e.svg",
  },
  {
    name: "Quotient",
    logomark: "/asset/0d279e37-8a8c-432b-af64-84067799a097.svg",
    logotype: "/asset/1bcd83c9-9a56-4ec9-b1e7-86f57db8e391.svg",
  },
];

export function SocialProofSection() {
  return (
    <section className="bg-white flex items-start justify-center px-0 py-24 relative w-full">
      <div className="flex flex-col gap-8 items-start px-8 py-0 w-full max-w-[1280px]">
        <p className="font-medium leading-6 text-[#535862] text-base text-center w-full">
          Được tin tưởng bởi các trường học và tổ chức giáo dục trên toàn thế giới
        </p>
        <div className="flex items-center justify-between relative w-full">
          {companyLogos.map((company, index) => (
            <div key={index} className="h-12 relative ">
              <div className="">
                <Image
                  src={company.logomark}
                  alt={company.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="absolute mt-3">
                <Image
                  src={company.logotype}
                  alt={company.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

