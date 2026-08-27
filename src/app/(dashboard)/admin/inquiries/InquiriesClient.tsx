"use client";

import React, { useTransition, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  markInquiryAsRead,
  updateInquiryStatus,
  updateInquiryPriority,
  deleteInquiry,
} from "./actions";
import { toast } from "react-hot-toast";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  mobile: string;
  isWhatsappSame: boolean;
  whatsapp: string | null;
  businessType: string;
  services: string[];
  projectType: string;
  budget: string;
  message: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

const PROJECT_LABELS: Record<string, string> = {
  "web-dev": "Web & Software Dev",
  "ui-ux": "UI/UX Design",
  marketing: "Performance Marketing",
  automation: "Business Automation",
  other: "Custom Project",
};

/* ── Status pill ── */
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    New: "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]",
    "In Progress": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    Replied: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    Closed: "bg-[#F5F5F5] text-[#737373] dark:bg-[#1A1A1A] dark:text-neutral-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${map[status] || map.Closed}`}>
      {status}
    </span>
  );
}

/* ── Priority dot ── */
function PriorityDot({ priority }: { priority: string }) {
  const c = priority === "High" ? "bg-red-500" : priority === "Medium" ? "bg-amber-500" : "bg-[#D4D4D4] dark:bg-[#555]";
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c}`} />;
}

/* ── Inline SVG icons ── */
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const PersonIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>;
const MailIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>;
const PhoneIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>;
const WhatsAppIcon = () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>;
const BriefcaseIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>;
const LayersIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" /></svg>;
const CurrencyIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-[#A3A3A3] dark:text-neutral-500 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500">{label}</p>
        <p className="text-sm text-[#0A0A0A] dark:text-white break-words">{value}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   DETAIL MODAL (centred overlay)
════════════════════════════════ */
function InquiryModal({ inquiry, onClose }: { inquiry: Inquiry; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleStatus = (status: string) =>
    startTransition(async () => { await updateInquiryStatus(inquiry.id, status); });

  const handlePriority = (priority: string) =>
    startTransition(async () => { await updateInquiryPriority(inquiry.id, priority); });

  const statuses = ["New", "In Progress", "Replied", "Closed"];
  const priorities = ["High", "Medium", "Low"];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Centred modal — max-w-2xl, margin on all sides */}
      <div 
        className="fixed inset-4 sm:inset-8 md:inset-16 z-50 flex items-start justify-center overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative w-full max-w-2xl mx-auto rounded-2xl bg-white dark:bg-[#111111] shadow-2xl border border-[#E5E5E5] dark:border-[#262626] animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-[#E5E5E5] dark:border-[#262626] flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <PriorityDot priority={inquiry.priority} />
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-[#A3A3A3] dark:text-neutral-500 uppercase tracking-wider">
                  #{inquiry.id.slice(0, 8)} · {format(new Date(inquiry.createdAt), "dd MMM yyyy, hh:mm a")}
                </p>
                <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-white truncate">{inquiry.name}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#262626] text-[#737373] dark:text-neutral-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-2">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((s) => (
                    <button key={s} onClick={() => handleStatus(s)} disabled={isPending}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${inquiry.status === s
                          ? "bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white"
                          : "border-[#E5E5E5] dark:border-[#2A2A2A] text-[#737373] dark:text-neutral-400 hover:border-[#0A0A0A] dark:hover:border-neutral-300"
                        }`}
                    >{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-2">Priority</p>
                <div className="flex gap-1.5">
                  {priorities.map((p) => {
                    const dot = p === "High" ? "bg-red-500" : p === "Medium" ? "bg-amber-500" : "bg-[#737373]";
                    return (
                      <button key={p} onClick={() => handlePriority(p)} disabled={isPending}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${inquiry.priority === p
                            ? "bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white"
                            : "border-[#E5E5E5] dark:border-[#2A2A2A] text-[#737373] dark:text-neutral-400 hover:border-[#0A0A0A] dark:hover:border-neutral-300"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <hr className="border-[#F0F0F0] dark:border-[#1E1E1E]" />

            {/* Contact */}
            <section className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500">Contact Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow icon={<PersonIcon />} label="Full Name" value={inquiry.name} />
                <DetailRow icon={<MailIcon />} label="Email" value={inquiry.email} />
                <DetailRow icon={<PhoneIcon />} label="Mobile" value={`+91 ${inquiry.mobile}`} />
                <DetailRow icon={<WhatsAppIcon />} label="WhatsApp"
                  value={inquiry.isWhatsappSame ? `Same as mobile` : `+91 ${inquiry.whatsapp || "—"}`} />
              </div>
            </section>

            <hr className="border-[#F0F0F0] dark:border-[#1E1E1E]" />

            {/* Project */}
            <section className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500">Project Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow icon={<BriefcaseIcon />} label="Business Type" value={inquiry.businessType} />
                <DetailRow icon={<LayersIcon />} label="Engagement" value={PROJECT_LABELS[inquiry.projectType] || inquiry.projectType} />
                <DetailRow icon={<CurrencyIcon />} label="Budget" value={inquiry.budget} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-2">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {inquiry.services.map((s) => (
                    <span key={s} className="px-2.5 py-1 text-xs font-medium bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white rounded-md border border-[#E5E5E5] dark:border-[#2A2A2A]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <hr className="border-[#F0F0F0] dark:border-[#1E1E1E]" />

            {/* Message */}
            <section>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-2">Project Description</p>
              <p className="text-sm text-[#737373] dark:text-neutral-300 leading-relaxed whitespace-pre-wrap bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-lg p-4 border border-[#F0F0F0] dark:border-[#1E1E1E]">
                {inquiry.message}
              </p>
            </section>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3 rounded-lg bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#F0F0F0] dark:border-[#1E1E1E]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-1">Submitted</p>
                <p className="font-semibold text-[#0A0A0A] dark:text-white">{format(new Date(inquiry.createdAt), "dd MMM yyyy")}</p>
                <p className="text-[#A3A3A3] dark:text-neutral-500">{format(new Date(inquiry.createdAt), "hh:mm a")} · {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#F0F0F0] dark:border-[#1E1E1E]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-1">Last Updated</p>
                <p className="font-semibold text-[#0A0A0A] dark:text-white">{format(new Date(inquiry.updatedAt), "dd MMM yyyy")}</p>
                <p className="text-[#A3A3A3] dark:text-neutral-500">{format(new Date(inquiry.updatedAt), "hh:mm a")} · {formatDistanceToNow(new Date(inquiry.updatedAt), { addSuffix: true })}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-[#E5E5E5] dark:border-[#262626] flex-shrink-0">
            <a href={`mailto:${inquiry.email}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] hover:opacity-90 transition-opacity">
              <MailIcon /> Reply via Email
            </a>
            <a href={`tel:+91${inquiry.mobile}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors">
              <PhoneIcon /> Call Now
            </a>
            <a href={`https://wa.me/91${inquiry.isWhatsappSame ? inquiry.mobile : (inquiry.whatsapp || inquiry.mobile)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors">
              <WhatsAppIcon /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════
   LIST CARD ROW
════════════════════════════════ */
function InquiryRow({
  index,
  inquiry,
  onView,
  onDelete,
}: {
  index: number;
  inquiry: Inquiry;
  onView: () => void;
  onDelete: () => void;
}) {
  const [deleting, startDelete] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, startMarkRead] = useTransition();

  const handleView = () => {
    onView();
    if (inquiry.status === "New") {
      startMarkRead(async () => { await markInquiryAsRead(inquiry.id); });
    }
  };

  const handleDelete = () => {
    startDelete(async () => {
      await deleteInquiry(inquiry.id);
      onDelete();
      toast.success("Inquiry deleted successfully");
    });
  };


  const isUnread = inquiry.status === "New";

  return (
    <div
      className={`relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3.5 border-b border-[#F0F0F0] dark:border-[#1A1A1A] last:border-0 transition-colors ${isUnread
          ? "bg-[#FAFAFA] dark:bg-[#0D0D0D]"
          : "hover:bg-[#FAFAFA] dark:hover:bg-[#0A0A0A]"
        } ${deleting ? "opacity-40 pointer-events-none" : ""}`}
    >
      {/* Unread indicator strip */}
      {isUnread && (
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0A0A0A] dark:bg-white rounded-full" />
      )}

      {/* ── Row body: left info + right actions ── */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pl-2">

        {/* 0. Serial Number */}
        <div className="flex items-center justify-center w-6 sm:w-8 flex-shrink-0">
          <span className="text-xs font-semibold text-[#A3A3A3] dark:text-neutral-500">
            {index + 1}
          </span>
        </div>

        {/* 1. Name + Email */}
        <div className="flex items-center gap-3 min-w-0 sm:w-56 flex-shrink-0">
          <PriorityDot priority={inquiry.priority} />
          <div className="min-w-0">
            <p className={`text-sm leading-tight truncate ${isUnread ? "font-bold text-[#0A0A0A] dark:text-white" : "font-semibold text-[#0A0A0A] dark:text-neutral-300"
              }`}>{inquiry.name}</p>
            <p className="text-[11px] text-[#A3A3A3] dark:text-neutral-500 truncate">{inquiry.email}</p>
          </div>
        </div>

        {/* 2. Engagement + Business */}
        <div className="flex-shrink-0 hidden md:block md:w-48 min-w-0">
          <p className="text-xs font-semibold text-[#0A0A0A] dark:text-neutral-300 leading-tight truncate">
            {PROJECT_LABELS[inquiry.projectType] || inquiry.projectType}
          </p>
          <p className="text-[11px] text-[#A3A3A3] dark:text-neutral-500 truncate">{inquiry.businessType}</p>
        </div>

        {/* 3. Date + Time */}
        <div className="flex-shrink-0 hidden lg:block lg:w-40 min-w-0">
          <p className="text-xs font-semibold text-[#0A0A0A] dark:text-neutral-300 leading-tight truncate">
            {format(new Date(inquiry.createdAt), "dd MMM yyyy")}
          </p>
          <p className="text-[11px] text-[#A3A3A3] dark:text-neutral-500 truncate">
            {format(new Date(inquiry.createdAt), "hh:mm a")} ·{" "}
            {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* 4. Status pill (Pushed to the right) */}
        <div className="flex-shrink-0 sm:ml-auto flex items-center justify-end pr-2 sm:pr-4">
          <StatusPill status={inquiry.status} />
        </div>

        {/* 5. Budget */}
        <div className="flex-shrink-0 w-20 sm:w-24 min-w-0">
          <p className="text-xs font-bold text-[#0A0A0A] dark:text-white leading-tight truncate">{inquiry.budget}</p>
          {/* mobile: show date here since lg cols hidden */}
          <p className="text-[11px] text-[#A3A3A3] dark:text-neutral-500 lg:hidden truncate">
            {format(new Date(inquiry.createdAt), "dd MMM")}
          </p>
        </div>
      </div>

      {/* ── 6. Actions ── */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <button
          onClick={handleView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] hover:opacity-80 transition-opacity"
        >
          <EyeIcon />
          <span className="hidden sm:inline">View</span>
        </button>

        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-neutral-400 hover:border-red-300 hover:text-red-500 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
        >
          <TrashIcon />
          <span className="hidden sm:inline">Delete</span>
        </button>

        {confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111111] p-6 shadow-2xl border border-[#E5E5E5] dark:border-[#262626] animate-in zoom-in-95 fade-in duration-200">
              <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white mb-2">Delete Inquiry</h3>
              <p className="text-sm text-[#737373] dark:text-neutral-400 mb-6">
                Are you sure you want to delete the inquiry from <strong>{inquiry.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════
   MAIN EXPORT
════════════════════════════════ */
export function InquiriesClient({ inquiries }: { inquiries: Inquiry[] }) {
  const [list, setList] = useState<Inquiry[]>(inquiries);
  const [active, setActive] = useState<Inquiry | null>(null);

  React.useEffect(() => { setList(inquiries); }, [inquiries]);

  const handleView = (inq: Inquiry) => {
    setActive(inq);
    // Optimistically mark unread as in-progress in local state
    if (inq.status === "New") {
      setList((prev) =>
        prev.map((i) => i.id === inq.id ? { ...i, status: "In Progress" } : i)
      );
    }
  };

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((i) => i.id !== id));
    if (active?.id === id) setActive(null);
  };

  return (
    <>
      {/* List container — no headers */}
      <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden divide-y divide-[#F0F0F0] dark:divide-[#1A1A1A]">
        {list.map((inq, index) => (
          <InquiryRow
            key={inq.id}
            index={index}
            inquiry={inq}
            onView={() => handleView(inq)}
            onDelete={() => handleDelete(inq.id)}
          />
        ))}
      </div>

      {/* Modal */}
      {active && (
        <InquiryModal inquiry={active} onClose={() => setActive(null)} />
      )}
    </>
  );
}
