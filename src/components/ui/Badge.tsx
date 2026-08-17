import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "outline" | "solid" | "muted" | "dark";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Badge({
  variant = "outline",
  size = "sm",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    outline: "bg-transparent text-[#0A0A0A] dark:text-neutral-300 border border-[#E5E5E5] dark:border-[#262626]",
    solid: "bg-[#0A0A0A] text-white border border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A] dark:border-white",
    muted: "bg-[#F5F5F5] dark:bg-[#111111] text-[#0A0A0A] dark:text-neutral-300 border border-[#E5E5E5] dark:border-[#262626]",
    dark: "bg-[#262626] text-white border border-[#383838]",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs font-medium",
    md: "px-3.5 py-1 text-xs font-medium",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full tracking-tight select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
