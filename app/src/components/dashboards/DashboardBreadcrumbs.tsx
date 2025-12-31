"use client";

import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Home } from "lucide-react";
import Link from "next/link";

interface DashboardBreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export function DashboardBreadcrumbs({ items }: DashboardBreadcrumbsProps) {
  return (
    <Breadcrumbs
      size="sm"
      separator="/"
      itemClasses={{
        item: "text-[#4c669a] text-sm font-normal",
        separator: "text-gray-300",
      }}
      classNames={{
        list: "gap-2",
      }}
    >
      <BreadcrumbItem>
        <Link href="/dashboard" className="flex items-center gap-1">
          <Home className="w-4 h-4" />
          Trang chủ
        </Link>
      </BreadcrumbItem>
      {items.map((item, index) => (
        <BreadcrumbItem
          key={`${item.label}-${item.href || index}-${index}`}
          isCurrent={index === items.length - 1 && !item.href}
        >
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            item.label
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
}

