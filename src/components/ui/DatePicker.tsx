"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select target deadline...",
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value or default to current month
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  // Keep viewDate in sync when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewDate(d);
      }
    }
  }, [value]);

  // Click outside listener & smart upward/downward detection
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // If space below is less than 330px, pop up above to prevent hiding
        setOpenUpward(spaceBelow < 330);
      }
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Current today reference for past date restriction
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Check if previous month navigation should be disabled
  const isCurrentMonthOrPast = 
    year < today.getFullYear() || 
    (year === today.getFullYear() && month <= today.getMonth());

  // Days calculation for calendar grid
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentMonthOrPast) return;
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  // Check if a day in current view month is in the past
  const isPastDate = (day: number) => {
    const candidate = new Date(year, month, day);
    return candidate < startOfToday;
  };

  const handleSelectDay = (day: number) => {
    if (isPastDate(day)) return; // Strictly disallow selecting past dates
    const yyyy = year;
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handlePreset = (offsetDays: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Format display text
  const formattedDisplay = React.useMemo(() => {
    if (!value) return "";
    const d = new Date(value + "T00:00:00");
    if (isNaN(d.getTime())) return value;

    const opts: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    };
    return d.toLocaleDateString("en-US", opts);
  }, [value]);

  const isTodayDate = (d: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === d
    );
  };

  const isSelectedDate = (d: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === d
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#141414] hover:bg-[#F9F9F9] dark:hover:bg-[#1A1A1A] text-left text-xs transition-all shadow-xs outline-none focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer group"
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          <Calendar className="w-3.5 h-3.5 text-[#737373] group-hover:text-black dark:group-hover:text-white shrink-0" />
          <span className={formattedDisplay ? "font-semibold text-[#0A0A0A] dark:text-white truncate" : "text-[#737373] truncate"}>
            {formattedDisplay || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              onClick={handleClear}
              className="p-1 rounded-md text-[#737373] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Clear date"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </div>
      </button>

      {/* Popover Calendar (Smart Upward / Downward positioning) */}
      {isOpen && (
        <div 
          className={`absolute left-0 right-0 sm:right-auto sm:w-72 z-50 p-3 bg-white dark:bg-[#111111] rounded-2xl border border-[#E5E5E5] dark:border-[#262626] shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-3 ${
            openUpward 
              ? "bottom-full mb-2 origin-bottom-left" 
              : "top-full mt-2 origin-top-left"
          }`}
        >
          {/* Quick Presets */}
          <div className="flex items-center justify-between gap-1 pb-2 border-b border-[#EAEAEA] dark:border-[#222222]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">Presets</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => handlePreset(0, e)}
                className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#F5F5F5] dark:bg-[#202020] text-[#0A0A0A] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={(e) => handlePreset(1, e)}
                className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#F5F5F5] dark:bg-[#202020] text-[#0A0A0A] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={(e) => handlePreset(7, e)}
                className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#F5F5F5] dark:bg-[#202020] text-[#0A0A0A] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
              >
                +1 Week
              </button>
            </div>
          </div>

          {/* Month Header Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isCurrentMonthOrPast}
              className={`p-1 rounded-lg transition-colors ${
                isCurrentMonthOrPast
                  ? "opacity-30 cursor-not-allowed text-[#737373]"
                  : "hover:bg-[#F0F0F0] dark:hover:bg-[#202020] text-[#737373] hover:text-black dark:hover:text-white cursor-pointer"
              }`}
              title={isCurrentMonthOrPast ? "Past months disabled" : "Previous Month"}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-[#0A0A0A] dark:text-white tracking-tight">
              {monthNames[month]} {year}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#202020] text-[#737373] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#737373]">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Previous Month trailing days (disabled) */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div
                key={`prev-${i}`}
                className="h-7 flex items-center justify-center text-[10px] text-[#A3A3A3]/30 dark:text-neutral-700 select-none"
              >
                {daysInPrevMonth - firstDayIndex + i + 1}
              </div>
            ))}

            {/* Current Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = isSelectedDate(dayNum);
              const isToday = isTodayDate(dayNum);
              const isPast = isPastDate(dayNum);

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7 w-full rounded-lg text-[11px] font-semibold flex items-center justify-center transition-all ${
                    isPast
                      ? "opacity-25 cursor-not-allowed text-[#737373] line-through pointer-events-none"
                      : isSelected
                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] font-bold shadow-xs cursor-pointer"
                      : isToday
                      ? "border border-amber-500 text-amber-600 dark:text-amber-400 font-bold hover:bg-[#F5F5F5] dark:hover:bg-[#202020] cursor-pointer"
                      : "text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#202020] cursor-pointer"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
