import React from "react";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { InquiriesClient } from "./InquiriesClient";

export const metadata = {
  title: "Inquiries — ABCD Agency",
};

const PAGE_SIZE = 10;

const TABS = [
  { label: "All", filter: undefined },
  { label: "Unread", filter: "New" },
  { label: "In Progress", filter: "In Progress" },
  { label: "Replied", filter: "Replied" },
  { label: "Closed", filter: "Closed" },
];

const PROJECT_LABELS: Record<string, string> = {
  "web-dev": "Web & Software Dev",
  "ui-ux": "UI/UX Design",
  marketing: "Performance Marketing",
  automation: "Business Automation",
  other: "Custom Project",
};

interface PageProps {
  searchParams: Promise<{ tab?: string; page?: string }>;
}

export default async function InquiriesPage({ searchParams }: PageProps) {
  const { tab, page } = await searchParams;
  const currentTab = tab || "All";
  const currentPage = Math.max(1, parseInt(page || "1", 10));

  const statusFilter =
    TABS.find((t) => t.label === currentTab)?.filter;

  const where = statusFilter ? { status: statusFilter } : {};

  const [totalCount, newCount, inProgressCount, repliedCount, closedCount, inquiries] =
    await Promise.all([
      db.inquiry.count({ where }),
      db.inquiry.count({ where: { status: "New" } }),
      db.inquiry.count({ where: { status: "In Progress" } }),
      db.inquiry.count({ where: { status: "Replied" } }),
      db.inquiry.count({ where: { status: "Closed" } }),
      db.inquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const buildHref = (params: { tab?: string; page?: number }) => {
    const p = new URLSearchParams();
    if (params.tab && params.tab !== "All") p.set("tab", params.tab);
    if (params.page && params.page > 1) p.set("page", String(params.page));
    const q = p.toString();
    return `/admin/inquiries${q ? `?${q}` : ""}`;
  };

  const tabCounts: Record<string, number> = {
    All: newCount + inProgressCount + repliedCount + closedCount,
    Unread: newCount,
    "In Progress": inProgressCount,
    Replied: repliedCount,
    Closed: closedCount,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Inquiries
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Manage incoming project inquiries and consultation requests.
          </p>
        </div>
        {newCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {newCount} unread
            </span>
          </div>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: newCount + inProgressCount + repliedCount + closedCount, color: "text-[#0A0A0A] dark:text-white" },
          { label: "Unread", value: newCount, color: "text-[#0A0A0A] dark:text-white" },
          { label: "In Progress", value: inProgressCount, color: "text-amber-700 dark:text-amber-400" },
          { label: "Replied", value: repliedCount, color: "text-emerald-700 dark:text-emerald-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500">
              {s.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F5F5F5] dark:bg-[#111111] rounded-xl border border-[#E5E5E5] dark:border-[#262626] overflow-x-auto">
        {TABS.map((t) => {
          const isActive = currentTab === t.label;
          return (
            <Link
              key={t.label}
              href={buildHref({ tab: t.label, page: 1 })}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                isActive
                  ? "bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white shadow-sm border border-[#E5E5E5] dark:border-[#333333]"
                  : "text-[#737373] dark:text-neutral-500 hover:text-[#0A0A0A] dark:hover:text-white"
              }`}
            >
              {t.label}
              {tabCounts[t.label] > 0 && (
                <span className={`px-1.5 py-px text-[10px] font-bold rounded-full ${
                  isActive
                    ? t.label === "Unread"
                      ? "bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A]"
                      : "bg-[#F0F0F0] dark:bg-[#1A1A1A] text-[#737373] dark:text-neutral-400"
                    : "bg-[#E5E5E5] dark:bg-[#1A1A1A] text-[#737373] dark:text-neutral-500"
                }`}>
                  {tabCounts[t.label]}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── List ── */}
      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] py-16 text-center">
          <svg className="w-10 h-10 mx-auto mb-4 text-[#E5E5E5] dark:text-[#333333]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
          <p className="text-sm font-semibold text-[#737373] dark:text-neutral-400">No inquiries found</p>
          <p className="text-xs text-[#A3A3A3] dark:text-neutral-500 mt-1">
            {currentTab === "All" ? "Inquiries submitted from the contact form will appear here." : `No ${currentTab.toLowerCase()} inquiries.`}
          </p>
        </div>
      ) : (
        <InquiriesClient inquiries={inquiries} />
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
          <p className="text-xs text-[#A3A3A3] dark:text-neutral-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1">
            {currentPage > 1 ? (
              <Link
                href={buildHref({ tab: currentTab, page: currentPage - 1 })}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-neutral-400 hover:border-[#0A0A0A] dark:hover:border-white hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </Link>
            ) : (
              <span className="flex items-center justify-center w-8 h-8 rounded-md border border-[#E5E5E5] dark:border-[#262626] text-[#E5E5E5] dark:text-[#333333]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </span>
            )}

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "ellipsis" ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#A3A3A3] dark:text-neutral-500">…</span>
                ) : (
                  <Link
                    key={p}
                    href={buildHref({ tab: currentTab, page: p as number })}
                    className={`flex items-center justify-center w-8 h-8 rounded-md text-xs font-semibold border transition-colors ${
                      currentPage === p
                        ? "bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white"
                        : "border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-neutral-400 hover:border-[#0A0A0A] dark:hover:border-white hover:text-[#0A0A0A] dark:hover:text-white"
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}

            {currentPage < totalPages ? (
              <Link
                href={buildHref({ tab: currentTab, page: currentPage + 1 })}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-neutral-400 hover:border-[#0A0A0A] dark:hover:border-white hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ) : (
              <span className="flex items-center justify-center w-8 h-8 rounded-md border border-[#E5E5E5] dark:border-[#262626] text-[#E5E5E5] dark:text-[#333333]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
