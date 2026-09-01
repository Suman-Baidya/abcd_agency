/**
 * Formats project deadline JSON or plain string into human-readable date strings
 * Handles: {"startDate":"2026-09-01","endDate":"2026-10-31"} or plain string "4 Weeks"
 */
export function formatProjectDeadline(deadline: string | null | undefined): {
  dateRange: string;
  durationText?: string;
  fullDisplay: string;
} {
  if (!deadline || !deadline.trim()) {
    return {
      dateRange: "Flexible Timeline",
      fullDisplay: "Flexible Timeline",
    };
  }

  const trimmed = deadline.trim();

  // Check if string contains JSON
  if (trimmed.startsWith("{") || trimmed.includes("startDate") || trimmed.includes("endDate")) {
    try {
      const parsed = JSON.parse(trimmed);
      const { startDate, endDate } = parsed;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const formatOpts: Intl.DateTimeFormatOptions = {
            month: "short",
            day: "2-digit",
          };
          const startStr = start.toLocaleDateString("en-US", formatOpts);
          const endStr = end.toLocaleDateString("en-US", formatOpts);
          const startYear = start.getFullYear();
          const endYear = end.getFullYear();

          const diffMs = end.getTime() - start.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const diffWeeks = Math.max(1, Math.ceil(diffDays / 7));
          const durationText = `${diffWeeks} Week${diffWeeks !== 1 ? "s" : ""}`;

          let dateRange = "";
          if (startYear === endYear) {
            dateRange = `${startStr} - ${endStr}, ${endYear}`;
          } else {
            dateRange = `${startStr}, ${startYear} - ${endStr}, ${endYear}`;
          }

          return {
            dateRange,
            durationText,
            fullDisplay: `${dateRange} (${durationText})`,
          };
        }
      } else if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          const dateRange = `Target: ${end.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`;
          return {
            dateRange,
            fullDisplay: dateRange,
          };
        }
      } else if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          const dateRange = `Starts: ${start.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`;
          return {
            dateRange,
            fullDisplay: dateRange,
          };
        }
      }
    } catch {
      // Not valid JSON, fallback to raw string
    }
  }

  return {
    dateRange: trimmed,
    fullDisplay: trimmed,
  };
}

export interface TaskUrgency {
  formattedDate: string;
  diffDays: number | null;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  isUpcoming: boolean;
  urgencyLabel: string;
  badgeClass: string;
  score: number;
}

/**
 * Evaluates a task's priority and due date timeline to calculate smart priority ranking
 */
export function evaluateTaskUrgency(
  dueDateStr: string | null | undefined,
  priority: string = "Medium"
): TaskUrgency {
  const priorityWeights: Record<string, number> = {
    Urgent: 500,
    Critical: 400,
    High: 300,
    Medium: 200,
    Low: 100,
  };

  const pWeight = priorityWeights[priority] || 200;

  if (!dueDateStr || !dueDateStr.trim()) {
    return {
      formattedDate: "Flexible",
      diffDays: null,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
      urgencyLabel: "",
      badgeClass: "text-[#737373]",
      score: pWeight,
    };
  }

  const trimmed = dueDateStr.trim();
  const dateObj = new Date(trimmed);

  if (isNaN(dateObj.getTime())) {
    return {
      formattedDate: trimmed,
      diffDays: null,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
      urgencyLabel: "",
      badgeClass: "text-[#737373]",
      score: pWeight,
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedDate = `${monthNames[target.getMonth()]} ${String(target.getDate()).padStart(2, "0")}, ${target.getFullYear()}`;
  const shortDate = `${monthNames[target.getMonth()]} ${String(target.getDate()).padStart(2, "0")}`;

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      formattedDate: shortDate,
      diffDays,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
      urgencyLabel: overdueDays === 1 ? "1d Overdue" : `${overdueDays}d Overdue`,
      badgeClass: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 font-bold",
      score: 1000 + overdueDays * 10 + pWeight,
    };
  }

  if (diffDays === 0) {
    return {
      formattedDate: "Today",
      diffDays: 0,
      isOverdue: false,
      isToday: true,
      isTomorrow: false,
      isUpcoming: false,
      urgencyLabel: "Due Today",
      badgeClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 font-bold",
      score: 800 + pWeight,
    };
  }

  if (diffDays === 1) {
    return {
      formattedDate: "Tomorrow",
      diffDays: 1,
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
      isUpcoming: true,
      urgencyLabel: "Due Tomorrow",
      badgeClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 font-semibold",
      score: 400 + pWeight,
    };
  }

  if (diffDays <= 3) {
    return {
      formattedDate: shortDate,
      diffDays,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      isUpcoming: true,
      urgencyLabel: `In ${diffDays} days`,
      badgeClass: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 font-medium",
      score: 200 + pWeight,
    };
  }

  return {
    formattedDate: shortDate,
    diffDays,
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
    isUpcoming: false,
    urgencyLabel: shortDate,
    badgeClass: "text-[#737373]",
    score: Math.max(0, 100 - diffDays) + pWeight,
  };
}
