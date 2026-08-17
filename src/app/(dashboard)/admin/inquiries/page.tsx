import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Inquiries — ABCD Agency",
};

const inquiries = [
  {
    id: "INQ-001",
    name: "Alex Thompson",
    email: "alex@nexusai.com",
    subject: "AI Integration Consulting",
    message:
      "We want to explore integrating Gemini into our customer support pipeline. Looking for a consultation session to discuss feasibility and pricing.",
    status: "New",
    date: "Aug 14, 2026",
    priority: "High",
  },
  {
    id: "INQ-002",
    name: "Maria Santos",
    email: "maria@brightpath.com",
    subject: "Website Redesign Quote",
    message:
      "Our current website needs a full redesign. We want a modern, mobile-first design with a CMS. Can you provide a detailed quote?",
    status: "In Progress",
    date: "Aug 12, 2026",
    priority: "Medium",
  },
  {
    id: "INQ-003",
    name: "David Chen",
    email: "david.chen@orionv.co",
    subject: "Partnership Proposal",
    message:
      "Interested in a long-term partnership for our digital transformation projects. We have 3 SaaS products that need ongoing development.",
    status: "New",
    date: "Aug 11, 2026",
    priority: "High",
  },
  {
    id: "INQ-004",
    name: "Sarah Williams",
    email: "sarah@globaltech.io",
    subject: "Mobile App Development",
    message:
      "Looking for a team to build a cross-platform mobile app for inventory management. Budget is around $25k.",
    status: "Replied",
    date: "Aug 09, 2026",
    priority: "Medium",
  },
  {
    id: "INQ-005",
    name: "James Park",
    email: "james@startupco.dev",
    subject: "MVP Development",
    message:
      "Early-stage startup looking for rapid MVP development for a fintech product. Need it done in 6 weeks.",
    status: "Replied",
    date: "Aug 07, 2026",
    priority: "Low",
  },
  {
    id: "INQ-006",
    name: "Priya Sharma",
    email: "priya@eduflow.in",
    subject: "EdTech Platform Consultation",
    message:
      "Developing an online learning platform for the Indian market. Need advice on tech stack and architecture.",
    status: "Closed",
    date: "Aug 01, 2026",
    priority: "Low",
  },
];

function priorityDot(priority: string) {
  if (priority === "High")
    return <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />;
  if (priority === "Medium")
    return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />;
  return (
    <span className="w-2 h-2 rounded-full bg-[#737373] dark:bg-neutral-500 shrink-0" />
  );
}

function statusBadge(status: string) {
  if (status === "New") {
    return (
      <Badge
        variant="solid"
        className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border-none"
      >
        New
      </Badge>
    );
  }
  if (status === "In Progress") {
    return (
      <Badge
        variant="solid"
        className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none"
      >
        In Progress
      </Badge>
    );
  }
  if (status === "Replied") {
    return (
      <Badge
        variant="solid"
        className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none"
      >
        Replied
      </Badge>
    );
  }
  return <Badge variant="muted">Closed</Badge>;
}

export default function InquiriesPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Inquiries
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Manage incoming messages and consultation requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="solid" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none">
            {inquiries.filter((i) => i.status === "New").length} unread
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Total
          </p>
          <p className="text-xl font-bold text-[#0A0A0A] dark:text-white mt-1">
            {inquiries.length}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            New
          </p>
          <p className="text-xl font-bold text-[#0A0A0A] dark:text-white mt-1">
            {inquiries.filter((i) => i.status === "New").length}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            In Progress
          </p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-1">
            {inquiries.filter((i) => i.status === "In Progress").length}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Replied
          </p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {inquiries.filter((i) => i.status === "Replied").length}
          </p>
        </Card>
      </div>

      {/* Inquiries List */}
      <div className="space-y-3">
        {inquiries.map((inquiry) => (
          <Card
            key={inquiry.id}
            hoverEffect
            className="!p-0 overflow-hidden"
          >
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {priorityDot(inquiry.priority)}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                        {inquiry.subject}
                      </h3>
                      {statusBadge(inquiry.status)}
                    </div>
                    <p className="text-xs text-[#737373] dark:text-neutral-400 mb-2">
                      From{" "}
                      <span className="font-semibold text-[#0A0A0A] dark:text-white">
                        {inquiry.name}
                      </span>{" "}
                      · {inquiry.email}
                    </p>
                    <p className="text-sm text-[#737373] dark:text-neutral-400 line-clamp-2">
                      {inquiry.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end shrink-0">
                  <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
                    {inquiry.id}
                  </span>
                  <span className="text-xs text-[#737373] dark:text-neutral-400">
                    {inquiry.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-5 sm:px-6 py-3 border-t border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#0A0A0A] flex items-center gap-2">
              <Button variant="primary" size="sm" className="text-xs">
                Reply
              </Button>
              <Button variant="secondary" size="sm" className="text-xs">
                Archive
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
