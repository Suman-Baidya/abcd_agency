"use client";

import React, { useState, useTransition } from "react";
import { format, formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import {
  markInquiryAsRead,
  updateInquiryStatus,
  updateInquiryPriority,
  moveToTrash,
  restoreInquiry,
  deletePermanently,
  emptyTrash,
} from "./actions";
import { 
  RotateCcw, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MessageCircle,
  Eye,
  ShieldCheck,
  Building2,
  Layers
} from "lucide-react";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  mobile: string;
  isWhatsappSame: boolean;
  whatsapp?: string | null;
  businessType: string;
  services: string[];
  projectType: string;
  budget: string;
  message: string;
  status: string;
  priority: string;
  registeredUser?: {
    email: string;
    isVerified: boolean;
    role: string;
    name: string;
    companyName?: string | null;
    clientId?: string | null;
  } | null;
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
    Closed: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${map[status] || map.Closed}`}>
      {status === "Closed" ? "In Trash" : status}
    </span>
  );
}

/* ── Priority dot ── */
function PriorityDot({ priority }: { priority: string }) {
  const c = priority === "High" ? "bg-red-500" : priority === "Medium" ? "bg-amber-500" : "bg-[#D4D4D4] dark:bg-[#555]";
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c}`} />;
}

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
   DETAIL MODAL
════════════════════════════════ */
function InquiryModal({ 
  inquiry, 
  onClose,
  onUpdate
}: { 
  inquiry: Inquiry; 
  onClose: () => void;
  onUpdate: (id: string, updatedData?: Partial<Inquiry> | null) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmPermanent, setConfirmPermanent] = useState(false);

  const handleStatus = (status: string) =>
    startTransition(async () => {
      await updateInquiryStatus(inquiry.id, status);
      onUpdate(inquiry.id, { status });
      toast.success(`Status updated to ${status}`);
    });

  const handlePriority = (priority: string) =>
    startTransition(async () => {
      await updateInquiryPriority(inquiry.id, priority);
      onUpdate(inquiry.id, { priority });
      toast.success(`Priority updated to ${priority}`);
    });

  const handleMoveTrash = () =>
    startTransition(async () => {
      await moveToTrash(inquiry.id);
      onUpdate(inquiry.id, { status: "Closed" });
      toast.success("Inquiry moved to Trash (auto-purged after 15 days)");
      onClose();
    });

  const handleRestore = () =>
    startTransition(async () => {
      await restoreInquiry(inquiry.id);
      onUpdate(inquiry.id, { status: "New" });
      toast.success("Inquiry restored to active inbox");
      onClose();
    });

  const handleDeletePermanent = () =>
    startTransition(async () => {
      await deletePermanently(inquiry.id);
      onUpdate(inquiry.id, null); // null indicates removed
      toast.success("Inquiry permanently deleted");
      onClose();
    });

  const isTrash = inquiry.status === "Closed";
  const statuses = ["New", "In Progress", "Replied", "Closed"];
  const priorities = ["High", "Medium", "Low"];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <div className="relative w-full max-w-2xl mx-auto rounded-xl bg-white dark:bg-[#111111] shadow-2xl border border-[#E5E5E5] dark:border-[#262626] animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[calc(100vh-8rem)] overflow-x-hidden">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-[#E5E5E5] dark:border-[#262626] flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <PriorityDot priority={inquiry.priority} />
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-[#A3A3A3] dark:text-neutral-500 uppercase tracking-wider">
                  #{inquiry.id.slice(0, 8)} · {format(new Date(inquiry.createdAt), "dd MMM yyyy, hh:mm a")}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-white truncate">{inquiry.name}</h2>
                  {inquiry.registeredUser && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      ✓ Register User
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#262626] text-[#737373] dark:text-neutral-400 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Trash Notice Warning Banner */}
            {isTrash && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <div>
                    <span className="font-bold text-red-900 dark:text-red-300">This inquiry is in the Trash</span>
                    <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
                      Items in Trash are automatically deleted permanently after 15 days.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRestore}
                    disabled={isPending}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#1A1A1A] border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => setConfirmPermanent(true)}
                    disabled={isPending}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            )}

            {/* Registered User Banner */}
            {inquiry.registeredUser && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300">Registered User Account</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-600 text-white">
                        {inquiry.registeredUser.role === "CLIENT" ? "Active Client" : "Register User"}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Company: <strong className="font-semibold">{inquiry.registeredUser.companyName || "Personal Account"}</strong> · Authenticated via Email Verification
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-2">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatus(s)}
                      disabled={isPending}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        inquiry.status === s
                          ? "bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white"
                          : "border-[#E5E5E5] dark:border-[#2A2A2A] text-[#737373] dark:text-neutral-400 hover:border-[#0A0A0A] dark:hover:border-neutral-300"
                      }`}
                    >
                      {s === "Closed" ? "Trash" : s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-2">Priority</p>
                <div className="flex gap-1.5">
                  {priorities.map((p) => {
                    const dot = p === "High" ? "bg-red-500" : p === "Medium" ? "bg-amber-500" : "bg-[#737373]";
                    return (
                      <button
                        key={p}
                        onClick={() => handlePriority(p)}
                        disabled={isPending}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          inquiry.priority === p
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
                <DetailRow icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Full Name" value={inquiry.name} />
                <DetailRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={inquiry.email} />
                <DetailRow icon={<Phone className="w-3.5 h-3.5" />} label="Mobile" value={`+91 ${inquiry.mobile}`} />
                <DetailRow
                  icon={<MessageCircle className="w-3.5 h-3.5" />}
                  label="WhatsApp"
                  value={inquiry.isWhatsappSame ? `Same as mobile` : `+91 ${inquiry.whatsapp || "—"}`}
                />
              </div>
            </section>

            <hr className="border-[#F0F0F0] dark:border-[#1E1E1E]" />

            {/* Project */}
            <section className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500">Project Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow icon={<Building2 className="w-3.5 h-3.5" />} label="Business Type" value={inquiry.businessType} />
                <DetailRow icon={<Layers className="w-3.5 h-3.5" />} label="Engagement" value={PROJECT_LABELS[inquiry.projectType] || inquiry.projectType} />
                <DetailRow icon={<span className="font-bold">₹</span>} label="Budget" value={inquiry.budget} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-2">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {inquiry.services.map((s) => (
                    <span key={s} className="px-2.5 py-1 text-xs font-medium bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white rounded-lg border border-[#E5E5E5] dark:border-[#2A2A2A]">
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
              <p className="text-sm text-[#737373] dark:text-neutral-300 leading-relaxed whitespace-pre-wrap bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-xl p-4 border border-[#F0F0F0] dark:border-[#1E1E1E]">
                {inquiry.message}
              </p>
            </section>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#F0F0F0] dark:border-[#1E1E1E]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-1">Submitted</p>
                <p className="font-semibold text-[#0A0A0A] dark:text-white">{format(new Date(inquiry.createdAt), "dd MMM yyyy")}</p>
                <p className="text-[#A3A3A3] dark:text-neutral-500">{format(new Date(inquiry.createdAt), "hh:mm a")} · {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#F0F0F0] dark:border-[#1E1E1E]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] dark:text-neutral-500 mb-1">Last Updated</p>
                <p className="font-semibold text-[#0A0A0A] dark:text-white">{format(new Date(inquiry.updatedAt), "dd MMM yyyy")}</p>
                <p className="text-[#A3A3A3] dark:text-neutral-500">{format(new Date(inquiry.updatedAt), "hh:mm a")} · {formatDistanceToNow(new Date(inquiry.updatedAt), { addSuffix: true })}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#E5E5E5] dark:border-[#262626] flex-shrink-0">
            <div className="flex items-center gap-2">
              {!isTrash ? (
                <button
                  onClick={handleMoveTrash}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Move to Trash
                </button>
              ) : (
                <button
                  onClick={handleRestore}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`mailto:${inquiry.email}`}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] hover:opacity-90 transition-opacity"
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </a>
              <a
                href={`tel:+91${inquiry.mobile}`}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
              <a
                href={`https://wa.me/91${inquiry.isWhatsappSame ? inquiry.mobile : (inquiry.whatsapp || inquiry.mobile)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Permanently Confirmation Modal */}
      {confirmPermanent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#111111] p-6 shadow-2xl border border-[#E5E5E5] dark:border-[#262626] animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white mb-2">Permanently Delete Inquiry?</h3>
            <p className="text-sm text-[#737373] dark:text-neutral-400 mb-6">
              Are you sure you want to permanently delete the inquiry from <strong>{inquiry.name}</strong>? This cannot be undone and will be permanently wiped from the database.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmPermanent(false)}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePermanent}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isPending ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
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
  onRestore,
}: {
  index: number;
  inquiry: Inquiry;
  onView: () => void;
  onDelete: (permanent: boolean) => void;
  onRestore: () => void;
}) {
  const [isPending, startAction] = useTransition();
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState(false);
  const [, startMarkRead] = useTransition();

  const isTrash = inquiry.status === "Closed";

  const handleView = () => {
    onView();
    if (inquiry.status === "New") {
      startMarkRead(async () => { await markInquiryAsRead(inquiry.id); });
    }
  };

  const handleMoveToTrash = () => {
    startAction(async () => {
      await moveToTrash(inquiry.id);
      onDelete(false);
      toast.success("Inquiry moved to Trash (auto-purges in 15 days)");
    });
  };

  const handleRestore = () => {
    startAction(async () => {
      await restoreInquiry(inquiry.id);
      onRestore();
      toast.success("Inquiry restored from Trash");
    });
  };

  const handleDeletePermanent = () => {
    startAction(async () => {
      await deletePermanently(inquiry.id);
      onDelete(true);
      toast.success("Inquiry permanently deleted");
    });
  };

  const isUnread = inquiry.status === "New";

  return (
    <div
      className={`relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3.5 border-b border-[#F0F0F0] dark:border-[#1A1A1A] last:border-0 transition-colors ${
        isUnread
          ? "bg-[#FAFAFA] dark:bg-[#0D0D0D]"
          : "hover:bg-[#FAFAFA] dark:hover:bg-[#0A0A0A]"
      } ${isPending ? "opacity-40 pointer-events-none" : ""}`}
    >
      {/* Unread indicator strip */}
      {isUnread && (
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0A0A0A] dark:bg-white rounded-full" />
      )}

      {/* ── Row body: left info + right actions ── */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pl-2">
        {/* 0. Serial Number */}
        <div className="flex items-center justify-center w-6 sm:w-8 flex-shrink-0">
          <span className="text-xs font-mono font-medium text-[#737373] dark:text-neutral-500">
            {index + 1 < 10 ? `0${index + 1}` : index + 1}
          </span>
        </div>

        {/* 1. Name + Email + Verified Badge */}
        <div className="flex items-center gap-3 min-w-0 sm:w-60 flex-shrink-0">
          <PriorityDot priority={inquiry.priority} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={`text-sm leading-tight truncate ${isUnread ? "font-bold text-[#0A0A0A] dark:text-white" : "font-semibold text-[#0A0A0A] dark:text-neutral-300"}`}>
                {inquiry.name}
              </p>
              {inquiry.registeredUser && (
                <span
                  title="Registered User Account"
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                >
                  ✓ Register User
                </span>
              )}
            </div>
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
          <p className="text-[11px] text-[#A3A3A3] dark:text-neutral-500 lg:hidden truncate">
            {format(new Date(inquiry.createdAt), "dd MMM")}
          </p>
        </div>
      </div>

      {/* ── 6. Actions ── */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <button
          onClick={handleView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View</span>
        </button>

        {isTrash ? (
          <>
            <button
              onClick={handleRestore}
              title="Restore to Active Inbox"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#E5E5E5] dark:border-[#262626] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restore</span>
            </button>

            <button
              onClick={() => setConfirmPermanentDelete(true)}
              title="Delete permanently from Database"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Delete Forever</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleMoveToTrash}
            title="Move to Trash"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-neutral-400 hover:border-red-300 hover:text-red-500 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}

        {/* Permanent Delete Confirmation Dialog */}
        {confirmPermanentDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#111111] p-6 shadow-2xl border border-[#E5E5E5] dark:border-[#262626] animate-in zoom-in-95">
              <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white mb-2">Delete Permanently?</h3>
              <p className="text-sm text-[#737373] dark:text-neutral-400 mb-6">
                Are you sure you want to permanently delete the inquiry from <strong>{inquiry.name}</strong>? This action is permanent and cannot be recovered.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setConfirmPermanentDelete(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeletePermanent} 
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isPending ? "Deleting..." : "Delete Permanently"}
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
export function InquiriesClient({ 
  inquiries, 
  startIndex = 1,
  currentTab = "Unread"
}: { 
  inquiries: Inquiry[]; 
  startIndex?: number;
  currentTab?: string;
}) {
  const [list, setList] = useState<Inquiry[]>(inquiries);
  const [active, setActive] = useState<Inquiry | null>(null);
  const [isPendingEmpty, startEmpty] = useTransition();
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  React.useEffect(() => { setList(inquiries); }, [inquiries]);

  const handleView = (inq: Inquiry) => {
    setActive(inq);
    if (inq.status === "New") {
      setList((prev) =>
        prev.map((i) => i.id === inq.id ? { ...i, status: "In Progress" } : i)
      );
    }
  };

  const handleDelete = (id: string, permanent: boolean) => {
    setList((prev) => prev.filter((i) => i.id !== id));
    if (active?.id === id) setActive(null);
  };

  const handleRestore = (id: string) => {
    setList((prev) => prev.filter((i) => i.id !== id));
    if (active?.id === id) setActive(null);
  };

  const handleModalUpdate = (id: string, updatedData?: Partial<Inquiry> | null) => {
    if (updatedData === null) {
      setList((prev) => prev.filter((i) => i.id !== id));
      setActive(null);
    } else if (updatedData) {
      setList((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updatedData } : i))
      );
      if (active?.id === id) {
        setActive((prev) => (prev ? { ...prev, ...updatedData } : null));
      }
    }
  };

  const handleEmptyTrash = () => {
    startEmpty(async () => {
      await emptyTrash();
      setList([]);
      setShowEmptyConfirm(false);
      toast.success("Trash emptied successfully");
    });
  };

  const isTrashTab = currentTab === "Trash";

  return (
    <>
      {/* Informative Trash Banner */}
      {isTrashTab && list.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-500/20 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Inquiries in Trash are automatically deleted permanently after <strong>15 days</strong>.
            </span>
          </div>
          <button
            onClick={() => setShowEmptyConfirm(true)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            Empty Trash
          </button>
        </div>
      )}

      {/* List container */}
      <div className="bg-white dark:bg-[#0A0A0A] divide-y divide-[#F0F0F0] dark:divide-[#1A1A1A]">
        {list.map((inq, index) => (
          <InquiryRow
            key={inq.id}
            index={startIndex + index - 1}
            inquiry={inq}
            onView={() => handleView(inq)}
            onDelete={(permanent) => handleDelete(inq.id, permanent)}
            onRestore={() => handleRestore(inq.id)}
          />
        ))}
      </div>

      {/* Modal */}
      {active && (
        <InquiryModal 
          inquiry={active} 
          onClose={() => setActive(null)} 
          onUpdate={handleModalUpdate}
        />
      )}

      {/* Empty Trash Confirmation Modal */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#111111] p-6 shadow-2xl border border-[#E5E5E5] dark:border-[#262626] animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white mb-2">Empty All Trash?</h3>
            <p className="text-sm text-[#737373] dark:text-neutral-400 mb-6">
              Are you sure you want to permanently delete all {list.length} inquiries currently in the trash? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowEmptyConfirm(false)}
                disabled={isPendingEmpty}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleEmptyTrash} 
                disabled={isPendingEmpty}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isPendingEmpty ? "Emptying..." : "Empty All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
