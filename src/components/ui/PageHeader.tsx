import React from "react";

interface PageHeaderProps {
  subtitle: string;
  title: string;
  description?: string;
}

/**
 * PageHeader - used for the top hero section of all inner/sub pages.
 * Clean white-background design with subtitle tag, title, and description.
 * Distinct from the homepage Hero by using a smaller title scale.
 */
export function PageHeader({ subtitle, title, description }: PageHeaderProps) {
  return (
    <section className="pt-16 pb-16 md:pt-24 md:pb-20 bg-white dark:bg-[#0A0A0A] border-b border-[#E5E5E5] dark:border-[#262626] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#737373] dark:text-neutral-400 mb-4">
            {subtitle}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] dark:text-white leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-5 text-base sm:text-lg text-[#737373] dark:text-neutral-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
