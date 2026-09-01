import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users2, Mail, MessageCircle, Video, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const AGENCY_TEAM = [
  {
    name: "Suman Baidya",
    role: "Founder & Principal Solutions Architect",
    email: "sb.abcd321@gmail.com",
    whatsapp: "+918167685731",
    avatar: "SB",
    description: "Oversees core system architecture, cloud deployment, and strategic product roadmap.",
  },
  {
    name: "Elena Rostova",
    role: "Lead Full-Stack Engineer",
    email: "engineering@abcdagency.com",
    whatsapp: "+919812345678",
    avatar: "ER",
    description: "Spearheads Next.js frontend, database optimization, and API integration sprints.",
  },
  {
    name: "Marcus Vance",
    role: "Dedicated Technical Project Manager",
    email: "marcus@abcdagency.com",
    whatsapp: "+919845011223",
    avatar: "MV",
    description: "Maintains sprint deliverables, weekly check-in milestones, and QA acceptance testing.",
  },
];

export default function PortalTeamPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Engineering Team & Squad
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Direct lines of communication with the architects and project leads assigned to your account.
          </p>
        </div>

        <Button variant="secondary" size="sm" href="mailto:engineering@abcdagency.com">
          Team Support
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AGENCY_TEAM.map((member, idx) => (
          <Card key={idx} className="p-6 space-y-4 flex flex-col justify-between hover:border-black dark:hover:border-white transition-colors">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-sm">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">{member.name}</h3>
                  <p className="text-[11px] font-semibold text-[#737373] dark:text-neutral-400 mt-0.5">{member.role}</p>
                </div>
              </div>

              <p className="text-xs text-[#737373] dark:text-neutral-400">
                {member.description}
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#F5F5F5] dark:bg-[#1A1A1A] text-xs font-semibold text-[#0A0A0A] dark:text-white hover:opacity-80 transition-opacity"
              >
                <Mail className="w-3.5 h-3.5 text-[#737373]" />
                <span className="truncate">{member.email}</span>
              </a>

              <a
                href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:opacity-80 transition-opacity"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Direct WhatsApp</span>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
