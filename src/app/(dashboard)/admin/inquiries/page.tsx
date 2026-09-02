import React, { Suspense } from "react";
import { db } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { InquiriesClient } from "./InquiriesClient";
import { InquiryFilters } from "./InquiryFilters";
import { ProjectPagination } from "@/components/dashboard/ProjectPagination";

export const metadata = {
  title: "Client Inquiries — ABCD Agency",
};

const TAB_CONFIG = [
  { label: "All", filter: undefined },
  { label: "Unread", filter: "New" },
  { label: "Replied", filter: "Replied" },
  { label: "Trash", filter: "Closed" },
] as const;

interface PageProps {
  searchParams: Promise<{ tab?: string; page?: string; limit?: string; q?: string; sort?: string }>;
}

export default async function InquiriesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const tab = resolvedParams.tab;
  const page = resolvedParams.page;
  const limitParam = resolvedParams.limit;
  const q = resolvedParams.q;
  const sort = resolvedParams.sort || "newest";

  // Default tab is "Unread" as requested
  const currentTab = tab || "Unread";
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const limit = Math.max(1, parseInt(limitParam || "10", 10));

  // Automatic purge: delete inquiries that have been in Trash ("Closed") for > 15 days
  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  try {
    await db.inquiry.deleteMany({
      where: {
        status: "Closed",
        updatedAt: { lte: fifteenDaysAgo },
      },
    });
  } catch (err) {
    console.error("Failed to auto-purge 15-day old trashed inquiries:", err);
  }

  const statusFilter =
    currentTab === "Trash"
      ? "Closed"
      : currentTab === "Unread"
      ? "New"
      : currentTab === "Replied"
      ? "Replied"
      : { not: "Closed" };

  const searchWhere = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { mobile: { contains: q, mode: "insensitive" as const } },
          { message: { contains: q, mode: "insensitive" as const } },
          { businessType: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const where = {
    ...searchWhere,
    status: statusFilter,
  };

  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "a-z") orderBy = { name: "asc" };
  else if (sort === "z-a") orderBy = { name: "desc" };

  const [
    totalCount,
    allCount,
    newCount,
    inProgressCount,
    repliedCount,
    closedCount,
    inquiries,
  ] = await Promise.all([
    db.inquiry.count({ where }),
    db.inquiry.count({ where: { ...searchWhere, status: { not: "Closed" } } }),
    db.inquiry.count({ where: { ...searchWhere, status: "New" } }),
    db.inquiry.count({ where: { ...searchWhere, status: "In Progress" } }),
    db.inquiry.count({ where: { ...searchWhere, status: "Replied" } }),
    db.inquiry.count({ where: { ...searchWhere, status: "Closed" } }),
    db.inquiry.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * limit,
      take: limit,
    }),
  ]);

  // Fetch registered users to identify verified users
  const inquiryEmails: string[] = Array.from(
    new Set((inquiries as Array<{ email: string }>).map((i) => i.email.toLowerCase()))
  );
  const matchingUsers = inquiryEmails.length > 0
    ? await db.user.findMany({
        where: { email: { in: inquiryEmails } },
        select: {
          email: true,
          isVerified: true,
          role: true,
          name: true,
          companyName: true,
          clientId: true,
        },
      })
    : [];

  const userMap = new Map(matchingUsers.map((u) => [u.email.toLowerCase(), u]));

  const inquiriesWithUser = (inquiries as any[]).map((inq: any) => ({
    ...inq,
    registeredUser: userMap.get(inq.email.toLowerCase()) || null,
  }));

  const tabCounts: Record<string, number> = {
    All: allCount,
    Unread: newCount,
    Replied: repliedCount,
    Trash: closedCount,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Client Inquiries
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

      {/* Stats Cards */}
      <div id="admin-inquiries-kpi" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Inquiries" value={allCount} />
        <StatCard label="Unread" value={newCount} color="red" />
        <StatCard label="In Progress" value={inProgressCount} color="amber" />
        <StatCard label="Replied" value={repliedCount} color="emerald" />
      </div>

      {/* Main Table / List Container */}
      <Card id="admin-inquiries-card" className="overflow-hidden !p-0 border border-[#E5E5E5] dark:border-[#262626] shadow-sm">
        {/* Table Top Toolbar */}
        <div id="admin-inquiries-filters" className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A]">
          <Suspense fallback={<div className="h-10 w-full bg-[#F5F5F5] dark:bg-[#111111] animate-pulse rounded-md" />}>
            <InquiryFilters tabCounts={tabCounts} />
          </Suspense>
        </div>

        {/* Existing Inquiries List */}
        {inquiries.length === 0 ? (
          <div className="py-16 text-center bg-[#FBFBFB] dark:bg-[#111111]">
            <svg
              className="w-10 h-10 mx-auto mb-4 text-[#E5E5E5] dark:text-[#333333]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
              />
            </svg>
            <p className="text-sm font-semibold text-[#737373] dark:text-neutral-400">
              No inquiries found
            </p>
            <p className="text-xs text-[#A3A3A3] dark:text-neutral-500 mt-1">
              {q
                ? "Try searching with a different term."
                : currentTab === "All"
                ? "Inquiries submitted from the contact form will appear here."
                : `No ${currentTab.toLowerCase()} inquiries.`}
            </p>
          </div>
        ) : (
          <InquiriesClient
            inquiries={inquiriesWithUser as any}
            startIndex={(currentPage - 1) * limit + 1}
            currentTab={currentTab}
          />
        )}

        {/* Pagination & Rows per page Controls */}
        <Suspense fallback={<div className="h-16 border-t border-[#E5E5E5] dark:border-[#262626]" />}>
          <ProjectPagination
            totalItems={totalCount}
            defaultLimit={10}
            itemLabel="inquiries"
          />
        </Suspense>
      </Card>
    </div>
  );
}
