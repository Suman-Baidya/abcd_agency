"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PopoverMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  widthClass?: string;
}

function getCoords(anchorEl: HTMLElement, align: "left" | "right", menuEl?: HTMLElement | null) {
  if (typeof window === "undefined") return null;

  const rect = anchorEl.getBoundingClientRect();
  
  // If anchor is scrolled off-screen
  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    return null;
  }

  const menuWidth = menuEl?.offsetWidth || 192;
  const menuHeight = menuEl?.offsetHeight || 135;
  const padding = 12;

  // Normal dropdown: appears right below the button
  // Only flips up if there isn't enough screen space below
  const spaceBelow = window.innerHeight - rect.bottom;
  const placeUpward = spaceBelow < menuHeight + padding && rect.top > menuHeight + padding;

  const top = placeUpward
    ? Math.max(padding, rect.top - menuHeight - 6)
    : Math.min(window.innerHeight - menuHeight - padding, rect.bottom + 6);

  let left = align === "right" ? rect.right - menuWidth : rect.left;
  left = Math.max(padding, Math.min(left, window.innerWidth - menuWidth - padding));

  return {
    top,
    left,
    placement: placeUpward ? ("top" as const) : ("bottom" as const),
  };
}

export function PopoverMenu({
  isOpen,
  onClose,
  anchorEl,
  children,
  align = "right",
  className = "",
  widthClass = "w-48",
}: PopoverMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: "top" | "bottom" } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = React.useCallback(() => {
    if (!anchorEl || !isOpen) return;

    const newCoords = getCoords(anchorEl, align, menuRef.current);
    if (!newCoords) {
      onClose();
    } else {
      setCoords(newCoords);
    }
  }, [anchorEl, isOpen, align, onClose]);

  // Synchronously compute position BEFORE paint on open
  useLayoutEffect(() => {
    if (isOpen && anchorEl) {
      const initialCoords = getCoords(anchorEl, align, menuRef.current);
      if (initialCoords) {
        setCoords(initialCoords);
      }
    } else {
      setCoords(null);
    }
  }, [isOpen, anchorEl, align]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      updatePosition();
    };

    const handleResize = () => {
      updatePosition();
    };

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        anchorEl &&
        !anchorEl.contains(target)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("touchstart", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("touchstart", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, anchorEl, onClose, updatePosition]);

  if (!mounted || !isOpen || !anchorEl) return null;

  // Immediate fallback coordinates if state is not set yet
  const currentCoords = coords || getCoords(anchorEl, align, menuRef.current);
  if (!currentCoords) return null;

  const isUpward = currentCoords.placement === "top";

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: `${currentCoords.top}px`,
        left: `${currentCoords.left}px`,
        zIndex: 9999,
      }}
      className={`${widthClass} rounded-xl bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] shadow-xl p-1.5 transition-all duration-100 ${
        isUpward ? "origin-bottom-right" : "origin-top-right"
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
}
