import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { getFinanceTransactions } from "./finance/actions";
import { getClientsWithProjectCounts } from "./clients/actions";
import { getCurrentUser } from "@/lib/auth-session";
import { db } from "@/lib/prisma";

export const metadata = {
  title: "Admin Dashboard — ABCD Agency",
};

export const dynamic = "force-dynamic";

const MS_PER_DAY = 86_400_000;
const WEEK_REGEX = /(\d+)\s*week/i;
const DAY_REGEX = /(\d+)\s*day/i;
const MONTH_REGEX = /(\d+)\s*month/i;

function formatRelativeTime(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 60) return "Just now";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatProjectTimePeriod(
  deadlineStr?: string | null,
  createdAt?: Date | string
): { dateRange: string; daysText: string } {
  const now = new Date();

  if (!deadlineStr || deadlineStr.trim() === "") {
    return { dateRange: "Flexible Timeline", daysText: "Ongoing" };
  }

  const trimmed = deadlineStr.trim();

  // 1. Try parsing JSON
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const startVal = parsed.startDate?.trim();
      const endVal = parsed.endDate?.trim();

      if (startVal && endVal) {
        const start = new Date(startVal);
        const end = new Date(endVal);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const totalMs = end.getTime() - start.getTime();
          const totalDays = Math.max(1, Math.ceil(totalMs / MS_PER_DAY));

          const remainingMs = end.getTime() - now.getTime();
          const remainingDays = Math.ceil(remainingMs / MS_PER_DAY);

          const formatOptions: Intl.DateTimeFormatOptions = { month: "short", day: "2-digit" };
          const startStr = start.toLocaleDateString("en-US", formatOptions);
          const endStr = end.toLocaleDateString("en-US", formatOptions);
          const yearStr = end.getFullYear().toString().slice(-2);
          const dateRange = `${startStr} - ${endStr}, '${yearStr}'`;

          let daysText = "";
          if (remainingDays > 0) {
            daysText = `Left ${remainingDays} days (Total ${totalDays} days)`;
          } else if (remainingDays === 0) {
            daysText = `Due today (Total ${totalDays} days)`;
          } else {
            daysText = `Overdue by ${Math.abs(remainingDays)} days (Total ${totalDays} days)`;
          }

          return { dateRange, daysText };
        }
      } else if (endVal) {
        const end = new Date(endVal);
        if (!isNaN(end.getTime())) {
          const formatOptions: Intl.DateTimeFormatOptions = { month: "short", day: "2-digit", year: "numeric" };
          const remainingMs = end.getTime() - now.getTime();
          const remainingDays = Math.ceil(remainingMs / MS_PER_DAY);

          const dateRange = `Target: ${end.toLocaleDateString("en-US", formatOptions)}`;
          const daysText = remainingDays >= 0 
            ? `Left ${remainingDays} days`
            : `Overdue by ${Math.abs(remainingDays)} days`;

          return { dateRange, daysText };
        }
      }

      // If JSON was {"startDate":"","endDate":""} or empty properties
      return { dateRange: "Flexible Timeline", daysText: "Ongoing" };
    } catch {
      return { dateRange: "Flexible Timeline", daysText: "Ongoing" };
    }
  }

  // 2. Handle plain text like "4 Weeks (MVP to Production)", "6 Weeks", "45 Days", etc.
  const weekMatch = trimmed.match(WEEK_REGEX);
  const dayMatch = trimmed.match(DAY_REGEX);
  const monthMatch = trimmed.match(MONTH_REGEX);

  let totalDays = 0;
  if (dayMatch) {
    totalDays = parseInt(dayMatch[1], 10);
  } else if (weekMatch) {
    totalDays = parseInt(weekMatch[1], 10) * 7;
  } else if (monthMatch) {
    totalDays = parseInt(monthMatch[1], 10) * 30;
  }

  if (totalDays > 0) {
    if (createdAt) {
      const created = new Date(createdAt);
      if (!isNaN(created.getTime())) {
        const end = new Date(created.getTime() + totalDays * MS_PER_DAY);
        const remainingMs = end.getTime() - now.getTime();
        const remainingDays = Math.ceil(remainingMs / MS_PER_DAY);

        let daysText = "";
        if (remainingDays > 0) {
          daysText = `Left ${remainingDays} days (Total ${totalDays} days)`;
        } else if (remainingDays === 0) {
          daysText = `Due today (Total ${totalDays} days)`;
        } else {
          daysText = `Overdue by ${Math.abs(remainingDays)} days (Total ${totalDays} days)`;
        }

        return {
          dateRange: trimmed,
          daysText,
        };
      }
    }

    return {
      dateRange: trimmed,
      daysText: `Total ${totalDays} days`,
    };
  }

  return {
    dateRange: trimmed,
    daysText: "Active Sprint",
  };
}

interface ActivityItem {
  id: string;
  type: "finance" | "inquiry" | "project" | "user";
  title: string;
  description: string;
  timestamp: Date;
  href: string;
}

export default async function AdminDashboardPage() {
  // Optimized parallel queries: minimal selected fields, no redundant round trips
  const [
    user,
    transactions, 
    clients, 
    allProjects, 
    inquiries, 
    totalInquiriesCount, 
    unreadInquiriesCount,
    recentUsers,
    newUsersCount,
  ] = await Promise.all([
    getCurrentUser(),
    getFinanceTransactions(),
    getClientsWithProjectCounts(),
    db.project.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        client: true,
        status: true,
        progress: true,
        budget: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        businessType: true,
        projectType: true,
        budget: true,
        createdAt: true,
      },
    }),
    db.inquiry.count(),
    db.inquiry.count({ where: { status: "New" } }),
    db.user.findMany({
      where: { role: { in: ["USER", "CLIENT"] } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        role: true,
        location: true,
        industry: true,
        createdAt: true,
      },
    }),
    db.user.count({ where: { role: "USER", isViewed: false } as any }),
  ]);

  // Derived in-memory from allProjects without an additional DB query
  const onTrackProjects = allProjects.filter((p: any) => p.status === "On Track");

  // 1. KPI: Total Revenue calculation
  const completedIncomeTxs = transactions.filter(
    (t) => t.type === "Income" && t.status === "Completed"
  );
  const totalRevenueNumber = completedIncomeTxs.reduce((sum, t) => sum + (t.amountRaw || 0), 0);
  const formattedTotalRevenue = `₹${totalRevenueNumber.toLocaleString("en-IN")}`;

  // Month-over-month calculation for revenue badge
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthRevenue = completedIncomeTxs.reduce((sum, t) => {
    const d = new Date(t.dateRaw || t.date);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      return sum + (t.amountRaw || 0);
    }
    return sum;
  }, 0);

  const prevMonthRevenue = completedIncomeTxs.reduce((sum, t) => {
    const d = new Date(t.dateRaw || t.date);
    if (d.getFullYear() === prevYear && d.getMonth() === prevMonth) {
      return sum + (t.amountRaw || 0);
    }
    return sum;
  }, 0);

  let revenueGrowthPercent: number | null = null;
  if (prevMonthRevenue > 0) {
    revenueGrowthPercent = Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);
  }

  // 2. KPI: Active Projects calculation
  const totalProjectsCount = allProjects.length;
  const activeProjects = allProjects.filter(
    (p: any) => p.status === "On Track" || p.status === "In Review"
  );
  const activeProjectsCount = activeProjects.length;
  const onTrackCount = onTrackProjects.length;

  // 3. KPI: Clients calculation
  const totalClientsCount = clients.length;
  const activeClientsCount = clients.filter((c: any) => c.status === "Active").length;

  // 4. Combined Recent Activity Stream
  const activityList: ActivityItem[] = [];

  // Recent transactions (top 3)
  transactions.slice(0, 3).forEach((tx) => {
    activityList.push({
      id: `tx-${tx.id}`,
      type: "finance",
      title: tx.type === "Income" ? `${tx.title || "Payment received"}` : `Expense: ${tx.title}`,
      description:
        tx.type === "Income"
          ? `${tx.clientName ? `${tx.clientName} remitted ` : ""}${tx.amount}${tx.referenceNo ? ` (${tx.referenceNo})` : ""}.`
          : `Payout of ${tx.amount} for ${tx.category}.`,
      timestamp: new Date(tx.dateRaw || tx.date),
      href: "/admin/finance",
    });
  });

  // Recent inquiries (top 3)
  inquiries.slice(0, 3).forEach((inq: any) => {
    activityList.push({
      id: `inq-${inq.id}`,
      type: "inquiry",
      title: `Inquiry from ${inq.name}`,
      description: `${inq.businessType || inq.projectType || "Client"} requested consultation (${inq.budget || "Standard"}).`,
      timestamp: new Date(inq.createdAt),
      href: "/admin/inquiries",
    });
  });

  // Recent project changes (top 2)
  allProjects.slice(0, 2).forEach((proj: any) => {
    activityList.push({
      id: `proj-${proj.id}`,
      type: "project",
      title: `Project: ${proj.title}`,
      description: `Status is ${proj.status} (${proj.progress}% progress) for ${proj.client}.`,
      timestamp: new Date(proj.updatedAt || proj.createdAt),
      href: "/admin/projects",
    });
  });

  // Recent user registrations (top 3)
  recentUsers.slice(0, 3).forEach((u: any) => {
    activityList.push({
      id: `usr-${u.id}`,
      type: "user",
      title: `User: ${u.companyName || u.name}`,
      description: `${u.name} registered as ${u.role === "USER" ? "Prospect" : "Client"}${u.location ? ` (${u.location})` : ""}.`,
      timestamp: new Date(u.createdAt),
      href: "/admin/users",
    });
  });

  // Sort activities by most recent (in-memory sort of max 8 items)
  activityList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const recentActivities = activityList.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Welcome back, {user?.name || "Suman"}. Here&apos;s a summary of your agency&apos;s operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" href="/admin/finance">
            Export Report
          </Button>
          <Button variant="primary" size="sm" href="/admin/projects">
            New Project
          </Button>
        </div>
      </div>

      {/* New Registered Users Notification Alert Banner */}
      {newUsersCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#121212] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-sm shrink-0">
              {newUsersCount}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">
                  New User Registration{newUsersCount > 1 ? "s" : ""} Awaiting Review
                </h4>
              </div>
              <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
                {newUsersCount} prospective account{newUsersCount > 1 ? "s" : ""} registered. Review contact details, inspect activity logs, or convert them into clients.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" href="/admin/users" className="text-xs shrink-0">
Review Users Table
          </Button>
        </div>
      )}

      {/* Primary KPI Grid (2x2 on mobile, 4x1 on desktop) */}
      <div id="admin-kpi-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue -> Finance */}
        <Link href="/admin/finance" className="block group focus-visible:outline-none">
          <Card className="p-3.5 sm:p-5 flex flex-col justify-between h-full transition-all duration-200 group-hover:border-[#0A0A0A] dark:group-hover:border-white group-hover:shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <p className="text-[10px] sm:text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors">
                Total Revenue
              </p>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#F5F5F5] dark:bg-[#262626] group-hover:bg-[#0A0A0A] dark:group-hover:bg-white flex items-center justify-center transition-colors">
                <span className="text-sm font-bold text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] transition-colors">
                  ₹
                </span>
              </div>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-[#0A0A0A] dark:text-white truncate">
                {formattedTotalRevenue}
              </p>
              {revenueGrowthPercent !== null ? (
                <p className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {revenueGrowthPercent >= 0 ? `+${revenueGrowthPercent}%` : `${revenueGrowthPercent}%`}
                </p>
              ) : (
                <p className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {completedIncomeTxs.length} payments
                </p>
              )}
            </div>
          </Card>
        </Link>

        {/* Active Projects -> Projects */}
        <Link href="/admin/projects" className="block group focus-visible:outline-none">
          <Card className="p-3.5 sm:p-5 flex flex-col justify-between h-full transition-all duration-200 group-hover:border-[#0A0A0A] dark:group-hover:border-white group-hover:shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <p className="text-[10px] sm:text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors">
                Active Projects
              </p>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#F5F5F5] dark:bg-[#262626] group-hover:bg-[#0A0A0A] dark:group-hover:bg-white flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-[#0A0A0A] dark:text-white">
                +{activeProjectsCount > 0 ? activeProjectsCount : totalProjectsCount}
              </p>
              <p className="text-[10px] sm:text-xs font-medium text-[#737373] dark:text-neutral-400 mt-0.5 sm:mt-1 truncate">
                {onTrackCount > 0 ? `${onTrackCount} on track` : `${totalProjectsCount} total`}
              </p>
            </div>
          </Card>
        </Link>

        {/* Total Clients -> Clients */}
        <Link href="/admin/clients" className="block group focus-visible:outline-none">
          <Card className="p-3.5 sm:p-5 flex flex-col justify-between h-full transition-all duration-200 group-hover:border-[#0A0A0A] dark:group-hover:border-white group-hover:shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <p className="text-[10px] sm:text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors">
                Total Clients
              </p>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#F5F5F5] dark:bg-[#262626] group-hover:bg-[#0A0A0A] dark:group-hover:bg-white flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-[#0A0A0A] dark:text-white">
                {totalClientsCount}
              </p>
              <p className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +{activeClientsCount} active
              </p>
            </div>
          </Card>
        </Link>

        {/* Inquiries -> Inquiries */}
        <Link href="/admin/inquiries" className="block group focus-visible:outline-none">
          <Card className="p-3.5 sm:p-5 flex flex-col justify-between h-full transition-all duration-200 group-hover:border-[#0A0A0A] dark:group-hover:border-white group-hover:shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <p className="text-[10px] sm:text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors">
                Inquiries
              </p>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#F5F5F5] dark:bg-[#262626] group-hover:bg-[#0A0A0A] dark:group-hover:bg-white flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-[#0A0A0A] dark:text-white">
                {totalInquiriesCount}
              </p>
              <p className="text-[10px] sm:text-xs font-medium text-[#737373] dark:text-neutral-400 mt-0.5 sm:mt-1 flex items-center gap-1.5 truncate">
                {unreadInquiriesCount > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                    <span className="text-red-600 dark:text-red-400 font-semibold truncate">
                      {unreadInquiriesCount} unread
                    </span>
                  </>
                ) : (
                  <span className="text-neutral-500 truncate">All caught up</span>
                )}
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart (Dynamic Client Component) */}
        <Card id="admin-revenue-chart" className="p-6 lg:col-span-2 flex flex-col">
          <RevenueChart transactions={transactions} />
        </Card>

        {/* Recent Activity List */}
        <Card id="admin-activity-feed" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-white">Recent Activity</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F5F5F5] dark:bg-[#262626] text-[#737373] dark:text-neutral-400">
                Live Feed
              </span>
            </div>

            <div className="space-y-5">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <Link
                    key={act.id}
                    href={act.href}
                    className="flex gap-4 group rounded-md p-1.5 -mx-1.5 transition-colors hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] dark:bg-[#262626] flex items-center justify-center shrink-0 group-hover:bg-[#0A0A0A] dark:group-hover:bg-white transition-colors">
                      {act.type === "finance" ? (
                        <svg className="w-4 h-4 text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : act.type === "inquiry" ? (
                        <svg className="w-4 h-4 text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : act.type === "user" ? (
                        <svg className="w-4 h-4 text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-[#0A0A0A] dark:text-white group-hover:text-white dark:group-hover:text-[#0A0A0A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white group-hover:underline truncate">
                        {act.title}
                      </p>
                      <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5 line-clamp-1">
                        {act.description}
                      </p>
                      <p className="text-[10px] font-mono text-[#737373] dark:text-neutral-500 mt-1">
                        {formatRelativeTime(act.timestamp)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#737373] dark:text-neutral-400">
                  No recent activity recorded yet.
                </div>
              )}
            </div>
          </div>

          <Button variant="secondary" className="w-full mt-6 text-xs" href="/admin/finance">
            View All Activity
          </Button>
        </Card>
      </div>

      {/* Active Projects Data Table - Shows all On Track projects */}
      <Card id="admin-active-projects-table" className="overflow-hidden !p-0 border border-[#E5E5E5] dark:border-[#262626]">
        <div className="p-6 border-b border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-white">Active Projects</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                On Track ({onTrackCount})
              </span>
            </div>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              Current active client deliverables and schedules
            </p>
          </div>
          <Button variant="secondary" size="sm" href="/admin/projects" className="hidden sm:inline-flex">
            View All Projects
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
            <thead className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 bg-[#FBFBFB] dark:bg-[#111111] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-6 py-4 w-16 text-center">SL</th>
                <th className="px-6 py-4 min-w-[200px]">Project Name</th>
                <th className="px-6 py-4 w-36">Progress</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4">Time Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
              {onTrackProjects.length > 0 ? (
                onTrackProjects.map((project: any, index: number) => {
                  const timePeriod = formatProjectTimePeriod(project.deadline, project.createdAt);
                  const slNo = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
                  return (
                    <tr 
                      key={project.id} 
                      className="hover:bg-[#FBFBFB] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer group"
                    >
                      {/* SL No */}
                      <td className="px-6 py-4 text-center font-mono text-xs font-medium text-[#737373] dark:text-neutral-500">
                        {slNo}
                      </td>

                      {/* Project Name & Client */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <Link href="/admin/projects" className="font-semibold text-[#0A0A0A] dark:text-white group-hover:underline truncate">
                            {project.title}
                          </Link>
                          {project.client && (
                            <span className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5">
                              {project.client}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 min-w-[100px]">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-semibold text-[#0A0A0A] dark:text-white">{project.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E5E5E5] dark:bg-[#262626] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0A0A0A] dark:bg-white rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="px-6 py-4 font-mono text-xs font-medium text-[#0A0A0A] dark:text-white whitespace-nowrap">
                        {project.budget ? (project.budget.startsWith("₹") ? project.budget : `₹${project.budget}`) : "—"}
                      </td>

                      {/* Time Period (Start/End Date on Top, Remaining / Total Days on Bottom) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                            {timePeriod.dateRange}
                          </span>
                          <span className="text-[11px] font-mono text-[#737373] dark:text-neutral-400 mt-0.5">
                            {timePeriod.daysText}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#737373] dark:text-neutral-400">
                    No on-track projects currently active. <Link href="/admin/projects" className="underline hover:text-[#0A0A0A] dark:hover:text-white">View all projects</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
