"use client";

import React, { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-[#E5E5E5] dark:divide-[#262626]">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx}>
            <button
              id={`faq-btn-${idx}`}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${idx}`}
              className="w-full flex items-center justify-between gap-4 py-5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-sm"
            >
              <span className="text-sm sm:text-base font-semibold text-[#0A0A0A] dark:text-white leading-snug">
                {item.q}
              </span>
              <span
                aria-hidden="true"
                className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:border-[#0A0A0A] dark:group-hover:border-white ${
                  isOpen
                    ? "bg-[#0A0A0A] dark:bg-white border-[#0A0A0A] dark:border-white rotate-45"
                    : "border-[#E5E5E5] dark:border-[#262626]"
                }`}
              >
                <svg
                  className={`w-3 h-3 transition-colors duration-200 ${
                    isOpen
                      ? "stroke-white dark:stroke-[#0A0A0A]"
                      : "stroke-[#737373] dark:stroke-neutral-400 group-hover:stroke-[#0A0A0A] dark:group-hover:stroke-white"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>

            <div
              id={`faq-panel-${idx}`}
              role="region"
              aria-labelledby={`faq-btn-${idx}`}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed pr-10">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
