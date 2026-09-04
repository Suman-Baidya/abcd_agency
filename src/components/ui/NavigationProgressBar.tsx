"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress on pathname or searchParams change
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Listen for navigation clicks across the document
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, hash links, mailto, tel, target blank, download, or modifier keys
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if navigating to a different pathname
      const currentUrl = window.location.pathname + window.location.search;
      if (href !== currentUrl) {
        setLoading(true);
        setProgress(30);

        // Animate progress smoothly towards 80% while waiting for page
        const t1 = setTimeout(() => setProgress(60), 100);
        const t2 = setTimeout(() => setProgress(85), 350);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[2px] pointer-events-none bg-transparent"
      role="progressbar"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#0A0A0A] dark:bg-white shadow-[0_0_8px_rgba(10,10,10,0.5)] dark:shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: loading || progress < 100 ? 1 : 0,
        }}
      />
    </div>
  );
}
