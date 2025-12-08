"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/react";
import { Input } from "@heroui/input";
import Image from "next/image";
import {
  Search,
  Home,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Layers,
  CheckSquare,
  Flag,
  Users,
  LifeBuoy,
  Settings,
  LogOut,
} from "lucide-react";

function Logo() {
  return (
    <div className="h-8 relative w-full">
      <div className="relative">
        <p className="text-xl font-semibold text-[#181d27]">Adaptive Learning</p>
      </div>
    </div>
  );
}

export function SidebarNavigation() {
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);

  return (
    <div className="bg-white flex fixed left-0 top-0 h-screen items-start overflow-y-auto shrink-0 w-[240px] z-10">
      <div className="flex flex-1 flex-col min-h-full items-start justify-between relative shrink-0 w-full">
        <div className="flex flex-col gap-4 items-start pb-0 pt-6 px-0 relative shrink-0 w-full">
          {/* Header */}
          <div className="flex flex-col items-start pl-4 pr-3 py-0 relative shrink-0 w-full">
            <Logo />
          </div>

          {/* Search */}
          <div className="flex flex-col items-start px-4 py-0 relative shrink-0 w-full">
            <Input
              placeholder="Search"
              size="sm"
              startContent={
                <Search className="size-4 text-[#717680]" />
              }
              className="w-full"
              classNames={{
                input: "text-sm text-[#717680]",
                inputWrapper: "border-[#d5d7da] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] h-9",
              }}
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-0.5 items-start px-3 py-0 relative shrink-0 w-full">
            {/* Home */}
            <div className="flex items-start relative shrink-0 w-full">
              <div className="bg-white flex flex-1 items-center justify-between overflow-clip px-2.5 py-1.5 relative rounded-md">
                <div className="flex gap-2 items-center relative shrink-0">
                  <Home className="size-5 text-[#414651]" />
                  <p className="font-semibold leading-5 text-[#414651] text-sm">Home</p>
                </div>
                <div className="flex items-center relative shrink-0">
                  <ChevronDown className="size-4 text-[#414651]" />
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
              <button
                onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                className={`flex items-center justify-between overflow-clip px-2.5 py-1.5 relative rounded-md w-full ${
                  isDashboardOpen ? "bg-neutral-50" : "bg-white"
                }`}
              >
                <div className="flex gap-2 items-center relative shrink-0">
                  <BarChart3 className="size-5 text-[#414651]" />
                  <p className="font-semibold leading-5 text-[#414651] text-sm">Dashboard</p>
                </div>
                <div className="flex items-center relative shrink-0">
                  {isDashboardOpen ? (
                    <ChevronUp className="size-4 text-[#414651]" />
                  ) : (
                    <ChevronDown className="size-4 text-[#414651]" />
                  )}
                </div>
              </button>
              {isDashboardOpen && (
                <div className="flex flex-col gap-0.5 items-start pb-1.5 pt-0 px-0 relative shrink-0 w-full">
                  <div className="bg-neutral-50 flex items-center overflow-clip pl-10 pr-2.5 py-1.5 relative rounded-md w-full">
                    <p className="font-semibold leading-5 text-[#414651] text-sm">Overview</p>
                  </div>
                  <div className="bg-white flex items-center justify-between overflow-clip pl-10 pr-2.5 py-1.5 relative rounded-md w-full">
                    <p className="font-semibold leading-5 text-[#414651] text-sm">Notifications</p>
                    <div className="flex items-center relative shrink-0">
                      <div className="bg-neutral-100 flex items-center justify-center px-2 py-0.5 relative rounded-2xl">
                        <p className="font-medium leading-4 text-[#414651] text-xs text-center">10</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white flex items-center overflow-clip pl-10 pr-2.5 py-1.5 relative rounded-md w-full">
                    <p className="font-semibold leading-5 text-[#414651] text-sm">Trade history</p>
                  </div>
                </div>
              )}
            </div>

            {/* Other nav items */}
            {[
              { icon: Layers, label: "Projects" },
              { icon: CheckSquare, label: "Tasks" },
              { icon: Flag, label: "Reporting" },
              { icon: Users, label: "Users" },
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.label} className="flex items-start relative shrink-0 w-full">
                  <div className="bg-white flex flex-1 items-center justify-between overflow-clip px-2.5 py-1.5 relative rounded-md">
                    <div className="flex gap-2 items-center relative shrink-0">
                      <IconComponent className="size-5 text-[#414651]" />
                      <p className="font-semibold leading-5 text-[#414651] text-sm">{item.label}</p>
                    </div>
                    <div className="flex items-center relative shrink-0">
                      <ChevronDown className="size-4 text-[#414651]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 items-start pb-6 pt-0 px-3 relative shrink-0 w-full">
          <div className="flex flex-col gap-0.5 items-start relative shrink-0 w-full">
            <div className="bg-white flex items-center overflow-clip px-2.5 py-1.5 relative rounded-md w-full">
              <div className="flex gap-2 items-center relative shrink-0">
                <LifeBuoy className="size-5 text-[#414651]" />
                <p className="font-semibold leading-5 text-[#414651] text-sm">Support</p>
              </div>
            </div>
            <div className="bg-white flex items-center overflow-clip px-2.5 py-1.5 relative rounded-md w-full">
              <div className="flex gap-2 items-center relative shrink-0">
                <Settings className="size-5 text-[#414651]" />
                <p className="font-semibold leading-5 text-[#414651] text-sm">Settings</p>
              </div>
            </div>
          </div>

          {/* Used space card */}
          <div className="bg-neutral-50 flex flex-col gap-3 items-start px-3 py-4 relative rounded-lg w-full">
            <div className="flex flex-col gap-0.5 items-start relative shrink-0 w-full">
              <p className="font-semibold leading-4 text-[#181d27] text-xs w-full">Used space</p>
              <p className="font-normal leading-4 text-[#535862] text-xs w-full">
                Your team has used 80% of your available space. Need more?
              </p>
            </div>
            <div className="flex items-center relative shrink-0 w-full">
              <div className="flex-1 h-1.5 relative rounded-lg">
                <div className="absolute bg-[#f4ebff] h-1.5 left-0 right-0 rounded top-0" />
                <div className="absolute bg-[#7f56d9] h-1.5 left-0 right-[16.63%] rounded top-0" />
              </div>
            </div>
            <div className="flex gap-2 items-start relative shrink-0">
              <Button variant="light" className="text-[#535862] font-semibold text-xs p-0 min-w-0 h-auto">
                Dismiss
              </Button>
              <Button variant="light" className="text-[#6941c6] font-semibold text-xs p-0 min-w-0 h-auto">
                Upgrade plan
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px relative shrink-0 w-full">
            <div className="h-px w-full bg-[#e9eaeb]" />
          </div>

          {/* Account */}
          <div className="flex items-start justify-between px-2 py-0 relative shrink-0 w-full">
            <div className="flex gap-2 items-center relative shrink-0">
              <Avatar
                src={'/asset/4f9e135d-72bf-49d5-8313-cacb6abeb703.svg'}
                size="sm"
                className="relative rounded-full shrink-0"
              />
              <div className="flex flex-col items-start relative shrink-0">
                <p className="font-semibold leading-4 text-[#181d27] text-xs">Olivia Rhye</p>
                <p className="font-normal leading-4 text-[#535862] text-xs">olivia@untitledui.com</p>
              </div>
            </div>
            <div className="relative shrink-0 size-4">
              <Button
                variant="light"
                isIconOnly
                size="sm"
                className="p-1 min-w-0 h-auto"
              >
                <LogOut className="size-4 text-[#414651]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

