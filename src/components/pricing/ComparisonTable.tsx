import React from "react";

interface FeatureRow {
  name: string;
  category: string;
  sprint: string | boolean;
  retainer: string | boolean;
  enterprise: string | boolean;
}

const features: FeatureRow[] = [
  {
    name: "Dedicated Engineering Lead",
    category: "Team & Capacity",
    sprint: true,
    retainer: true,
    enterprise: true,
  },
  {
    name: "Full-Stack Engineers Assigned",
    category: "Team & Capacity",
    sprint: "1 Senior Engineer",
    retainer: "2 Senior Engineers",
    enterprise: "Custom Squad (3-6)",
  },
  {
    name: "Sprint Cadence & Delivery",
    category: "Delivery",
    sprint: "Fixed Milestone",
    retainer: "Bi-Weekly Continuous",
    enterprise: "Custom Milestone SLAs",
  },
  {
    name: "Figma UI/UX Design System",
    category: "Design",
    sprint: true,
    retainer: true,
    enterprise: true,
  },
  {
    name: "Direct Slack / Discord Access",
    category: "Communication",
    sprint: "Email / Async",
    retainer: "Real-time Slack",
    enterprise: "Dedicated Shared Channel",
  },
  {
    name: "100% Code & IP Ownership",
    category: "Legal & IP",
    sprint: true,
    retainer: true,
    enterprise: true,
  },
  {
    name: "Post-Launch Warranty & Support",
    category: "Support",
    sprint: "30 Days",
    retainer: "Continuous during Retainer",
    enterprise: "24/7 SLA & Dedicated On-call",
  },
];

export function ComparisonTable() {
  const renderValue = (val: string | boolean) => {
    if (typeof val === "boolean") {
      return val ? (
        <span className="w-5 h-5 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] inline-flex items-center justify-center text-xs">
          ✓
        </span>
      ) : (
        <span className="text-[#737373] text-sm">—</span>
      );
    }
    return <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white">{val}</span>;
  };

  return (
    <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden shadow-xs transition-colors duration-200">
      <div className="p-6 sm:p-8 border-b border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#161616]">
        <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">
          Comprehensive Feature &amp; Capability Matrix
        </h3>
        <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">
          Detailed comparison across our three engagement models.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#161616] text-xs font-mono uppercase tracking-wider text-[#737373] dark:text-neutral-400">
              <th className="py-4 px-6 font-semibold">Capability</th>
              <th className="py-4 px-6 font-semibold">Fixed Sprint</th>
              <th className="py-4 px-6 font-semibold text-[#0A0A0A] dark:text-white">Growth Retainer</th>
              <th className="py-4 px-6 font-semibold">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] text-xs">
            {features.map((feat) => (
              <tr key={feat.name} className="hover:bg-[#FAFAFA] dark:hover:bg-[#1a1a1a] transition-colors">
                <td className="py-4 px-6 font-medium text-[#0A0A0A] dark:text-white">
                  {feat.name}
                </td>
                <td className="py-4 px-6">{renderValue(feat.sprint)}</td>
                <td className="py-4 px-6 bg-[#FAFAFA]/60 dark:bg-[#161616]/60">{renderValue(feat.retainer)}</td>
                <td className="py-4 px-6">{renderValue(feat.enterprise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
