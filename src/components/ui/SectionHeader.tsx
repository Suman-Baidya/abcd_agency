import React from "react";

interface SectionHeaderProps {
  subtitle: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
}

export function SectionHeader({
  subtitle,
  title,
  description,
  align = "center",
  as: Tag = "h2",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col ${
        align === "center" ? "items-center text-center" : "items-start text-left"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        {align === "center" && (
          <span className="w-8 h-[1px] bg-[#0A0A0A] dark:bg-white hidden sm:block" />
        )}
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#0A0A0A] dark:text-white">
          {subtitle}
        </span>
        {align === "left" && (
          <span className="w-12 h-[1px] bg-[#0A0A0A] dark:bg-white" />
        )}
        {align === "center" && (
          <span className="w-8 h-[1px] bg-[#0A0A0A] dark:bg-white hidden sm:block" />
        )}
      </div>

      <Tag 
        className={
          Tag === "h1" 
            ? "text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A0A0A] dark:text-white leading-[1.1]"
            : "text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] dark:text-white"
        }
      >
        {title}
      </Tag>

      {description && (
        <p
          className={`mt-6 text-base sm:text-lg text-[#737373] leading-relaxed max-w-2xl ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
