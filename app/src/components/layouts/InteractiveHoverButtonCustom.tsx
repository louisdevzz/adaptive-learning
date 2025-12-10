"use client";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonCustom extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function InteractiveHoverButtonCustom({
  children = "Bắt đầu học",
  className,
  ...props
}: InteractiveHoverButtonCustom) {
  return (
    <InteractiveHoverButton
      className={cn(
        "border-[#6941c6]/60 bg-[#6941c6]/10 text-[#6941c6] hover:bg-[#6941c6] hover:border-[#6941c6]",
        "shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]",
        "transition-all duration-300",
        // Override primary colors for dot and hover text
        "[&>div:first-child>div:first-child]:bg-[#6941c6]",
        "[&>div:last-child]:text-white",
        className
      )}
      {...props}
    >
      {children}
    </InteractiveHoverButton>
  );
}

