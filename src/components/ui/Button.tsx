import React from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "white" | "white-outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  isExternal?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0A0A0A] text-white border border-[#0A0A0A] hover:bg-[#262626] active:bg-[#111111] dark:bg-white dark:text-[#0A0A0A] dark:border-white dark:hover:bg-[#E5E5E5] dark:active:bg-[#D4D4D4] shadow-xs",
  secondary:
    "bg-transparent text-[#0A0A0A] border border-[#0A0A0A] hover:bg-[#F5F5F5] active:bg-[#E5E5E5] dark:text-white dark:border-white dark:hover:bg-[#262626] dark:active:bg-[#111111]",
  ghost:
    "bg-transparent text-[#0A0A0A] border border-transparent hover:bg-[#F5F5F5] active:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#262626] dark:active:bg-[#111111]",
  white:
    "bg-white text-[#0A0A0A] border border-white hover:bg-[#E5E5E5] active:bg-[#D4D4D4] shadow-xs",
  "white-outline":
    "bg-transparent text-white border border-white hover:bg-white/10 active:bg-white/20",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-[36px] px-3.5 py-1.5 text-xs font-medium tracking-tight rounded-md gap-1.5",
  md: "min-h-[44px] px-5 py-2.5 text-sm font-medium tracking-tight rounded-md gap-2",
  lg: "min-h-[48px] px-6 py-3 text-base font-medium tracking-tight rounded-md gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      href,
      isExternal = false,
      className = "",
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const baseClasses = `inline-flex items-center justify-center font-sans transition-all duration-150 select-none cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${
      variantStyles[variant]
    } ${sizeStyles[size]} ${className}`;

    if (href) {
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClasses}
          >
            {children}
          </a>
        );
      }

      return (
        <Link href={href} className={baseClasses}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={baseClasses}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
