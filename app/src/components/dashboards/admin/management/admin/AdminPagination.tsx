"use client";

import { Button } from "@heroui/button";
import { ChevronDown } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="border-[#e9eaeb] border-b-0 border-l-0 border-r-0 border-solid border-t flex items-center justify-between pb-3 pt-2 px-4 relative shrink-0 w-full">
      <div className="flex gap-2 items-start relative shrink-0">
        <Button
          variant="bordered"
          size="sm"
          isDisabled={currentPage === 1}
          className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
          startContent={<ChevronDown className="size-4 text-[#414651] rotate-90" />}
          onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          Trước
        </Button>
        <Button
          variant="bordered"
          size="sm"
          isDisabled={currentPage === totalPages}
          className="border-[#d5d7da] text-[#414651] font-semibold shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
          endContent={<ChevronDown className="size-4 text-[#414651] -rotate-90" />}
          onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          Sau
        </Button>
      </div>
      <p className="font-medium leading-4 text-[#414651] text-xs">
        Trang {currentPage} của {totalPages}
      </p>
    </div>
  );
}

