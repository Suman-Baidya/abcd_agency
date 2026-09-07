"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface ScrollProgressBarProps {
  /**
   * Optional CSS selector for the scrollable container.
   * If omitted, automatically detects a scrollable <main> element,
   * falling back to window scrolling.
   */
  containerSelector?: string;
  /**
   * Position mode: 'fixed' (viewport top), 'absolute' (relative parent top), or 'sticky'.
   * Defaults to 'fixed'.
   */
  position?: "fixed" | "absolute" | "sticky";
  className?: string;
}

export function ScrollProgressBar({
  containerSelector,
  position = "fixed",
  className = "",
}: ScrollProgressBarProps) {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    let currentElement: HTMLElement | null = null;

    const getScrollTarget = (): HTMLElement | null => {
      if (containerSelector) {
        return document.querySelector<HTMLElement>(containerSelector);
      }
      const mains = Array.from(document.querySelectorAll<HTMLElement>("main"));
      const scrollable = mains.find((m) => m.scrollHeight > m.clientHeight);
      return scrollable || mains[0] || null;
    };

    const calculateProgress = () => {
      const el = getScrollTarget();
      if (el !== currentElement) {
        if (currentElement) {
          currentElement.removeEventListener("scroll", handleScroll);
        }
        currentElement = el;
        if (currentElement) {
          currentElement.addEventListener("scroll", handleScroll, { passive: true });
        }
      }

      if (currentElement && currentElement.scrollHeight > currentElement.clientHeight) {
        const scrollableHeight = currentElement.scrollHeight - currentElement.clientHeight;
        if (scrollableHeight > 0) {
          const scrolled = currentElement.scrollTop;
          const percentage = (scrolled / scrollableHeight) * 100;
          setProgress(Math.min(100, Math.max(0, percentage)));
        } else {
          setProgress(0);
        }
      } else {
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollableHeight = docHeight - winHeight;
        if (scrollableHeight > 0) {
          const scrolled = window.scrollY;
          const percentage = (scrolled / scrollableHeight) * 100;
          setProgress(Math.min(100, Math.max(0, percentage)));
        } else {
          setProgress(0);
        }
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(calculateProgress);
        ticking = true;
      }
    };

    // Initial setup
    currentElement = getScrollTarget();
    if (currentElement) {
      currentElement.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", calculateProgress, { passive: true });

    // Multi-stage check to handle client hydration and dynamic content rendering
    calculateProgress();
    const timer1 = setTimeout(calculateProgress, 100);
    const timer2 = setTimeout(calculateProgress, 400);

    // ResizeObserver on the target element or body to catch dynamic list / card expansions
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      const target = currentElement || document.body;
      observer = new ResizeObserver(() => {
        calculateProgress();
      });
      observer.observe(target);
    }

    return () => {
      if (currentElement) {
        currentElement.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateProgress);
      clearTimeout(timer1);
      clearTimeout(timer2);
      observer?.disconnect();
    };
  }, [pathname, containerSelector]);

  const positionClass =
    position === "absolute"
      ? "absolute top-0 left-0 right-0"
      : position === "sticky"
      ? "sticky top-0 left-0 right-0"
      : "fixed top-0 left-0 right-0";

  return (
    <div
      className={`${positionClass} z-50 h-[3px] pointer-events-none bg-black/[0.04] dark:bg-white/[0.05] ${className}`}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-[#0A0A0A] dark:bg-white transition-[width] duration-150 ease-out will-change-[width] shadow-[0_1px_3px_rgba(10,10,10,0.2)] dark:shadow-[0_1px_4px_rgba(255,255,255,0.4)]"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
