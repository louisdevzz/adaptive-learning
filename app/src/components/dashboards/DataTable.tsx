"use client";

import { Checkbox } from "@heroui/checkbox";
import { Avatar } from "@heroui/react";
import { Button } from "@heroui/button";
import Image from "next/image";
import { ChevronDown, MoreVertical } from "lucide-react";
const imgCatalog = "https://www.figma.com/api/mcp/asset/1bfbd230-cd91-4aa8-9284-cb3801818745";
const imgCircooles = "https://www.figma.com/api/mcp/asset/8500016d-d67b-4583-8c31-a870250c86e2";
const imgCommandR = "https://www.figma.com/api/mcp/asset/cc2ac929-64d4-4615-a1ab-2e301ae5ebdd";
const imgHourglass = "https://www.figma.com/api/mcp/asset/218eb06f-f806-4181-bdc2-2843796cf300";
const imgLayers = "https://www.figma.com/api/mcp/asset/6b570e05-179a-4c6d-b945-b202c105cbbe";
const imgQuotient = "https://www.figma.com/api/mcp/asset/fe4edb28-1cd4-4cd7-8766-8c4efa2fce7e";
const imgSisyphus = "https://www.figma.com/api/mcp/asset/3f2e2ead-2cb3-4b90-a9fe-8cd67ce1eaec";
const imgText = "https://www.figma.com/api/mcp/asset/b02e1023-416e-4856-8b5c-23735a0475f9";
const imgAvatar1 = "https://www.figma.com/api/mcp/asset/6094a0aa-6083-4a9f-9a06-4712b6945d2f";
const imgAvatar2 = "https://www.figma.com/api/mcp/asset/3cd6531f-aa4d-4e91-8c94-399304ba4dea";
const imgAvatar3 = "https://www.figma.com/api/mcp/asset/411e7d0a-05a1-4690-a1cc-58fc227535b4";
const imgAvatar4 = "https://www.figma.com/api/mcp/asset/13bf2f18-e1b7-4993-ad07-9b7ba89201f7";
const imgAvatar5 = "https://www.figma.com/api/mcp/asset/83867545-4edb-434d-a7f8-1b1227e81a1e";
const imgAvatar6 = "https://www.figma.com/api/mcp/asset/5370c1b9-a272-4ff2-884d-8226076a97d3";
const imgAvatar7 = "https://www.figma.com/api/mcp/asset/2d7f9522-7faf-4080-8c3e-b5fabc2f3fad";
const imgAvatar8 = "https://www.figma.com/api/mcp/asset/bbeb5750-f6b7-40f3-9d75-aad928fb4f37";

interface TableRow {
  id: string;
  company: string;
  domain: string;
  logo: string;
  status: "Customer" | "Churned";
  users: string[];
  about: {
    title: string;
    description: string;
  };
  checked: boolean;
}

const tableData: TableRow[] = [
  {
    id: "1",
    company: "Catalog",
    domain: "catalogapp.io",
    logo: imgCatalog,
    status: "Customer",
    users: [imgText, imgText, imgAvatar1, imgAvatar2, imgAvatar3],
    about: { title: "Content curating app", description: "Brings all your news into one place" },
    checked: true,
  },
  {
    id: "2",
    company: "Circooles",
    domain: "getcirooles.com",
    logo: imgCircooles,
    status: "Churned",
    users: [imgAvatar4, imgAvatar5, imgText, imgText, imgAvatar6],
    about: { title: "Design software", description: "Super lightweight design app" },
    checked: true,
  },
  {
    id: "3",
    company: "Command+R",
    domain: "cmdr.ai",
    logo: imgCommandR,
    status: "Customer",
    users: [imgAvatar6, imgAvatar7, imgText, imgText, imgAvatar8],
    about: { title: "Data prediction", description: "AI and machine learning data" },
    checked: true,
  },
  {
    id: "4",
    company: "Hourglass",
    domain: "hourglass.app",
    logo: imgHourglass,
    status: "Customer",
    users: [imgAvatar3, imgText, imgAvatar1, imgAvatar2, imgAvatar4],
    about: { title: "Productivity app", description: "Time management and productivity" },
    checked: false,
  },
  {
    id: "5",
    company: "Layers",
    domain: "getlayers.io",
    logo: imgLayers,
    status: "Churned",
    users: [imgText, imgAvatar5, imgText, imgAvatar6, imgAvatar7],
    about: { title: "Web app integrations", description: "Connect web apps seamlessly" },
    checked: false,
  },
  {
    id: "6",
    company: "Quotient",
    domain: "quotient.co",
    logo: imgQuotient,
    status: "Customer",
    users: [imgAvatar2, imgAvatar3, imgText, imgAvatar4, imgAvatar5],
    about: { title: "Sales CRM", description: "Web-based sales doc management" },
    checked: true,
  },
  {
    id: "7",
    company: "Sisyphus",
    domain: "sisyphus.com",
    logo: imgSisyphus,
    status: "Customer",
    users: [imgAvatar5, imgAvatar6, imgText, imgAvatar7, imgAvatar8],
    about: { title: "Automation and workflow", description: "Time Letter spacing, invoicing and expenses" },
    checked: true,
  },
];

export function DataTable() {
  return (
    <div className="bg-white border border-[#e9eaeb] border-solid flex flex-col items-start overflow-clip relative rounded-xl shadow-[0px_1px_3px_0px_rgba(10,13,18,0.1),0px_1px_2px_0px_rgba(10,13,18,0.06)] w-full">
      <div className="bg-white flex items-start relative shrink-0 w-full">
        {/* Company Column */}
        <div className="flex flex-1 flex-col items-start relative shrink-0">
          {/* Header */}
          <div className="bg-white border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-2 h-10 items-center px-4 py-2 relative shrink-0 w-full">
            <Checkbox isSelected={true} isIndeterminate={true} size="sm" />
            <div className="flex gap-1 items-center relative shrink-0">
              <p className="font-medium leading-4 text-[#535862] text-xs">Company</p>
              <ChevronDown className="size-3 text-[#535862]" />
            </div>
          </div>
          {/* Rows */}
          {tableData.map((row, index) => (
            <div
              key={row.id}
              className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-2 h-14 items-center px-4 py-3 relative shrink-0 w-full ${
                index % 2 === 0 ? "bg-neutral-50" : ""
              }`}
            >
              <Checkbox isSelected={row.checked} size="sm" />
              <div className="relative rounded-full shrink-0 size-8">
                <Image
                  src={row.logo}
                  alt={row.company}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col items-start relative shrink-0">
                <p className="font-medium leading-4 text-[#181d27] text-xs">{row.company}</p>
                <p className="font-normal leading-4 text-[#535862] text-xs">{row.domain}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Column */}
        <div className="flex flex-col items-start relative shrink-0">
          <div className="bg-white border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex h-10 items-center px-4 py-2 relative shrink-0 w-full">
            <p className="font-medium leading-4 text-[#535862] text-xs">Status</p>
          </div>
          {tableData.map((row, index) => (
            <div
              key={row.id}
              className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex h-14 items-center px-4 py-3 relative shrink-0 w-full ${
                index % 2 === 0 ? "bg-neutral-50" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center px-1.5 py-0.5 relative rounded-2xl ${
                  row.status === "Customer" ? "bg-[#ecfdf3]" : "bg-neutral-100"
                }`}
              >
                <p
                  className={`font-medium leading-4 text-xs text-center ${
                    row.status === "Customer" ? "text-[#027a48]" : "text-[#414651]"
                  }`}
                >
                  {row.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Users Column */}
        <div className="flex flex-col items-start relative shrink-0">
          <div className="bg-white border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex h-10 items-center px-4 py-2 relative shrink-0 w-full">
            <p className="font-medium leading-4 text-[#535862] text-xs">Users</p>
          </div>
          {tableData.map((row, index) => (
            <div
              key={row.id}
              className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex h-14 items-center px-4 py-2.5 relative shrink-0 w-full ${
                index % 2 === 0 ? "bg-neutral-50" : ""
              }`}
            >
              <div className="flex items-start relative shrink-0">
                <div className="flex items-start pl-0 pr-1 py-0 relative shrink-0">
                  {row.users.slice(0, 5).map((user, i) => (
                    <Avatar
                      key={i}
                      src={user}
                      size="sm"
                      className="border border-solid border-white -mr-1 relative rounded-full"
                    />
                  ))}
                  {row.users.length > 5 && (
                    <div className="bg-[#f9f5ff] border border-solid border-white -mr-1 relative rounded-full shrink-0 size-5">
                      <p className="absolute font-medium leading-4 left-1/2 text-[#7f56d9] text-xs text-center top-1/2 -translate-x-1/2 -translate-y-1/2">
                        +{row.users.length - 5}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* About Column */}
        <div className="flex flex-col items-start relative shrink-0">
          <div className="bg-white border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex h-10 items-center px-4 py-2 relative shrink-0 w-full">
            <p className="font-medium leading-4 text-[#535862] text-xs">About</p>
          </div>
          {tableData.map((row, index) => (
            <div
              key={row.id}
              className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex flex-col h-14 items-start px-4 py-3 relative shrink-0 w-full ${
                index % 2 === 0 ? "bg-neutral-50" : ""
              }`}
            >
              <p className="font-normal leading-4 text-[#181d27] text-xs">{row.about.title}</p>
              <p className="font-normal leading-4 text-[#535862] text-xs">{row.about.description}</p>
            </div>
          ))}
        </div>

        {/* Actions Column */}
        <div className="flex flex-col items-start relative shrink-0">
          <div className="bg-white border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 h-10 relative shrink-0 w-full" />
          {tableData.map((row, index) => (
            <div
              key={row.id}
              className={`border-[#e9eaeb] border-b border-l-0 border-r-0 border-solid border-t-0 flex gap-1 h-14 items-center p-3 relative shrink-0 w-full ${
                index % 2 === 0 ? "bg-neutral-50" : ""
              }`}
            >
              <Button variant="light" isIconOnly size="sm" className="p-1 min-w-0 h-auto">
                <MoreVertical className="size-4 text-[#414651]" />
              </Button>
              <Button variant="light" isIconOnly size="sm" className="p-1 min-w-0 h-auto">
                <MoreVertical className="size-4 text-[#414651]" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

