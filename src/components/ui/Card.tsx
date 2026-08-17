import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "dark" | "outline";
  hoverEffect?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  hoverEffect = false,
  className = "",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white",
    muted: "bg-[#F5F5F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white",
    dark: "bg-[#0A0A0A] border border-[#262626] text-white",
    outline: "bg-transparent border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white",
  };

  const hoverClasses = hoverEffect
    ? "transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:hover:border-neutral-700 cursor-pointer"
    : "";

  return (
    <div
      className={`rounded-xl p-6 sm:p-8 ${variantStyles[variant]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
