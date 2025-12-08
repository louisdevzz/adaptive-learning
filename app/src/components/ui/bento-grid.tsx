import { ComponentPropsWithoutRef, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  className: string
  background?: ReactNode | null
  Icon: React.ElementType
  description: string
  href?: string
  cta?: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-start overflow-hidden rounded-xl",
      // light styles
      "bg-white border border-neutral-200/60 hover:border-neutral-300 hover:shadow-sm transition-all duration-300",
      // dark styles
      "dark:bg-neutral-900 dark:border-neutral-800",
      className
    )}
    {...props}
  >
    {background && <div>{background}</div>}
    <div className="p-6 flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-3">
        <div className="bg-[#f4ebff] rounded-lg w-12 h-12 flex items-center justify-center shrink-0">
          <Icon className="h-6 w-6 text-[#7f56d9]" />
        </div>
        <h3 className="text-lg font-semibold leading-6 text-[#181d27] dark:text-neutral-100">
          {name}
        </h3>
        <p className="text-sm leading-[22px] text-[#535862] dark:text-neutral-400">
          {description}
        </p>
      </div>
    </div>
  </div>
)

export { BentoCard, BentoGrid }
