"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startProgress = () => {
    clearAllTimers();
    setVisible(true);
    setLoading(true);
    setProgress(25);

    // Progressive trickle animation while waiting for server response
    const t1 = setTimeout(() => setProgress((prev) => (prev < 60 ? 60 : prev)), 120);
    const t2 = setTimeout(() => setProgress((prev) => (prev < 80 ? 80 : prev)), 350);
    const t3 = setTimeout(() => setProgress((prev) => (prev < 90 ? 90 : prev)), 800);
    
    // Failsafe: auto-complete if navigation is stuck or cancelled after 2.5s
    const tFail = setTimeout(() => {
      completeProgress();
    }, 2500);

    timersRef.current.push(t1, t2, t3, tFail);
  };

  const completeProgress = () => {
    clearAllTimers();
    setProgress(100);

    // Fade out after reaching 100%
    const tFinish = setTimeout(() => {
      setVisible(false);
      setLoading(false);
      const tReset = setTimeout(() => {
        setProgress(0);
      }, 300);
      timersRef.current.push(tReset);
    }, 200);

    timersRef.current.push(tFinish);
  };

  // When pathname or searchParams change, navigation has completed
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (loading || visible) {
      completeProgress();
    }
  }, [pathname, searchParams]);

  // Listen for navigation clicks across the document
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't intercept if modifier keys were pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;

      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, hash links, mailto, tel, target blank, or download
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download")
      ) {
        return;
      }

      // Check if navigating to a different URL
      try {
        const targetUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Normalize trailing slashes for comparison
        const targetPath = targetUrl.pathname.replace(/\/+$/, "") || "/";
        const currentPath = currentUrl.pathname.replace(/\/+$/, "") || "/";

        if (targetPath !== currentPath || targetUrl.search !== currentUrl.search) {
          startProgress();
        }
      } catch {
        // invalid URL, ignore
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      clearAllTimers();
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[99999] h-[2.5px] pointer-events-none transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="progressbar"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#0A0A0A] dark:bg-white shadow-[0_0_10px_rgba(10,10,10,0.6)] dark:shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
