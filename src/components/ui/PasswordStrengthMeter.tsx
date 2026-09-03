"use client";

import React, { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password?: string;
  className?: string;
}

export function PasswordStrengthMeter({ password = "", className = "" }: PasswordStrengthMeterProps) {
  const criteria = useMemo(() => {
    return [
      { id: "length", label: "8+ characters", met: password.length >= 8 },
      { id: "number", label: "Contains a number", met: /[0-9]/.test(password) },
      { id: "mixed", label: "Upper & lowercase letters", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
      { id: "special", label: "Special symbol", met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [password]);

  const score = useMemo(() => {
    if (!password) return 0;
    return criteria.filter((c) => c.met).length;
  }, [password, criteria]);

  const strengthLabel = useMemo(() => {
    if (!password) return "";
    if (score <= 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    return "Strong";
  }, [password, score]);

  if (!password) return null;

  return (
    <div className={`space-y-2.5 pt-1 ${className}`}>
      {/* 4 Segmented Progress Bars (Black & White Premium) */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-1">
          {[1, 2, 3, 4].map((step) => {
            const isFilled = score >= step;
            return (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  isFilled
                    ? score >= 3
                      ? "bg-[#0A0A0A] dark:bg-white"
                      : "bg-[#737373] dark:bg-[#737373]"
                    : "bg-[#E5E5E5] dark:bg-[#262626]"
                }`}
              />
            );
          })}
        </div>
        <span className="text-[11px] font-mono font-medium text-[#737373] dark:text-neutral-400 min-w-[42px] text-right">
          {strengthLabel}
        </span>
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
        {criteria.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-1.5 transition-colors ${
              c.met
                ? "text-[#0A0A0A] dark:text-white font-medium"
                : "text-[#A3A3A3] dark:text-[#525252]"
            }`}
          >
            {c.met ? (
              <Check className="w-3 h-3 text-[#0A0A0A] dark:text-white flex-shrink-0" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-[#D4D4D4] dark:border-[#404040] flex-shrink-0" />
            )}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
