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
