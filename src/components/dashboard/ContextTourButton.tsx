"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import "driver.js/dist/driver.css";

interface StepConfig {
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  };
}

function getTourConfigForPath(pathname: string): { title: string; steps: StepConfig[] } | null {
  // Normalize pathname
  const path = pathname.replace(/\/$/, "");

  // 1. Client Portal Overview (/portal)
  if (path === "/portal") {
    return {
      title: "Dashboard Overview",
      steps: [
        {
          element: "#portal-tour-header",
          popover: {
            title: "1. Command Center",
            description:
              "Welcome to your centralized portal for project deliverables, milestone progress, and inquiry tracking.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#portal-header-actions",
          popover: {
            title: "2. Quick Actions",
            description:
              "Instantly submit new project briefs, inspect active development sprints, or view billing statements.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#portal-kpi-stats",
          popover: {
            title: "3. Key Performance Metrics",
            description:
              "Monitor your submitted briefs, ongoing architect reviews, and turnaround times (< 24h SLA).",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#portal-onboarding-section, #portal-client-projects",
          popover: {
            title: "4. Deliverables & Roadmap Hub",
            description:
              "Track step-by-step milestone progression from initial discovery to active full-stack engineering sprints.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#portal-quick-matrix",
          popover: {
            title: "5. Direct Tools & Services",
            description:
              "Quick-access shortcuts to your file vault, meeting schedules, billing ledger, and service tiers.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 2. Portal Inquiries (/portal/inquiries)
  if (path === "/portal/inquiries") {
    return {
      title: "Inquiries & Project Briefs",
      steps: [
        {
          element: "#inquiry-submit-btn",
          popover: {
            title: "1. Submit Project Brief",
            description:
              "Click here to open our structured project specification builder for new SaaS, web apps, or AI integrations.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#inquiry-kpi-row",
          popover: {
            title: "2. Inquiries Overview",
            description:
              "Track your total submitted briefs, active lead architect reviews, and proposals ready for approval.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#inquiry-status-tabs",
          popover: {
            title: "3. Status Filter",
            description:
              "Quickly filter between 'Under Review' and 'Scoped' proposals ready for client approval.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#inquiry-table-card",
          popover: {
            title: "4. Briefs & Proposals Ledger",
            description:
              "Review full brief details, lead architect feedback, turnaround timelines, and proposal estimates.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 3. Portal Projects (/portal/projects)
  if (path === "/portal/projects") {
    return {
      title: "Project Sprints",
      steps: [
        {
          element: "#projects-view-toggle",
          popover: {
            title: "1. View Switcher",
            description:
              "Seamlessly toggle between a detailed Milestone Data Table and an interactive Kanban Sprint Board.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#projects-kpi-stats",
          popover: {
            title: "2. Sprint Metrics",
            description:
              "Real-time count of total deliverables, active development sprints, QA reviews, and live production releases.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#projects-status-tabs",
          popover: {
            title: "3. Sprint Filter Tabs",
            description:
              "Filter projects by 'In Progress', 'In Review', or 'Completed' milestone stages.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#projects-table-card",
          popover: {
            title: "4. Project Specifications & Progress",
            description:
              "Inspect progress bars, assigned engineering squads, deadlines, and direct deliverable links.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 4. Portal Revisions (/portal/revisions)
  if (path === "/portal/revisions") {
    return {
      title: "Quality Assurance & Revisions",
      steps: [
        {
          element: "#revision-new-btn",
          popover: {
            title: "1. New Revision Ticket",
            description:
              "Submit quality assurance change requests, UX tweaks, or feature enhancements directly to engineers.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#revision-kpi-stats",
          popover: {
            title: "2. QA Tickets Snapshot",
            description:
              "Live overview of total tickets, active developer iterations, and resolved deliverables.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#revision-status-tabs",
          popover: {
            title: "3. Ticket Filters",
            description:
              "Switch between 'Active' tickets currently in engineering progress and 'Implemented' approved changes.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#revision-table-card",
          popover: {
            title: "4. Developer Feedback & Threads",
            description:
              "Review developer replies, inspect resolution notes, and confirm ticket completions.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 5. Portal Billing (/portal/billing)
  if (path === "/portal/billing") {
    return {
      title: "Billing & Finance",
      steps: [
        {
          element: "#billing-kpi-stats",
          popover: {
            title: "1. Financial Summary",
            description:
              "Track your total investment, completed milestone payments, and current outstanding balances.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#billing-support-btn",
          popover: {
            title: "2. Dedicated Billing Support",
            description:
              "Contact our finance department directly for GST tax invoices, billing questions, or wire receipts.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#billing-table-card",
          popover: {
            title: "3. Official Invoices Ledger",
            description:
              "View itemized milestone billing records, payment methods, and download official PDF tax invoices.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 6. Portal Documents (/portal/documents)
  if (path === "/portal/documents") {
    return {
      title: "Files & Shared Documents",
      steps: [
        {
          element: "#documents-request-btn",
          popover: {
            title: "1. Request File Access",
            description:
              "Need specialized source archives, NDA copies, or API keys? Request file access directly from our team.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#documents-kpi-stats",
          popover: {
            title: "2. Document Vault Metrics",
            description:
              "Summary of all active PDF specifications, source code archives, and encryption status.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#documents-type-tabs",
          popover: {
            title: "3. Document Type Filters",
            description:
              "Filter between PDF contracts, technical specifications, and compressed ZIP source archives.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#documents-table-card",
          popover: {
            title: "4. Vault & Downloads Ledger",
            description:
              "Browse and download signed agreements, architectural blueprints, and deliverable packages.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 7. Portal Meetings (/portal/meetings)
  if (path === "/portal/meetings") {
    return {
      title: "Meetings & Consultations",
      steps: [
        {
          element: "#meetings-book-btn",
          popover: {
            title: "1. Book Milestone Call",
            description:
              "Schedule a direct video consultation with your lead architect or technical project manager.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#meetings-kpi-stats",
          popover: {
            title: "2. Meeting Overview",
            description:
              "Track total sessions, upcoming strategy checkpoints, and meeting platform details.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#meetings-status-tabs",
          popover: {
            title: "3. Calendar Status Filter",
            description:
              "Switch between upcoming scheduled syncs and past completed consultation records.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#meetings-table-card",
          popover: {
            title: "4. Scheduled Sessions & Links",
            description:
              "Access Google Meet / Zoom conference links, agenda notes, and meeting dates.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 8. Super Admin Overview (/admin)
  if (path === "/admin") {
    return {
      title: "Executive Admin Dashboard",
      steps: [
        {
          element: "#admin-kpi-grid",
          popover: {
            title: "1. Executive KPI Hub",
            description:
              "Track total agency revenue, active development sprints, total enterprise clients, and incoming inquiries.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#admin-revenue-chart",
          popover: {
            title: "2. Revenue & Growth Trends",
            description:
              "Visualize monthly cashflow, completed milestone earnings, and month-over-month growth.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#admin-activity-feed",
          popover: {
            title: "3. Real-Time Agency Live Feed",
            description:
              "Audit live events across client logins, new user registrations, inquiry submissions, and sprint updates.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#admin-active-projects-table",
          popover: {
            title: "4. Active Sprint Delivery",
            description:
              "Inspect all ongoing client sprints, milestone completion percentages, and delivery deadlines.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 9. Admin Inquiries (/admin/inquiries)
  if (path === "/admin/inquiries") {
    return {
      title: "Inquiries Management",
      steps: [
        {
          element: "#admin-inquiries-kpi",
          popover: {
            title: "1. Inquiries Triage Hub",
            description:
              "Monitor unread prospect briefs, in-progress reviews, and replied quotes in real time.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#admin-inquiries-tabs",
          popover: {
            title: "2. Status Filter Tabs",
            description:
              "Filter between Unread leads, Replied proposals, and Trashed submissions.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#admin-inquiries-search",
          popover: {
            title: "3. Live Search & Sorting",
            description:
              "Search inquiries instantly by prospect name, email, budget, or sort by newest first.",
            side: "top",
            align: "end",
          },
        },
        {
          element: "#admin-inquiries-card",
          popover: {
            title: "4. Incoming Briefs Ledger",
            description:
              "Review prospect brief requirements, assign architects, and dispatch custom pricing proposals.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 10. Admin Clients (/admin/clients)
  if (path === "/admin/clients") {
    return {
      title: "Client Accounts",
      steps: [
        {
          element: "#admin-clients-add-btn",
          popover: {
            title: "1. Add Client Account",
            description:
              "Manually onboard a new enterprise client, assign portal credentials, and set contact details.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#admin-clients-kpi",
          popover: {
            title: "2. Client Base Metrics",
            description:
              "Track active accounts, hot prospects, total enterprise revenue, and client growth.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#admin-clients-tabs",
          popover: {
            title: "3. Account Status Tabs",
            description:
              "Filter clients by Active engagements, Prospects, or Inactive accounts.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#admin-clients-search",
          popover: {
            title: "4. Client Directory Search",
            description:
              "Search clients across company name, point of contact, industry, and locations.",
            side: "top",
            align: "end",
          },
        },
        {
          element: "#admin-clients-table",
          popover: {
            title: "5. Enterprise Client Directory",
            description:
              "Inspect lifetime spend, pending balances, WhatsApp quick-links, and active project associations.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 11. Admin Projects (/admin/projects)
  if (path === "/admin/projects") {
    return {
      title: "Project Deliverables",
      steps: [
        {
          element: "#admin-projects-actions",
          popover: {
            title: "1. Create Projects & Categories",
            description:
              "Launch new client sprint deliverables and manage service category taxonomies.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#admin-projects-kpi",
          popover: {
            title: "2. Global Delivery Metrics",
            description:
              "Overview of total project volume, on-track milestones, delayed sprints, and total pipeline budget.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#admin-projects-container",
          popover: {
            title: "3. Table vs Smart Kanban Switcher",
            description:
              "Switch between full data table management and drag-and-drop interactive sprint kanban columns.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#admin-projects-table-card",
          popover: {
            title: "4. Project Delivery Ledger",
            description:
              "Monitor progress bars, budget paid vs due, client assignments, and milestone deadlines.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 12. Admin Revisions (/admin/revisions)
  if (path === "/admin/revisions") {
    return {
      title: "Revisions & Client Feedback",
      steps: [
        {
          element: "#admin-revisions-view-toggle",
          popover: {
            title: "1. View Mode Switcher",
            description:
              "Toggle between an interactive Kanban triage board and a structured tickets table.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#admin-revisions-kpi",
          popover: {
            title: "2. QA Ticket Metrics",
            description:
              "Track total client requests, tickets requiring immediate action, and shipped resolutions.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#admin-revisions-tabs",
          popover: {
            title: "3. Ticket Status Filter",
            description:
              "Filter tickets across Pending, In Review, In Progress, and Resolved sprint stages.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#admin-revisions-search",
          popover: {
            title: "4. Ticket Search & Project Filters",
            description:
              "Quickly filter tickets by specific client project, priority level (High/Medium), or keyword.",
            side: "top",
            align: "end",
          },
        },
        {
          element: "#admin-revisions-table",
          popover: {
            title: "5. Feedback Resolution Workbench",
            description:
              "Read client feedback notes, reply directly to the client portal, and update sprint QA status.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 13. Admin Finance (/admin/finance)
  if (path === "/admin/finance") {
    return {
      title: "Finance & Accounting",
      steps: [
        {
          element: "#admin-finance-create-btn",
          popover: {
            title: "1. Record New Transaction",
            description:
              "Record client milestone payments, contractor payouts, or custom agency revenue entries.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#admin-finance-kpi",
          popover: {
            title: "2. Financial KPIs & Profitability",
            description:
              "Monitor total inflow, operational outflow, net agency profit, and pending client receivables.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#admin-finance-tabs",
          popover: {
            title: "3. Transaction Category Tabs",
            description:
              "Filter financial entries by Inflow (income), Outflow (expenses), and Pending receivables.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#admin-finance-search",
          popover: {
            title: "4. Transaction Search & Filters",
            description:
              "Search by client name, invoice reference number, or filter by custom expense categories.",
            side: "top",
            align: "end",
          },
        },
        {
          element: "#admin-finance-table",
          popover: {
            title: "5. Accounting Ledger & PDF Generator",
            description:
              "Inspect payment records, generate vector A4 tax invoices, and track settlement methods.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  // 14. Admin Users (/admin/users)
  if (path === "/admin/users") {
    return {
      title: "Users Management",
      steps: [
        {
          element: "#admin-users-export-btn",
          popover: {
            title: "1. Export User Directory",
            description:
              "Download full CSV export of registered users, security roles, and activity records.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#admin-users-kpi",
          popover: {
            title: "2. User Directory Breakdown",
            description:
              "Overview of total registered accounts, newly converted clients, prospects, and administrators.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#admin-users-tabs",
          popover: {
            title: "3. Role Filter Tabs",
            description:
              "Switch between All Users, Prospects/Leads, Converted Clients, and Admins.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#admin-users-search",
          popover: {
            title: "4. Live Search & Sorting",
            description:
              "Search across user name, email, company, or sort by registration date.",
            side: "top",
            align: "end",
          },
        },
        {
          element: "#admin-users-table",
          popover: {
            title: "5. User Permissions & CRM Actions",
            description:
              "Change user roles, convert hot prospects into clients, review audit logs, and toggle account access.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }
  return null;
}

interface ContextTourButtonProps {
  isEligibleForAutoTour?: boolean;
  userId?: string;
}

export function ContextTourButton({ isEligibleForAutoTour = false, userId }: ContextTourButtonProps) {
  const pathname = usePathname();
  const [isRunning, setIsRunning] = useState(false);

  const tourConfig = getTourConfigForPath(pathname || "");

  const handleStartTour = async (isAuto = false) => {
    if (!tourConfig) return;
    setIsRunning(true);

    if (userId) {
      try {
        localStorage.setItem(`abcd_tour_seen_user_${userId}`, "true");
      } catch {}
    }

    try {
      const { driver } = await import("driver.js");

      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        stagePadding: 4,
        overlayColor: "rgba(0, 0, 0, 0.75)",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Done",
        steps: tourConfig.steps as any,
        onDestroyed: () => {
          setIsRunning(false);
          if (isAuto || pathname === "/portal") {
            import("@/app/(portal)/portal/actions").then(({ markPortalTourSeen }) => {
              markPortalTourSeen().catch(() => {});
            });
          }
        },
      });

      driverObj.drive();

      if (isAuto) {
        import("@/app/(portal)/portal/actions").then(({ markPortalTourSeen }) => {
          markPortalTourSeen().catch(() => {});
        });
      }
    } catch (err) {
      console.error("Failed to start Driver.js tour:", err);
      setIsRunning(false);
    }
  };

  // ONLY auto-trigger on user's first visit to /portal if they are a newly registered client!
  useEffect(() => {
    // 1. Must have a valid tour config
    if (!tourConfig) return;

    // 2. Must be explicitly flagged as eligible (new client registration only)
    if (!isEligibleForAutoTour) return;

    // 3. ONLY auto-trigger on the primary portal landing page ("/portal")
    if (pathname !== "/portal") return;

    try {
      // 4. Safeguard with client-side storage to ensure it never runs twice
      const userStorageKey = `abcd_tour_seen_user_${userId || "client"}`;
      const hasSeen = localStorage.getItem(userStorageKey);
      if (hasSeen) return;

      const timer = setTimeout(() => {
        handleStartTour(true);
      }, 1500);

      return () => clearTimeout(timer);
    } catch {
      // ignore localStorage errors in private browsing
    }
  }, [pathname, isEligibleForAutoTour, userId, tourConfig]);

  // If no tour is available for this current page, DO NOT SHOW the button!
  if (!tourConfig) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => handleStartTour(false)}
      disabled={isRunning}
      className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-8 sm:h-9 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white text-xs font-semibold hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer shadow-2xs"
      title={`Take guided tour of ${tourConfig.title}`}
      aria-label={`Take tour of ${tourConfig.title}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      <span className="hidden sm:inline">Take Tour</span>
      <span className="sm:hidden">Tour</span>
    </button>
  );
}
