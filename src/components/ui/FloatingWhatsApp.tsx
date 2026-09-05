"use client";

import React, { useState } from "react";

export function FloatingWhatsApp() {
  const [hovered, setHovered] = useState(false);
  const whatsappNumber = "918167685731";
  const defaultMessage = encodeURIComponent(
    "Hi ABCD Agency, I would like to discuss a project."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 select-none">
      {/* Tooltip on Hover / Focus */}
      <div
        className={`hidden sm:flex items-center px-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white text-xs font-medium shadow-md transition-all duration-200 pointer-events-none ${
          hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        }`}
      >
        <span>Chat on WhatsApp (+91 81676 85731)</span>
      </div>

      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Direct WhatsApp Chat with ABCD Agency"
        className="relative group w-12 h-12 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] dark:hover:bg-white dark:hover:text-[#0A0A0A] dark:hover:border-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
      >
        {/* Pulsing Active Online Indicator */}
        <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-[#111111]" />
        </span>

        {/* WhatsApp Vector Icon (Black/Monochrome) */}
        <svg
          className="w-5.5 h-5.5 fill-current transition-transform group-hover:scale-105"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.031 0C5.396 0 .029 5.367.029 11.987c0 2.108.549 4.168 1.595 5.972L0 24l6.235-1.587c1.734.945 3.684 1.442 5.796 1.442 6.636 0 12.003-5.367 12.003-11.987C24.034 5.367 18.667 0 12.031 0zm0 21.84c-1.802 0-3.568-.484-5.109-1.399l-.366-.217-3.797.967.985-3.699-.239-.379c-1.006-1.6-1.536-3.468-1.536-5.386 0-5.525 4.495-10.02 10.062-10.02 5.567 0 10.062 4.495 10.062 10.02 0 5.525-4.495 10.02-10.062 10.02zm5.513-7.514c-.302-.151-1.786-.882-2.063-.983-.277-.101-.478-.151-.68.151-.201.302-.781.983-.957 1.185-.176.201-.352.226-.654.075-.302-.151-1.275-.47-2.428-1.499-.898-.801-1.504-1.791-1.68-2.093-.176-.302-.019-.465.132-.616.136-.135.302-.352.453-.528.151-.176.201-.302.302-.503.101-.201.05-.377-.025-.528-.075-.151-.68-1.639-.931-2.244-.244-.59-.493-.51-.68-.52-.176-.009-.377-.009-.579-.009-.201 0-.528.075-.805.377-.277.302-1.057 1.033-1.057 2.519s1.082 2.922 1.233 3.123c.151.201 2.13 3.253 5.16 4.562.721.312 1.284.498 1.723.638.724.23 1.382.198 1.903.12.58-.087 1.786-.73 2.038-1.434.252-.704.252-1.308.176-1.434-.075-.126-.277-.201-.579-.352z" />
        </svg>
      </a>
    </div>
  );
}
