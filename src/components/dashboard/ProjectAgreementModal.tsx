"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, Download, FileText, Shield, Loader2, Mail, Phone, Globe, User,
  Edit3, Save, RotateCcw, PenTool, CheckCircle2, Receipt, Clock, Check,
  History, Clock3, ArrowRight, ShieldCheck, Laptop
} from "lucide-react";
import { 
  ProjectAgreementData, 
  calculateAgreementFinancials, 
  DEFAULT_AGREEMENT_TERMS,
  ConfirmationEvent,
  formatISTDateTime,
  parseConfirmationHistory
} from "@/lib/agreement-defaults";
import { formatNumberToINR } from "@/lib/sync-financials";
import { 
  updateProjectAgreement,
  signProjectAgreement,
  generateMilestoneInvoice
} from "@/app/(dashboard)/admin/projects/actions";
import { SignatureCanvasModal } from "./SignatureCanvasModal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import toast from "react-hot-toast";

/**
 * Ensures all images inside a DOM node are completely decoded before canvas rasterization.
 */
async function ensureImagesLoaded(element: HTMLElement) {
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }
  const imgs = Array.from(element.querySelectorAll("img"));
  if (imgs.length === 0) return;
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
}

export const DEFAULT_CONTRACTOR_INFO = {
  name: "Suman Baidya",
  brandName: "ABCD Agency",
  roleTitle: "Independent Software Engineer & Product Consultant",
  phone: "+91 89448 99747",
  email: "sb.abcd321@gmail.com",
  website: "https://abcdagency.com",
  jurisdiction: "West Bengal, India",
};

export const DEFAULT_AGENCY_INFO = DEFAULT_CONTRACTOR_INFO;

export interface ParsedClause {
  title: string;
  body: string;
}

/**
 * Parses terms text into structured clauses without altering or dropping text.
 */
export function parseTermsIntoClauses(text: string): ParsedClause[] {
  if (!text) return [];

  // Try splitting by clause numbers at line start, e.g. "1. ", "2. ", "10. "
  const rawClauses = text.split(/(?=(?:^|\n)\s*\d+\.\s+[A-Z])/g).map((s) => s.trim()).filter(Boolean);

  if (rawClauses.length > 1) {
    return rawClauses.map((clauseStr) => {
      const lines = clauseStr.split("\n").map((l) => l.trim()).filter(Boolean);
      const firstLine = lines[0] || "";
      const isTitleLine = /^\d+\.\s+[A-Z\s&/,\-()]+$/.test(firstLine) || (firstLine.length < 80 && /^\d+\./.test(firstLine));

      if (isTitleLine && lines.length > 1) {
        return {
          title: firstLine,
          body: lines.slice(1).join("\n"),
        };
      }
      return {
        title: isTitleLine ? firstLine : "",
        body: isTitleLine ? lines.slice(1).join("\n") : clauseStr,
      };
    });
  }

  // Fallback: split by double newlines into paragraphs
  const paragraphs = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    return paragraphs.map((p) => {
      const lines = p.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1 && lines[0].length < 75 && /^[0-9A-Z\s.,&/\-()]+$/.test(lines[0])) {
        return { title: lines[0], body: lines.slice(1).join("\n") };
      }
      return { title: "", body: p };
    });
  }

  return [{ title: "", body: text }];
}

export interface TermsPageChunk {
  clauses: ParsedClause[];
  isLastPage: boolean;
}

/**
 * Paginates clauses into clean A4 page chunks based on height capacity.
 * Guarantees standard, legible text size without shrinking text.
 */
/**
 * Accurately estimates clause rendered height inside a 714px A4 text container.
 * At text-[10px] with leading-relaxed, each line accommodates ~120 characters.
 */
export function estimateClauseHeight(clause: ParsedClause): number {
  const titleH = clause.title ? 18 : 0;
  const paragraphs = clause.body.split("\n").filter(Boolean);
  let totalLines = 0;
  for (const p of paragraphs) {
    totalLines += Math.max(1, Math.ceil(p.length / 120));
  }
  return titleH + Math.max(1, totalLines) * 15 + 10;
}

/**
 * Paginates clauses into clean A4 page chunks based on height capacity.
 * Guarantees standard, legible text size without shrinking text or leaving voids.
 */
export function paginateTerms(termsText: string, hasNotes: boolean): TermsPageChunk[] {
  const clauses = parseTermsIntoClauses(termsText);
  if (clauses.length === 0) {
    return [{ clauses: [], isLastPage: true }];
  }

  // A4 Printable inner height is ~1043px.
  // Last page requires room for Dual Execution Block (~170px) + Section 65B Audit Ledger (~125px) + Compliance Banner (~35px) + Notes (if any, ~60px) + margins
  const intermediateCapacity = 920;
  const lastPageCapacity = hasNotes ? 520 : 580;

  const clauseHeights = clauses.map(estimateClauseHeight);
  const totalHeight = clauseHeights.reduce((acc, h) => acc + h, 0);

  // If all clauses comfortably fit on a single terms page (total agreement = 2 pages)
  if (totalHeight <= lastPageCapacity) {
    return [{ clauses, isLastPage: true }];
  }

  // Distribute across pages
  const pages: TermsPageChunk[] = [];
  let currentClauses: ParsedClause[] = [];
  let currentHeight = 0;

  for (let i = 0; i < clauses.length; i++) {
    const c = clauses[i];
    const h = clauseHeights[i];

    // Check if remaining clauses can fit on this page as the final page
    let remainingNeed = 0;
    for (let j = i; j < clauses.length; j++) {
      remainingNeed += clauseHeights[j];
    }

    if (currentHeight + remainingNeed <= lastPageCapacity) {
      for (let j = i; j < clauses.length; j++) {
        currentClauses.push(clauses[j]);
      }
      pages.push({ clauses: currentClauses, isLastPage: true });
      return pages;
    }

    if (currentHeight + h > intermediateCapacity && currentClauses.length > 0) {
      pages.push({ clauses: [...currentClauses], isLastPage: false });
      currentClauses = [c];
      currentHeight = h;
    } else {
      currentClauses.push(c);
      currentHeight += h;
    }
  }

  if (currentClauses.length > 0) {
    pages.push({ clauses: currentClauses, isLastPage: true });
  }

  for (let i = 0; i < pages.length; i++) {
    pages[i].isLastPage = i === pages.length - 1;
  }

  return pages;
}

interface PaperProps {
  agreement: ProjectAgreementData;
  agencyInfo?: typeof DEFAULT_CONTRACTOR_INFO;
  page1Ref?: React.RefObject<HTMLDivElement | null>;
  page2Ref?: React.RefObject<HTMLDivElement | null>;
  pagesRef?: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onOpenSignModal?: () => void;
  onGenerateInvoice?: (milestoneNumber: 1 | 2 | 3) => void;
  generatingMilestone?: number | null;
}

/**
 * A4 Printable Statement of Work & Independent Contractor Agreement
 * Automatically paginates across multiple A4 pages when terms expand.
 * Preserves constant, executive text size with zero blank pages.
 */
export function AgreementDocumentPaper({
  agreement,
  agencyInfo = DEFAULT_CONTRACTOR_INFO,
  page1Ref,
  page2Ref,
  pagesRef,
  onOpenSignModal,
  onGenerateInvoice,
  generatingMilestone,
}: PaperProps) {
  const formattedTotal = formatNumberToINR(agreement.totalAmountRaw);
  const formattedAdvance = formatNumberToINR(agreement.advanceAmountRaw);
  const formattedDelivery = formatNumberToINR(agreement.deliveryAmountRaw);
  const formattedFinal = formatNumberToINR(agreement.finalAmountRaw);

  const formattedDate = new Date(agreement.issuedAt || Date.now()).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const historyList = parseConfirmationHistory(agreement.confirmationHistory);
  const initialExecutionEvent = historyList.find((e) => e.event === "INITIAL_EXECUTION");
  const reconfirmationEvents = historyList.filter((e) => e.event === "AMENDMENT_RECONFIRMATION");
  const latestReconfirmation = reconfirmationEvents.length > 0 ? reconfirmationEvents[reconfirmationEvents.length - 1] : null;

  const initialSignedDate = agreement.originalSignedAt || initialExecutionEvent?.timestamp || agreement.signedAt;
  const initialSignedIp = agreement.originalSignedIp || initialExecutionEvent?.ip || agreement.signedIp;
  const initialAuditHash = agreement.originalAuditHash || initialExecutionEvent?.auditHash || agreement.signedAuditHash;

  const isAmendedAfterSigning = Boolean(
    initialSignedDate &&
    agreement.updatedAt &&
    new Date(agreement.updatedAt).getTime() > new Date(initialSignedDate).getTime() + 5000
  );

  const hasReconfirmed = Boolean(
    isAmendedAfterSigning &&
    latestReconfirmation &&
    new Date(latestReconfirmation.timestamp).getTime() >= (agreement.updatedAt ? new Date(agreement.updatedAt).getTime() - 5000 : 0)
  );

  const formattedAmendedDate = agreement.updatedAt ? formatISTDateTime(agreement.updatedAt) : null;

  const termsText = agreement.termsAndPolicy || DEFAULT_AGREEMENT_TERMS;
  const termsPages = paginateTerms(termsText, Boolean(agreement.notes));
  const totalPages = 1 + termsPages.length;

  return (
    <div className="agreement-print-container flex flex-col items-center w-full max-w-[794px] space-y-6">
      
      {/* ==================================================================== */}
      {/* PAGE 1: SOW SCOPE, TIMELINE, MILESTONE BREAKDOWN & REVIEW WINDOW */}
      {/* ==================================================================== */}
      <div
        ref={(el) => {
          if (page1Ref) (page1Ref as any).current = el;
          if (pagesRef) {
            pagesRef.current[0] = el;
            pagesRef.current.length = totalPages;
          }
        }}
        id="agreement-page-1"
        className="agreement-page-card w-[794px] min-h-[1123px] bg-white text-[#0A0A0A] p-10 shadow-sm border border-[#E5E5E5] dark:border-[#262626] font-sans flex flex-col justify-between text-left select-text rounded-xl"
        style={{ width: "794px", minHeight: "1123px", boxSizing: "border-box" }}
      >
        <div className="space-y-4">
          {/* Header: Executive Freelance Letterhead */}
          <div className="flex flex-row justify-between items-start border-b-2 border-[#0A0A0A] pb-5">
            {/* Left: Brand Logo & Formal Contract Identity */}
            <div className="flex flex-col justify-between">
              <div>
                <img
                  src="/images/document_logo.png"
                  alt={agencyInfo.brandName}
                  className="h-10 w-auto object-contain max-w-[210px]"
                  crossOrigin="anonymous"
                  style={{ imageRendering: "auto" }}
                />
              </div>
              <div className="mt-3.5 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-[#0A0A0A] text-white text-[9px] font-bold uppercase tracking-widest">
                  Freelance SOW
                </div>
                <h1 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                  Independent Contractor Agreement
                </h1>
                <p className="text-[10px] text-[#737373]">
                  Pursuant to Indian Contract Act, 1872 • Professional Engineering Services
                </p>
              </div>
            </div>

            {/* Right: Suman Baidya Executive Contact Card (Mobile FIRST, Email SECOND, Site THIRD - No address) */}
            <div className="text-right text-[11px] text-[#262626] leading-tight space-y-1 pl-4">
              <h2 className="font-bold text-sm text-[#0A0A0A] uppercase tracking-wide">
                {agencyInfo.name}
              </h2>
              <p className="text-[11px] text-[#525252] font-medium">
                {agencyInfo.roleTitle}
              </p>
              <p className="text-[10px] font-semibold text-[#737373]">
                Operating as {agencyInfo.brandName}
              </p>

              {/* Contact Rows - Absolutely Bulletproof Alignment */}
              <div className="pt-2 mt-1.5 border-t border-[#E5E5E5] space-y-1 font-sans">
                <div className="flex items-center justify-end gap-1.5 text-[#0A0A0A]">
                  <Phone className="w-3.5 h-3.5 text-[#0A0A0A] shrink-0" />
                  <span className="font-semibold text-[11px]">{agencyInfo.phone}</span>
                </div>
                <div className="flex items-center justify-end gap-1.5 text-[#525252]">
                  <Mail className="w-3.5 h-3.5 text-[#0A0A0A] shrink-0" />
                  <span className="text-[11px]">{agencyInfo.email}</span>
                </div>
                <div className="flex items-center justify-end gap-1.5 text-[#525252]">
                  <Globe className="w-3.5 h-3.5 text-[#0A0A0A] shrink-0" />
                  <span className="text-[11px]">{agencyInfo.website}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Reference Metadata Bar */}
          <div className="grid grid-cols-4 gap-3 py-2.5 border-b border-[#E5E5E5] text-xs bg-[#FAFAFA] px-3.5 rounded-lg">
            <div>
              <span className="text-[9.5px] uppercase tracking-wider text-[#737373] block font-semibold">Agreement Ref</span>
              <span className="font-mono font-bold text-xs text-[#0A0A0A]">{agreement.agreementNumber}</span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase tracking-wider text-[#737373] block font-semibold">Date of Issue</span>
              <span className="font-semibold text-xs text-[#0A0A0A]">{formattedDate}</span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase tracking-wider text-[#737373] block font-semibold">Engagement Type</span>
              <span className="font-bold text-xs text-[#0A0A0A] uppercase tracking-tight">Independent SOW</span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase tracking-wider text-[#737373] block font-semibold">Governing Law</span>
              <span className="font-semibold text-xs text-[#0A0A0A]">{agencyInfo.jurisdiction || "West Bengal, India"}</span>
            </div>
          </div>

          {/* Super Admin Post-Client Confirmation Upgrade Stamp */}
          {isAmendedAfterSigning && (
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0A0A0A] text-white rounded-md text-[10px] border border-[#262626]">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-white text-[#0A0A0A] text-[8px] font-mono font-bold uppercase tracking-wider">
                  Amended
                </span>
                <span className="font-medium text-neutral-200 text-[10px]">
                  Super Admin Addendum / Revision post-client confirmation
                </span>
              </div>
              <div className="font-mono text-[9px] text-neutral-300 font-semibold whitespace-nowrap">
                Upgraded: {formattedAmendedDate}
              </div>
            </div>
          )}

          {/* Two Column Parties Block */}
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-[#E5E5E5] text-xs">
            {/* Party A: Independent Contractor */}
            <div className="bg-[#F8F8F8] p-3.5 rounded-lg border border-[#E5E5E5] space-y-1">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#737373] block mb-0.5">
                Party A • Independent Contractor
              </span>
              <p className="font-bold text-[#0A0A0A] text-sm">{agencyInfo.name}</p>
              <p className="text-[#525252] text-[11px] pb-1">
                {agencyInfo.roleTitle} ({agencyInfo.brandName})
              </p>
              <div className="space-y-0.5 pt-1 border-t border-[#E5E5E5] text-[11px]">
                <div className="flex items-center gap-1.5 text-[#0A0A0A] font-semibold">
                  <Phone className="w-3 h-3 text-[#0A0A0A] shrink-0" />
                  <span>{agencyInfo.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#525252]">
                  <Mail className="w-3 h-3 text-[#0A0A0A] shrink-0" />
                  <span>{agencyInfo.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#525252]">
                  <Globe className="w-3 h-3 text-[#0A0A0A] shrink-0" />
                  <span>{agencyInfo.website}</span>
                </div>
              </div>
            </div>

            {/* Party B: Client Organization */}
            <div className="bg-[#F8F8F8] p-3.5 rounded-lg border border-[#E5E5E5] space-y-1">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#737373] block mb-0.5">
                Party B • Client Organization
              </span>
              <p className="font-bold text-[#0A0A0A] text-sm">{agreement.clientName || "Client Account"}</p>
              <p className="text-[#525252] text-[11px] pb-1">
                {agreement.clientContactPerson ? `Contact: ${agreement.clientContactPerson}` : "Direct Commercial Account"}
              </p>
              <div className="space-y-0.5 pt-1 border-t border-[#E5E5E5] text-[11px]">
                {agreement.clientPhone ? (
                  <div className="flex items-center gap-1.5 text-[#0A0A0A] font-semibold">
                    <Phone className="w-3 h-3 text-[#0A0A0A] shrink-0" />
                    <span>{agreement.clientPhone}</span>
                  </div>
                ) : null}
                {agreement.clientEmail ? (
                  <div className="flex items-center gap-1.5 text-[#525252]">
                    <Mail className="w-3 h-3 text-[#0A0A0A] shrink-0" />
                    <span>{agreement.clientEmail}</span>
                  </div>
                ) : null}
                {agreement.clientLocation ? (
                  <div className="flex items-center gap-1.5 text-[#737373] text-[10.5px]">
                    <span>Location: {agreement.clientLocation}</span>
                  </div>
                ) : (
                  <div className="text-[#737373] text-[10.5px]">Commercial Record on File</div>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Scope of Work & Deliverables */}
          <div className="py-2.5 border-b border-[#E5E5E5]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
              1. Scope of Work & Project Deliverables
            </h4>
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-[#0A0A0A]">Deliverable:</span>
                <span className="text-[#262626] font-semibold text-sm">{agreement.projectTitle}</span>
                <span className="text-[9.5px] uppercase font-mono px-2 py-0.5 rounded bg-[#0A0A0A] text-white font-bold">
                  {agreement.projectCategory || "Engineering"}
                </span>
              </div>
              {agreement.projectSummary && (
                <p className="text-[#525252] text-[11px] leading-relaxed">{agreement.projectSummary}</p>
              )}
              <div className="grid grid-cols-3 gap-3 pt-1.5 text-[11px] bg-[#FAFAFA] p-2.5 rounded border border-[#E5E5E5]">
                <div>
                  <span className="text-[#737373] block text-[9.5px] uppercase font-semibold">Commencement</span>
                  <span className="font-bold text-[#0A0A0A]">{agreement.startDate || "Upon Contract Execution"}</span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[9.5px] uppercase font-semibold">Target Delivery</span>
                  <span className="font-bold text-[#0A0A0A]">{agreement.deliveryDate || "Milestone Sprints"}</span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[9.5px] uppercase font-semibold">Estimated Duration</span>
                  <span className="font-bold text-[#0A0A0A]">{agreement.estimatedDuration || "4–6 Weeks"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Consideration & Milestone Schedule */}
          <div className="py-2.5 border-b border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                2. Financial Consideration & Milestone Schedule
              </h4>
              <div className="px-2.5 py-1 bg-[#0A0A0A] text-white rounded text-xs font-bold font-mono">
                Total Project Fee: {formattedTotal}
              </div>
            </div>

            <div className="overflow-hidden border border-[#E5E5E5] rounded-md text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[9.5px] uppercase font-bold text-[#525252]">
                  <tr>
                    <th className="py-2 px-3">Milestone Deliverable</th>
                    <th className="py-2 px-3 text-center w-24">Share (%)</th>
                    <th className="py-2 px-3 text-center w-36">Amount (INR)</th>
                    <th className="py-2 px-3 text-right">Payment Terms</th>
                    {onGenerateInvoice && (
                      <th className="py-2 px-3 text-right w-28 no-print">Invoice Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-[11px]">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#0A0A0A]">Milestone 1: Upfront Advance Deposit</td>
                    <td className="py-2 px-3 text-center font-semibold">{agreement.advancePercent}%</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-[#0A0A0A]">{formattedAdvance}</td>
                    <td className="py-2 px-3 text-right text-[#525252]">Due upon contract execution</td>
                    {onGenerateInvoice && (
                      <td className="py-2 px-3 text-right no-print">
                        <button
                          type="button"
                          onClick={() => onGenerateInvoice(1)}
                          disabled={generatingMilestone === 1}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#0A0A0A] hover:bg-neutral-800 text-white px-2 py-0.5 rounded shadow-2xs transition disabled:opacity-50"
                          title="Generate official Milestone 1 invoice in Finance Ledger"
                        >
                          {generatingMilestone === 1 ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Receipt className="w-2.5 h-2.5" />
                          )}
                          <span>Invoice</span>
                        </button>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#0A0A0A]">Milestone 2: Staging / Feature Delivery</td>
                    <td className="py-2 px-3 text-center font-semibold">{agreement.deliveryPercent}%</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-[#0A0A0A]">{formattedDelivery}</td>
                    <td className="py-2 px-3 text-right text-[#525252]">Due upon staging demo</td>
                    {onGenerateInvoice && (
                      <td className="py-2 px-3 text-right no-print">
                        <button
                          type="button"
                          onClick={() => onGenerateInvoice(2)}
                          disabled={generatingMilestone === 2}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#0A0A0A] hover:bg-neutral-800 text-white px-2 py-0.5 rounded shadow-2xs transition disabled:opacity-50"
                          title="Generate official Milestone 2 invoice in Finance Ledger"
                        >
                          {generatingMilestone === 2 ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Receipt className="w-2.5 h-2.5" />
                          )}
                          <span>Invoice</span>
                        </button>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#0A0A0A]">Milestone 3: Final Acceptance & Handover</td>
                    <td className="py-2 px-3 text-center font-semibold">{agreement.finalPercent}%</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-[#0A0A0A]">{formattedFinal}</td>
                    <td className="py-2 px-3 text-right text-[#525252]">Net {agreement.paymentDueDays} days post-review</td>
                    {onGenerateInvoice && (
                      <td className="py-2 px-3 text-right no-print">
                        <button
                          type="button"
                          onClick={() => onGenerateInvoice(3)}
                          disabled={generatingMilestone === 3}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#0A0A0A] hover:bg-neutral-800 text-white px-2 py-0.5 rounded shadow-2xs transition disabled:opacity-50"
                          title="Generate official Milestone 3 invoice in Finance Ledger"
                        >
                          {generatingMilestone === 3 ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Receipt className="w-2.5 h-2.5" />
                          )}
                          <span>Invoice</span>
                        </button>
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Client Review, Quality Inspection & Acceptance Period */}
          <div className="py-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
              3. Client Review, Quality Inspection & Acceptance Period
            </h4>
            <div className="p-3 bg-[#F9F9F9] border border-[#E5E5E5] rounded-md text-[10.5px] text-[#262626] leading-relaxed space-y-1">
              <p>
                <strong>• Inspection Window:</strong> The Client is granted an official{" "}
                <span className="font-bold underline text-[#0A0A0A]">
                  {agreement.reviewWindowDays} calendar days formal Review Window
                </span>{" "}
                following milestone/staging deployment.
              </p>
              <p>
                <strong>• Scope of Testing:</strong> During this period, the Client may conduct user acceptance testing (UAT) and submit documented bugs, functional discrepancies, and feedback within the agreed project deliverables.
              </p>
              <p>
                <strong>• Deemed Acceptance:</strong> Absence of written objections or documented feedback prior to the expiration of the {agreement.reviewWindowDays}-day window shall legally constitute complete project satisfaction and formal technical sign-off.
              </p>
            </div>
          </div>
        </div>

        {/* Page 1 Bottom Footer */}
        <div className="pt-3 border-t border-[#E5E5E5] flex items-end justify-between text-[9px] text-[#737373] mt-auto select-none">
          {/* Left: Statutory Compliance & Legal Reference */}
          <div className="space-y-0.5 max-w-[530px]">
            <div className="flex items-center gap-1.5 text-[#525252] text-[8.5px] leading-tight">
              <Shield className="w-2.5 h-2.5 text-[#0A0A0A] shrink-0" />
              <span className="font-medium">
                Independent Contractor Statement of Work • Pursuant to Indian Contract Act, 1872 & IT Act, 2000 (§ 10A).
              </span>
            </div>
            <div className="flex items-center gap-2 text-[8px] font-mono text-[#737373]">
              <span className="text-[#0A0A0A] font-semibold">Ref: {agreement.agreementNumber}</span>
              <span>•</span>
              <span>Contractor: {agencyInfo.name} ({agencyInfo.brandName})</span>
              {isAmendedAfterSigning && (
                <>
                  <span>•</span>
                  <span className="text-[#0A0A0A] font-bold whitespace-nowrap">
                    Upgraded: {formattedAmendedDate}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: High-End Monospace Pagination Slate */}
          <div className="shrink-0 pl-4 text-right whitespace-nowrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FAFAFA] border border-[#E5E5E5] font-mono text-[9px] text-[#0A0A0A] font-bold tracking-widest whitespace-nowrap shadow-2xs">
              <span className="text-[#737373] font-medium text-[8px] tracking-wider">PAGE</span>
              <span className="text-[#0A0A0A]">01</span>
              <span className="text-[#A3A3A3] font-normal">/</span>
              <span className="text-[#737373]">{String(totalPages).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PAGES 2+: TERMS OF ENGAGEMENT, NOTES & DIGITAL VERIFICATION */}
      {/* ==================================================================== */}
      {termsPages.map((chunk, pIdx) => {
        const pageNum = pIdx + 2;

        return (
          <React.Fragment key={pIdx}>
            {/* Visual Page Divider in On-Screen Preview */}
            <div className="no-print flex items-center gap-2 py-1 text-[11px] font-mono font-semibold text-[#737373] dark:text-neutral-500 select-none">
              <span>Page {pageNum - 1} of {totalPages}</span>
              <span className="w-8 h-px bg-[#E5E5E5] dark:bg-[#262626]"></span>
              <span>Page {pageNum} of {totalPages}</span>
            </div>

            <div
              ref={(el) => {
                if (page2Ref && pIdx === 0) (page2Ref as any).current = el;
                if (pagesRef) {
                  pagesRef.current[pIdx + 1] = el;
                  pagesRef.current.length = totalPages;
                }
              }}
              id={`agreement-page-${pageNum}`}
              className="agreement-page-card w-[794px] min-h-[1123px] bg-white text-[#0A0A0A] p-10 shadow-sm border border-[#E5E5E5] dark:border-[#262626] font-sans flex flex-col justify-between text-left select-text rounded-xl"
              style={{ width: "794px", minHeight: "1123px", boxSizing: "border-box" }}
            >
              <div className="space-y-4">
                {/* Running Mini Header */}
                <div className="border-b border-[#0A0A0A] pb-2.5 mb-3 select-none">
                  <div className="flex flex-row items-center justify-between text-xs">
                    {/* Left: Brand & Document Identity */}
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs tracking-wider text-[#0A0A0A] uppercase">
                        {agencyInfo.brandName || "ABCD Agency"}
                      </span>
                      <span className="h-3 w-px bg-[#D4D4D4] inline-block"></span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#525252]">
                        Statement of Work
                      </span>
                      <span className="text-[9px] text-[#737373] font-medium hidden sm:inline">
                        • {agencyInfo.name}
                      </span>
                    </div>

                    {/* Right: Reference Number & Revision Status */}
                    <div className="flex items-center gap-2.5 text-right font-mono text-[9.5px]">
                      <span className="text-[#525252] font-semibold whitespace-nowrap">
                        REF: {agreement.agreementNumber}
                      </span>
                      {isAmendedAfterSigning && (
                        <span className="px-1.5 py-0.5 rounded bg-[#0A0A0A] text-white text-[7.5px] font-bold uppercase tracking-wider whitespace-nowrap">
                          Amended SOW
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sub-line: Part Indicator & Upgraded Timestamp */}
                  <div className="flex items-center justify-between text-[8px] text-[#737373] font-mono mt-1">
                    <span>
                      Terms of Engagement & Legal Policies • Part {pIdx + 1} of {termsPages.length}
                    </span>
                    {isAmendedAfterSigning && (
                      <span className="text-[#0A0A0A] font-semibold whitespace-nowrap">
                        Upgraded: {formattedAmendedDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Section 4: General Terms & Freelance Service Policies */}
                <div className={`py-2.5 ${chunk.isLastPage ? "border-b border-[#E5E5E5]" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                      4. Independent Contractor Terms of Engagement & Legal Policies
                    </h4>
                    {termsPages.length > 1 && (
                      <span className="text-[10px] font-semibold text-[#737373]">
                        Part {pIdx + 1} of {termsPages.length}
                      </span>
                    )}
                  </div>

                  {/* Standard Constant Legible Typography - NEVER Decreases */}
                  <div className="space-y-3">
                    {chunk.clauses.map((clause, cIdx) => (
                      <div key={cIdx} className="space-y-0.5">
                        {clause.title && (
                          <h5 className="font-bold text-[10.5px] uppercase tracking-wide text-[#0A0A0A]">
                            {clause.title}
                          </h5>
                        )}
                        <p className="text-[10px] text-[#262626] leading-relaxed whitespace-pre-line">
                          {clause.body}
                        </p>
                      </div>
                    ))}
                  </div>

                  {!chunk.isLastPage && (
                    <div className="pt-3 flex items-center justify-between text-[9.5px] text-[#737373] italic">
                      <span>• Terms of Engagement continue on next page •</span>
                      <span className="font-medium not-italic text-[#0A0A0A]">
                        Next: Page {pageNum + 1} →
                      </span>
                    </div>
                  )}
                </div>

                {/* Only on the final page: Section 5 Notes & Digital Verification Record */}
                {chunk.isLastPage && (
                  <>
                    {/* Section 5: Custom Stipulations & Notes (if any) */}
                    {agreement.notes && (
                      <div className="py-2.5 border-b border-[#E5E5E5]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
                          5. Special Commercial Stipulations & Notes
                        </h4>
                        <p className="text-[10.5px] text-[#525252] bg-[#FAFAFA] p-3 rounded-md border border-[#E5E5E5]">
                          {agreement.notes}
                        </p>
                      </div>
                    )}

                    {/* Dual Execution Signature Block */}
                    <div className="pt-2 pb-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                          Dual Execution & Electronic Attestation (IT Act, 2000 § 10A)
                        </span>
                        <span className="text-[9px] font-mono text-[#737373]">
                          Ref: {agreement.agreementNumber}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        {/* Party A: Contractor Execution */}
                        <div className="p-3 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-1.5 mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#0A0A0A]">
                                  Party A
                                </span>
                                <span className="text-[9px] text-[#737373] font-medium">• Contractor</span>
                              </div>
                              <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-[#525252] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]"></span>
                                Pre-Certified
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-[#0A0A0A]">{agencyInfo.name}</p>
                              <p className="text-[10px] text-[#525252]">{agencyInfo.roleTitle}</p>
                              <p className="text-[9px] text-[#737373]">{agencyInfo.brandName}</p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-[#E5E5E5]">
                            <div className="h-8 flex items-center">
                              <span className="text-xl italic font-serif text-[#0A0A0A] font-['Dancing_Script',Georgia,serif] select-none">
                                Suman Baidya
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[8px] text-[#737373] mt-1 font-mono">
                              <span>Contractor Certified</span>
                              <span>West Bengal, India</span>
                            </div>
                          </div>
                        </div>

                        {/* Party B: Client Execution */}
                        <div className="p-3 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-1.5 mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#0A0A0A]">
                                  Party B
                                </span>
                                <span className="text-[9px] text-[#737373] font-medium">• Client Signatory</span>
                              </div>
                              {agreement.signedAt ? (
                                isAmendedAfterSigning ? (
                                  hasReconfirmed ? (
                                    <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-emerald-800 font-semibold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                                      Re-Confirmed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                      Amended
                                    </span>
                                  )
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-emerald-800 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                                    Executed
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-[#737373]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#A3A3A3]"></span>
                                  Pending
                                </span>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-[#0A0A0A] truncate">
                                {agreement.signedByName || agreement.clientContactPerson || agreement.clientName || "Authorized Signatory"}
                              </p>
                              <p className="text-[10px] text-[#525252] truncate">
                                {agreement.signedByTitle || "Client Representative"}
                              </p>
                              <p className="text-[9px] text-[#737373] truncate">
                                {agreement.signedByEmail || agreement.clientEmail || "Email on record"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-[#E5E5E5]">
                            {agreement.signedAt ? (
                              <div>
                                <div className="h-8 flex items-center">
                                  {agreement.signatureType === "TYPE" || !agreement.clientSignature?.startsWith("data:image/png") ? (
                                    <span 
                                      className="text-xl italic font-serif text-[#0A0A0A] font-['Dancing_Script',Georgia,serif] tracking-wide select-none"
                                      style={{ fontFeatureSettings: '"liga" 1' }}
                                    >
                                      {agreement.clientSignature && !agreement.clientSignature.startsWith("data:") 
                                        ? agreement.clientSignature 
                                        : agreement.signedByName || "Authorized Signatory"}
                                    </span>
                                  ) : (
                                    <img
                                      src={agreement.clientSignature}
                                      alt="Client Signature"
                                      className="max-h-8 max-w-[200px] object-contain"
                                      style={{ imageRendering: "-webkit-optimize-contrast" }}
                                    />
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-[8px] text-[#737373] mt-1 font-mono">
                                  <span>{formatISTDateTime(agreement.signedAt)}</span>
                                  <span>IP: {agreement.signedIp || "Verified"}</span>
                                </div>

                                {isAmendedAfterSigning && !hasReconfirmed && (
                                  <div className="mt-2 pt-1.5 border-t border-dashed border-[#E5E5E5]">
                                    {onOpenSignModal ? (
                                      <button
                                        type="button"
                                        onClick={onOpenSignModal}
                                        className="no-print w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-[#0A0A0A] hover:bg-neutral-800 text-white rounded text-[9.5px] font-bold tracking-tight transition cursor-pointer shadow-xs"
                                      >
                                        <PenTool className="w-3 h-3" />
                                        <span>Re-Confirm Amendment</span>
                                      </button>
                                    ) : (
                                      <span className="block text-center text-[7.5px] font-bold text-amber-800 uppercase tracking-wider">
                                        Amendment Pending Re-Attestation
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-1">
                                {onOpenSignModal ? (
                                  <button
                                    type="button"
                                    onClick={onOpenSignModal}
                                    className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0A0A] hover:bg-neutral-800 text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
                                  >
                                    <PenTool className="w-3.5 h-3.5" />
                                    <span>Sign & Accept Agreement</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-[#737373] italic">
                                    Pending client digital execution
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Full-width Tamper-Proof Audit Ledger (Section 65B Indian Evidence Act) */}
                      {agreement.signedAt && (
                        <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
                          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-1.5 mb-2">
                            <div className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-widest text-[#0A0A0A]">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#0A0A0A]" />
                              <span>Electronic Execution Audit Ledger (IT Act § 10A & IEA § 65B)</span>
                            </div>
                            <span className="font-mono text-[8px] text-[#737373] tracking-wide">
                              SHA-256 Non-Repudiation Verified
                            </span>
                          </div>

                          {isAmendedAfterSigning ? (
                            /* 3-Step Clean Horizontal Grid for Amended Workflow */
                            <div className="grid grid-cols-3 gap-2 text-[8px] font-mono">
                              {/* Step 1: Initial Attestation */}
                              <div className="p-2 bg-white border border-[#E5E5E5] rounded flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between text-[#737373] text-[7.5px] mb-1">
                                    <span className="font-bold uppercase tracking-wider text-[#0A0A0A]">1. Initial Execution</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  </div>
                                  <p className="font-semibold text-[#0A0A0A] truncate">
                                    {agreement.signedByName || "Client Signatory"}
                                  </p>
                                  <p className="text-[#525252] text-[7.5px]">
                                    IP: {initialSignedIp || "Verified"}
                                  </p>
                                </div>
                                <div className="mt-1 pt-1 border-t border-[#F0F0F0] text-[#737373] text-[7px]">
                                  <span className="block text-[#0A0A0A] font-semibold">{formatISTDateTime(initialSignedDate)}</span>
                                  {initialAuditHash && (
                                    <span className="block truncate" title={initialAuditHash}>
                                      Seal: {initialAuditHash.slice(0, 14)}...
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Step 2: SOW Amendment */}
                              <div className="p-2 bg-white border border-[#E5E5E5] rounded flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between text-[#737373] text-[7.5px] mb-1">
                                    <span className="font-bold uppercase tracking-wider text-[#0A0A0A]">2. SOW Amendment</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  </div>
                                  <p className="font-semibold text-[#0A0A0A] truncate">
                                    Super Admin Revision
                                  </p>
                                  <p className="text-[#525252] text-[7.5px]">
                                    Notice of Variation Sent
                                  </p>
                                </div>
                                <div className="mt-1 pt-1 border-t border-[#F0F0F0] text-[#737373] text-[7px]">
                                  <span className="block text-[#0A0A0A] font-semibold">{formattedAmendedDate}</span>
                                  <span className="block text-amber-800 font-medium">Terms Updated</span>
                                </div>
                              </div>

                              {/* Step 3: Re-Confirmation */}
                              <div className={`p-2 border rounded flex flex-col justify-between ${hasReconfirmed ? "bg-white border-[#E5E5E5]" : "bg-neutral-50 border-dashed border-[#D4D4D4]"}`}>
                                <div>
                                  <div className="flex items-center justify-between text-[#737373] text-[7.5px] mb-1">
                                    <span className="font-bold uppercase tracking-wider text-[#0A0A0A]">3. Re-Confirmation</span>
                                    <span className={`w-1.5 h-1.5 rounded-full ${hasReconfirmed ? "bg-emerald-600" : "bg-amber-500 animate-pulse"}`}></span>
                                  </div>
                                  <p className="font-semibold text-[#0A0A0A] truncate">
                                    {hasReconfirmed ? agreement.signedByName || "Client Signatory" : "Client Attestation"}
                                  </p>
                                  <p className="text-[#525252] text-[7.5px]">
                                    {hasReconfirmed ? `IP: ${agreement.signedIp || "Verified"}` : "Awaiting Execution"}
                                  </p>
                                </div>
                                <div className="mt-1 pt-1 border-t border-[#F0F0F0] text-[#737373] text-[7px]">
                                  {hasReconfirmed ? (
                                    <>
                                      <span className="block text-[#0A0A0A] font-semibold">{formatISTDateTime(agreement.signedAt)}</span>
                                      {agreement.signedAuditHash && (
                                        <span className="block truncate" title={agreement.signedAuditHash}>
                                          Seal: {agreement.signedAuditHash.slice(0, 14)}...
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="block text-amber-800 font-bold">Pending Re-Sign</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Single Clean Row for Standard Un-amended Execution */
                            <div className="grid grid-cols-2 gap-3 text-[8px] font-mono">
                              <div className="p-2 bg-white border border-[#E5E5E5] rounded flex items-center justify-between">
                                <div>
                                  <span className="text-[7.5px] font-bold text-[#737373] uppercase tracking-wider block">Contractor Certification</span>
                                  <span className="font-bold text-[#0A0A0A]">{agencyInfo.name}</span>
                                  <span className="text-[#525252] block text-[7.5px]">Authorized Independent Engineer</span>
                                </div>
                                <div className="text-right text-[7.5px] text-[#737373]">
                                  <span className="block font-semibold text-[#0A0A0A]">Attested</span>
                                  <span>West Bengal, IN</span>
                                </div>
                              </div>

                              <div className="p-2 bg-white border border-[#E5E5E5] rounded flex items-center justify-between">
                                <div>
                                  <span className="text-[7.5px] font-bold text-[#737373] uppercase tracking-wider block">Client Digital Attestation</span>
                                  <span className="font-bold text-[#0A0A0A] truncate max-w-[140px] block">{agreement.signedByName || "Authorized Signatory"}</span>
                                  <span className="text-[#525252] block text-[7.5px]">IP: {agreement.signedIp || "Verified"}</span>
                                </div>
                                <div className="text-right text-[7.5px] text-[#737373]">
                                  <span className="block font-semibold text-[#0A0A0A]">{formatISTDateTime(agreement.signedAt)}</span>
                                  {agreement.signedAuditHash && (
                                    <span className="block truncate max-w-[120px]" title={agreement.signedAuditHash}>
                                      Seal: {agreement.signedAuditHash.slice(0, 14)}...
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Compliance Footer Banner */}
                      <div className="px-3 py-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded flex items-center justify-between text-[8.5px] text-[#525252]">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-[#0A0A0A]" />
                          <span>
                            {isAmendedAfterSigning
                              ? hasReconfirmed
                                ? `Amended Statement of Work re-confirmed on ${formatISTDateTime(agreement.signedAt)} pursuant to Section 10A of the IT Act, 2000.`
                                : `Amended electronic record upgraded on ${formattedAmendedDate}. Awaiting client digital re-confirmation.`
                              : "Tamper-evident electronic record executed pursuant to Section 10A of the Indian Information Technology Act, 2000."}
                          </span>
                        </div>
                        <span className="font-mono text-[#0A0A0A] font-bold uppercase tracking-wider text-[8px]">
                          {isAmendedAfterSigning ? (hasReconfirmed ? "Re-Confirmed Record" : "Amendment Pending") : "Non-Repudiation Verified"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Page Bottom Footer */}
              <div className="pt-3 border-t border-[#E5E5E5] flex items-end justify-between text-[9px] text-[#737373] mt-auto select-none">
                {/* Left: Statutory Legal Notice & Non-Repudiation Reference */}
                <div className="space-y-0.5 max-w-[530px]">
                  <div className="flex items-center gap-1.5 text-[#525252] text-[8.5px] leading-tight">
                    <Shield className="w-2.5 h-2.5 text-[#0A0A0A] shrink-0" />
                    <span className="font-medium">
                      This electronic record is generated pursuant to the Information Technology Act, 2000 (§ 10A) and Indian Contract Act, 1872.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] font-mono text-[#737373]">
                    <span className="text-[#0A0A0A] font-semibold">Ref: {agreement.agreementNumber}</span>
                    <span>•</span>
                    <span>Governing Law: {agencyInfo.jurisdiction || "West Bengal, India"}</span>
                    {isAmendedAfterSigning && (
                      <>
                        <span>•</span>
                        <span className="text-[#0A0A0A] font-bold whitespace-nowrap">
                          Upgraded: {formattedAmendedDate}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: High-End Monospace Pagination Slate */}
                <div className="shrink-0 pl-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FAFAFA] border border-[#E5E5E5] font-mono text-[9px] text-[#0A0A0A] font-bold tracking-widest whitespace-nowrap shadow-2xs">
                    <span className="text-[#737373] font-medium text-[8px] tracking-wider">PAGE</span>
                    <span className="text-[#0A0A0A]">{String(pageNum).padStart(2, "0")}</span>
                    <span className="text-[#A3A3A3] font-normal">/</span>
                    <span className="text-[#737373]">{String(totalPages).padStart(2, "0")}</span>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}

    </div>
  );
}

/**
 * Direct Background PDF Downloader
 * Renders off-screen and saves PDF directly without opening any modal preview.
 * Dynamically captures every rendered A4 page without slicing text or blank pages.
 */
export function DirectPDFDownloader({
  agreement,
  agencyInfo = DEFAULT_CONTRACTOR_INFO,
  onComplete,
}: {
  agreement: ProjectAgreementData;
  agencyInfo?: typeof DEFAULT_CONTRACTOR_INFO;
  onComplete: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const pagesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let isCancelled = false;

    const runDownload = async () => {
      const toastId = toast.loading("Generating high-resolution Agreement PDF...");
      try {
        await new Promise((resolve) => setTimeout(resolve, 350));
        if (isCancelled) return;

        const termsText = agreement.termsAndPolicy || DEFAULT_AGREEMENT_TERMS;
        const termsPages = paginateTerms(termsText, Boolean(agreement.notes));
        const expectedTotalPages = 1 + termsPages.length;

        const pages = (pagesRef.current || []).slice(0, expectedTotalPages).filter(Boolean) as HTMLDivElement[];
        if (pages.length === 0) return;

        await Promise.all(pages.map((p) => ensureImagesLoaded(p)));

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        for (let i = 0; i < pages.length; i++) {
          if (i > 0) pdf.addPage();
          const canvas = await html2canvas(pages[i], {
            scale: 3, // 300 DPI commercial print resolution
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#FFFFFF",
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123,
            onclone: (_clonedDoc, clonedElement) => {
              // Strip screen card decorations (shadows, rounded corners, borders) for crisp edge-to-edge PDF pages
              clonedElement.style.boxShadow = "none";
              clonedElement.style.border = "none";
              clonedElement.style.borderRadius = "0px";
              clonedElement.style.margin = "0px";
              clonedElement.style.width = "794px";
              clonedElement.style.minHeight = "1123px";
              clonedElement.style.height = "1123px";

              const noPrints = clonedElement.querySelectorAll<HTMLElement>(".no-print");
              noPrints.forEach((el) => {
                el.style.display = "none";
              });
            },
          });
          const imgData = canvas.toDataURL("image/png");
          pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
        }

        const filename = `${agreement.agreementNumber || "ABCD-Agreement"}_${(agreement.projectTitle || "Project").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        pdf.save(filename);

        toast.success(`High-resolution ${pages.length}-Page PDF downloaded successfully!`, { id: toastId });
      } catch (err: any) {
        console.error("PDF generation failed:", err);
        toast.error("Failed to generate PDF. Please try again.", { id: toastId });
      } finally {
        if (!isCancelled) onComplete();
      }
    };

    runDownload();

    return () => {
      isCancelled = true;
    };
  }, [mounted, agreement, agencyInfo, onComplete]);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: "-9999px",
        top: 0,
        width: "794px",
        zIndex: -9999,
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <AgreementDocumentPaper
        agreement={agreement}
        agencyInfo={agencyInfo}
        pagesRef={pagesRef}
      />
    </div>,
    document.body
  );
}

interface EditorProps {
  form: ProjectAgreementData;
  onChange: (updated: Partial<ProjectAgreementData>) => void;
  onBudgetOrPercentChange: (totalRaw: number, advPct: number, delPct: number, finPct: number) => void;
  agencyInfo?: typeof DEFAULT_CONTRACTOR_INFO;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

/**
 * Super Admin Direct Document Editor
 * Allows direct modification of agreement parameters, milestones, timelines, and legal terms.
 */
export function AgreementDocumentEditor({
  form,
  onChange,
  onBudgetOrPercentChange,
  agencyInfo = DEFAULT_CONTRACTOR_INFO,
  onSave,
  onCancel,
  isSaving,
}: EditorProps) {
  const formattedTotal = formatNumberToINR(form.totalAmountRaw);
  const formattedAdvance = formatNumberToINR(form.advanceAmountRaw);
  const formattedDelivery = formatNumberToINR(form.deliveryAmountRaw);
  const formattedFinal = formatNumberToINR(form.finalAmountRaw);

  const pctSum = Number(form.advancePercent || 0) + Number(form.deliveryPercent || 0) + Number(form.finalPercent || 0);
  const is100 = pctSum === 100;

  return (
    <div className="w-full max-w-[794px] bg-white text-[#0A0A0A] p-6 sm:p-10 shadow-sm border border-[#E5E5E5] dark:border-[#262626] font-sans flex flex-col text-left rounded-xl select-text space-y-6">
      {/* Top Banner inside Document Canvas */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#0A0A0A] pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#0A0A0A] text-white rounded">
              Super Admin Direct Edit
            </span>
            <span className="text-[10px] text-[#737373] font-mono">Statement of Work Parameters</span>
          </div>
          <h2 className="text-base font-bold text-[#0A0A0A] mt-1.5">
            Contract Agreement Editor
          </h2>
          <p className="text-[11px] text-[#525252]">
            Editing parameters for {form.projectTitle || "Project Deliverable"} • Independent Contractor: {agencyInfo.name}
          </p>
          {form.signedAt && (
            <div className="mt-2.5 px-3.5 py-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-[10.5px] text-[#0A0A0A] flex items-center gap-2">
              <span className="font-bold font-mono uppercase tracking-wider text-[8.5px] px-1.5 py-0.5 rounded bg-[#0A0A0A] text-white">Notice</span>
              <span className="text-[#525252]">Client has already executed this agreement. Saving changes will automatically record the amendment event and stamp the upgraded revision timestamp.</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-[#0A0A0A] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metadata Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#F9F9F9] rounded-lg border border-[#E5E5E5] text-xs">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
            Agreement Reference No.
          </label>
          <input
            type="text"
            value={form.agreementNumber}
            onChange={(e) => onChange({ agreementNumber: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#E5E5E5] rounded-md text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
            Contract Status
          </label>
          <select
            value={form.status}
            onChange={(e) => onChange({ status: e.target.value as any })}
            className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-[#E5E5E5] rounded-md text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] cursor-pointer"
          >
            <option value="Active">Active & Issued</option>
            <option value="Draft">Draft / Pending Review</option>
            <option value="Completed">Completed & Archived</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
            Client Account
          </label>
          <div className="px-2.5 py-1.5 text-xs font-medium bg-[#EFEFEF] border border-[#E5E5E5] rounded-md text-[#525252] truncate">
            {form.clientName || "Client Organization"}
          </div>
        </div>
      </div>

      {/* Section 1: Timelines & Deliverables */}
      <div className="space-y-3 border-t border-[#E5E5E5] pt-4 text-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
          1. Scope of Work & Schedule Milestones
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
              Commencement Date
            </label>
            <input
              type="text"
              placeholder="e.g. 2026-09-15 or Upon Signing"
              value={form.startDate || ""}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
              Target Delivery Date
            </label>
            <input
              type="text"
              placeholder="e.g. 2026-10-30"
              value={form.deliveryDate || ""}
              onChange={(e) => onChange({ deliveryDate: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
              Estimated Duration
            </label>
            <input
              type="text"
              placeholder="e.g. 4–6 Weeks"
              value={form.estimatedDuration || ""}
              onChange={(e) => onChange({ estimatedDuration: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Financial Consideration & Payment Schedule */}
      <div className="space-y-3 border-t border-[#E5E5E5] pt-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
            2. Financial Consideration & Milestone Split
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${is100 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
            {is100 ? "Percentages total 100% ✓" : `Sum: ${pctSum}% (Must equal 100%)`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
              Total Project Fee (INR ₹)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={form.totalAmountRaw}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value) || 0);
                onBudgetOrPercentChange(val, form.advancePercent, form.deliveryPercent, form.finalPercent);
              }}
              className="w-full px-3 py-2 text-sm font-bold font-mono bg-white border border-[#0A0A0A] rounded-md text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            />
            <span className="text-[10px] text-[#737373] block">Formatted: {formattedTotal}</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
              Payment Period (Days Post Signoff)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={form.paymentDueDays}
              onChange={(e) => onChange({ paymentDueDays: parseInt(e.target.value) || 7 })}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#E5E5E5] rounded-md text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            />
            <span className="text-[10px] text-[#737373] block">Net {form.paymentDueDays} calendar days terms</span>
          </div>
        </div>

        {/* Milestone Split Table */}
        <div className="border border-[#E5E5E5] rounded-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[10px] uppercase font-bold text-[#525252]">
              <tr>
                <th className="py-2.5 px-3">Milestone Deliverable</th>
                <th className="py-2.5 px-3 text-center w-24">Share (%)</th>
                <th className="py-2.5 px-3 text-center w-36">Calculated (INR)</th>
                <th className="py-2.5 px-3 text-right">Payment Terms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-xs">
              <tr>
                <td className="py-2 px-3 font-semibold text-[#0A0A0A]">
                  Milestone 1: Upfront Advance Deposit
                </td>
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.advancePercent}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        onBudgetOrPercentChange(form.totalAmountRaw, val, form.deliveryPercent, form.finalPercent);
                      }}
                      className="w-16 px-1.5 py-1 text-center font-mono font-bold border border-[#E5E5E5] rounded text-xs focus:ring-1 focus:ring-[#0A0A0A]"
                    />
                    <span>%</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-[#0A0A0A]">
                  {formattedAdvance}
                </td>
                <td className="py-2 px-3 text-right text-[11px] text-[#525252]">
                  Due upon contract execution
                </td>
              </tr>

              <tr>
                <td className="py-2 px-3 font-semibold text-[#0A0A0A]">
                  Milestone 2: Staging / Feature Delivery
                </td>
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.deliveryPercent}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        onBudgetOrPercentChange(form.totalAmountRaw, form.advancePercent, val, form.finalPercent);
                      }}
                      className="w-16 px-1.5 py-1 text-center font-mono font-bold border border-[#E5E5E5] rounded text-xs focus:ring-1 focus:ring-[#0A0A0A]"
                    />
                    <span>%</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-[#0A0A0A]">
                  {formattedDelivery}
                </td>
                <td className="py-2 px-3 text-right text-[11px] text-[#525252]">
                  Due upon staging demo
                </td>
              </tr>

              <tr>
                <td className="py-2 px-3 font-semibold text-[#0A0A0A]">
                  Milestone 3: Final Acceptance & Handover
                </td>
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.finalPercent}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        onBudgetOrPercentChange(form.totalAmountRaw, form.advancePercent, form.deliveryPercent, val);
                      }}
                      className="w-16 px-1.5 py-1 text-center font-mono font-bold border border-[#E5E5E5] rounded text-xs focus:ring-1 focus:ring-[#0A0A0A]"
                    />
                    <span>%</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-[#0A0A0A]">
                  {formattedFinal}
                </td>
                <td className="py-2 px-3 text-right text-[11px] text-[#525252]">
                  Net {form.paymentDueDays} days post-review
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Review & QA Inspection Window */}
      <div className="space-y-3 border-t border-[#E5E5E5] pt-4 text-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
          3. Review Window & Revision Rounds
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
              Review Window (Calendar Days)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={form.reviewWindowDays}
              onChange={(e) => onChange({ reviewWindowDays: parseInt(e.target.value) || 14 })}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#E5E5E5] rounded-md text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            />
            <span className="text-[10px] text-[#737373]">
              Default is 14 calendar days post-staging delivery
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
              Included Formal Revision Rounds
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={form.revisionRounds}
              onChange={(e) => onChange({ revisionRounds: parseInt(e.target.value) || 2 })}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#E5E5E5] rounded-md text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            />
            <span className="text-[10px] text-[#737373]">
              Default is 2 comprehensive feedback & revision sprints
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Terms & Policies */}
      <div className="space-y-2 border-t border-[#E5E5E5] pt-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
            4. Independent Contractor Terms of Engagement
          </h3>
          <button
            type="button"
            onClick={() => onChange({ termsAndPolicy: DEFAULT_AGREEMENT_TERMS })}
            className="text-[10px] font-medium text-[#737373] hover:text-[#0A0A0A] underline cursor-pointer"
          >
            Reset to Standard Freelance Clauses
          </button>
        </div>
        <textarea
          rows={8}
          value={form.termsAndPolicy || ""}
          onChange={(e) => onChange({ termsAndPolicy: e.target.value })}
          className="w-full p-3 text-[11px] font-mono leading-relaxed bg-[#FAFAFA] border border-[#E5E5E5] rounded-md text-[#262626] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] resize-y"
          placeholder="Enter legal terms and governing clauses..."
        />
      </div>

      {/* Section 5: Custom Notes or Stipulations */}
      <div className="space-y-2 border-t border-[#E5E5E5] pt-4 text-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
          5. Custom Stipulations & Client Notes (Optional)
        </h3>
        <textarea
          rows={3}
          value={form.notes || ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          className="w-full p-3 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#262626] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] resize-y"
          placeholder="Any custom commercial terms, extra milestones, or specific arrangements..."
        />
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#E5E5E5]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-xs font-medium rounded-lg border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-[#0A0A0A] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Update Document</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface ProjectAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: ProjectAgreementData;
  agencyInfo?: typeof DEFAULT_CONTRACTOR_INFO;
  canEdit?: boolean;
  canSign?: boolean;
  onSave?: (updated: ProjectAgreementData) => void;
}

/**
 * Preview Modal with White Padding in Light Mode and Black Padding in Dark Mode
 * Includes Super Admin direct document editing controls at the top.
 */
export function ProjectAgreementModal({
  isOpen,
  onClose,
  agreement: initialAgreement,
  agencyInfo = DEFAULT_CONTRACTOR_INFO,
  canEdit = false,
  canSign = true,
  onSave,
}: ProjectAgreementModalProps) {
  const [mounted, setMounted] = useState(false);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Agreement data & editing state
  const [currentAgreement, setCurrentAgreement] = useState<ProjectAgreementData>(initialAgreement);
  const [editForm, setEditForm] = useState<ProjectAgreementData>(initialAgreement);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [generatingMilestone, setGeneratingMilestone] = useState<number | null>(null);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  const modalHistoryList = parseConfirmationHistory(currentAgreement.confirmationHistory);
  const modalInitialExecutionEvent = modalHistoryList.find((e) => e.event === "INITIAL_EXECUTION");
  const modalReconfirmationEvents = modalHistoryList.filter((e) => e.event === "AMENDMENT_RECONFIRMATION");
  const modalLatestReconfirmation = modalReconfirmationEvents.length > 0 ? modalReconfirmationEvents[modalReconfirmationEvents.length - 1] : null;

  const modalInitialSignedDate = currentAgreement.originalSignedAt || modalInitialExecutionEvent?.timestamp || currentAgreement.signedAt;
  const modalInitialSignedIp = currentAgreement.originalSignedIp || modalInitialExecutionEvent?.ip || currentAgreement.signedIp;
  const modalInitialAuditHash = currentAgreement.originalAuditHash || modalInitialExecutionEvent?.auditHash || currentAgreement.signedAuditHash;

  const isModalAmended = Boolean(
    modalInitialSignedDate &&
    currentAgreement.updatedAt &&
    new Date(currentAgreement.updatedAt).getTime() > new Date(modalInitialSignedDate).getTime() + 5000
  );

  const modalHasReconfirmed = Boolean(
    isModalAmended &&
    modalLatestReconfirmation &&
    new Date(modalLatestReconfirmation.timestamp).getTime() >= (currentAgreement.updatedAt ? new Date(currentAgreement.updatedAt).getTime() - 5000 : 0)
  );

  const isModalPendingReconfirmation = isModalAmended && !modalHasReconfirmed;

  useEffect(() => {
    setCurrentAgreement(initialAgreement);
    setEditForm(initialAgreement);
  }, [initialAgreement]);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Recalculate financial breakdown live
  const handleBudgetOrPercentChange = (
    totalRaw: number,
    advPct: number,
    delPct: number,
    finPct: number
  ) => {
    const fin = calculateAgreementFinancials(
      totalRaw,
      advPct,
      delPct,
      finPct,
      editForm.paymentDueDays || 7
    );
    setEditForm((prev) => ({
      ...prev,
      totalAmountRaw: fin.totalAmountRaw,
      advancePercent: fin.advancePercent,
      advanceAmountRaw: fin.advanceAmountRaw,
      deliveryPercent: fin.deliveryPercent,
      deliveryAmountRaw: fin.deliveryAmountRaw,
      finalPercent: fin.finalPercent,
      finalAmountRaw: fin.finalAmountRaw,
    }));
  };

  // Save Agreement Changes
  const handleSaveAgreement = async () => {
    if (!editForm.projectId) {
      toast.error("Missing Project ID");
      return;
    }

    const pctSum = Number(editForm.advancePercent) + Number(editForm.deliveryPercent) + Number(editForm.finalPercent);
    if (pctSum !== 100) {
      toast.error(`Milestone percentages must total 100% (currently ${pctSum}%)`);
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving agreement document updates...");

    try {
      const res = await updateProjectAgreement({
        projectId: editForm.projectId,
        agreementNumber: editForm.agreementNumber,
        status: editForm.status,
        startDate: editForm.startDate,
        deliveryDate: editForm.deliveryDate,
        estimatedDuration: editForm.estimatedDuration,
        totalAmountRaw: editForm.totalAmountRaw,
        advancePercent: editForm.advancePercent,
        deliveryPercent: editForm.deliveryPercent,
        finalPercent: editForm.finalPercent,
        paymentDueDays: editForm.paymentDueDays,
        reviewWindowDays: editForm.reviewWindowDays,
        revisionRounds: editForm.revisionRounds,
        termsAndPolicy: editForm.termsAndPolicy,
        notes: editForm.notes,
      });

      if (res.success && res.agreement) {
        toast.success("Agreement document updated successfully!", { id: toastId });
        setCurrentAgreement(res.agreement);
        setEditForm(res.agreement);
        setIsEditing(false);
        onSave?.(res.agreement);
      } else {
        toast.error(res.error || "Failed to update agreement", { id: toastId });
      }
    } catch (err: any) {
      console.error("Save agreement error:", err);
      toast.error(err.message || "An unexpected error occurred", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Sign & Accept Agreement
  const handleSignAgreement = async (signData: {
    signatureType: "DRAW" | "TYPE";
    signatureData: string;
    legalName: string;
    jobTitle: string;
  }) => {
    const toastId = toast.loading("Executing and cryptographically stamping agreement...");
    try {
      const res = await signProjectAgreement({
        projectId: currentAgreement.projectId,
        ...signData,
      });

      if (res.success && res.agreement) {
        toast.success("Statement of Work executed successfully! Confirmation email dispatched.", { id: toastId });
        setCurrentAgreement(res.agreement);
        setEditForm(res.agreement);
        onSave?.(res.agreement);
      } else {
        toast.error(res.error || "Failed to sign agreement", { id: toastId });
      }
    } catch (err: any) {
      console.error("Signature execution failed:", err);
      toast.error(err?.message || "Failed to sign agreement", { id: toastId });
    }
  };

  // 1-Click Milestone Invoice Generation (Admin Mode)
  const handleGenerateMilestoneInvoice = async (milestoneNumber: 1 | 2 | 3) => {
    setGeneratingMilestone(milestoneNumber);
    const toastId = toast.loading(`Generating invoice for Milestone ${milestoneNumber}...`);
    try {
      const res = await generateMilestoneInvoice({
        projectId: currentAgreement.projectId,
        milestoneNumber,
      });

      if (res.success) {
        toast.success(res.message || "Invoice generated successfully in Finance Ledger!", { id: toastId });
      } else {
        toast.error(res.error || "Failed to generate invoice", { id: toastId });
      }
    } catch (err: any) {
      console.error("Milestone invoice error:", err);
      toast.error(err?.message || "Failed to generate milestone invoice", { id: toastId });
    } finally {
      setGeneratingMilestone(null);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const toastId = toast.loading("Generating high-resolution Agreement PDF...");

    try {
      const termsText = currentAgreement.termsAndPolicy || DEFAULT_AGREEMENT_TERMS;
      const termsPages = paginateTerms(termsText, Boolean(currentAgreement.notes));
      const expectedTotalPages = 1 + termsPages.length;

      const pages = (pagesRef.current || []).slice(0, expectedTotalPages).filter(Boolean) as HTMLDivElement[];
      if (pages.length === 0) {
        toast.error("Document pages not ready for export. Please try again.", { id: toastId });
        return;
      }

      await Promise.all(pages.map((p) => ensureImagesLoaded(p)));

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        const canvas = await html2canvas(pages[i], {
          scale: 3, // 300 DPI commercial print resolution
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#FFFFFF",
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0,
          width: 794,
          height: 1123,
          windowWidth: 794,
          windowHeight: 1123,
          onclone: (_clonedDoc, clonedElement) => {
            // Strip screen card decorations (shadows, rounded corners, borders) for crisp edge-to-edge PDF pages
            clonedElement.style.boxShadow = "none";
            clonedElement.style.border = "none";
            clonedElement.style.borderRadius = "0px";
            clonedElement.style.margin = "0px";
            clonedElement.style.width = "794px";
            clonedElement.style.minHeight = "1123px";
            clonedElement.style.height = "1123px";

            const noPrints = clonedElement.querySelectorAll<HTMLElement>(".no-print");
            noPrints.forEach((el) => {
              el.style.display = "none";
            });
          },
        });
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
      }

      const filename = `${currentAgreement.agreementNumber || "ABCD-Agreement"}_${(currentAgreement.projectTitle || "Project").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      pdf.save(filename);

      toast.success(`High-resolution ${pages.length}-Page PDF downloaded successfully!`, { id: toastId });
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          .agreement-print-container,
          .agreement-print-container * {
            visibility: visible !important;
          }
          .agreement-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            z-index: 99999 !important;
          }
          .agreement-page-card {
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            min-height: 100vh !important;
            padding: 12mm 15mm !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && !isEditing) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto"
      >
      {/* Outer Modal Container with Light/Dark Mode Palette */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#262626] rounded-xl shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="px-5 py-3 border-b border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111] flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0 pr-1">
            <div className="w-7 h-7 rounded-md bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white tracking-tight truncate">
                  {isEditing ? "Edit Agreement Document" : "Independent Contractor Agreement & SOW"}
                </h3>
                {isEditing && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    Live Edit
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-[#737373] dark:text-neutral-400 truncate">
                {currentAgreement.agreementNumber} • {currentAgreement.projectTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Sign CTA if unsigned */}
            {!isEditing && !currentAgreement.signedAt && canSign && (
              <button
                type="button"
                onClick={() => setIsSignModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 transition-opacity cursor-pointer shadow-xs no-print whitespace-nowrap"
                title="Sign & Legally Accept Agreement"
              >
                <PenTool className="w-3.5 h-3.5 shrink-0" />
                <span>Sign</span>
              </button>
            )}

            {/* Direct Re-Confirm CTA if amended after signing */}
            {!isEditing && isModalPendingReconfirmation && canSign && (
              <button
                type="button"
                onClick={() => setIsSignModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 transition-opacity cursor-pointer shadow-xs no-print whitespace-nowrap"
                title="Re-Confirm & Accept Amended Agreement"
              >
                <PenTool className="w-3.5 h-3.5 shrink-0" />
                <span>Re-Confirm</span>
              </button>
            )}

            {/* Execution / Re-Confirmation Badge */}
            {!isEditing && currentAgreement.signedAt && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md whitespace-nowrap shrink-0 border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] text-[#0A0A0A] dark:text-white">
                {isModalPendingReconfirmation ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse shrink-0"></span>
                    <span>AMENDMENT PENDING</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                    <span>{modalHasReconfirmed ? "RE-CONFIRMED" : "EXECUTED"}</span>
                  </>
                )}
              </div>
            )}

            {/* Confirmation Audit History Toggle */}
            {!isEditing && (currentAgreement.signedAt || modalHistoryList.length > 0) && (
              <button
                type="button"
                onClick={() => setShowAuditTrail(!showAuditTrail)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                  showAuditTrail
                    ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border-[#0A0A0A]"
                    : "border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-neutral-300 hover:text-[#0A0A0A] dark:hover:text-white"
                }`}
                title="Inspect Historical Confirmation & Tamper-Proof Audit Trail"
              >
                <History className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Audit Trail</span>
              </button>
            )}

            {/* Super Admin Direct Edit Button */}
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={() => {
                  setEditForm(currentAgreement);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[#0A0A0A] dark:border-white text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                title="Edit Agreement Details Directly"
              >
                <Edit3 className="w-3.5 h-3.5 shrink-0" />
                <span>Edit</span>
              </button>
            )}

            {/* Editing Action Buttons */}
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditForm(currentAgreement);
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-neutral-300 hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAgreement}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 transition-opacity cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 shrink-0" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </>
            )}

            {/* Download PDF (when not editing) */}
            {!isEditing && (
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 transition-opacity cursor-pointer shadow-xs disabled:opacity-50 no-print whitespace-nowrap"
                title="Download Agreement PDF"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>Download</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Confirmation Audit Trail Panel */}
        {showAuditTrail && (
          <div className="px-5 py-3.5 bg-[#F9F9F9] dark:bg-[#151515] border-b border-[#E5E5E5] dark:border-[#262626] text-xs shrink-0 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                <span className="font-bold text-[#0A0A0A] dark:text-white">
                  Tamper-Evident Confirmation History (Section 65B Audit Ledger)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditTrail(false)}
                className="text-[11px] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white cursor-pointer"
              >
                Hide
              </button>
            </div>

            <div className="space-y-2">
              {modalHistoryList.length > 0 ? (
                modalHistoryList.map((evt, idx) => (
                  <div
                    key={evt.id || idx}
                    className="p-2.5 bg-white dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#2A2A2A] rounded-md font-mono text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            evt.event === "INITIAL_EXECUTION"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : evt.event === "SUPER_ADMIN_AMENDMENT"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          }`}
                        >
                          {evt.event === "INITIAL_EXECUTION"
                            ? "Initial Execution"
                            : evt.event === "SUPER_ADMIN_AMENDMENT"
                            ? "Super Admin Amendment"
                            : "Amendment Re-Confirmation"}
                        </span>
                        {evt.signerName && (
                          <span className="font-bold text-[#0A0A0A] dark:text-white">
                            {evt.signerName} ({evt.signerTitle || "Signatory"})
                          </span>
                        )}
                        {evt.adminName && (
                          <span className="font-bold text-[#0A0A0A] dark:text-white">
                            {evt.adminName}
                          </span>
                        )}
                      </div>
                      <span className="text-[#737373] text-[10.5px]">
                        {evt.formattedTimeIST || formatISTDateTime(evt.timestamp)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[#525252] dark:text-neutral-400 text-[10px]">
                      {evt.ip && <span>Client IP: <strong className="text-[#0A0A0A] dark:text-white">{evt.ip}</strong></span>}
                      {evt.signerEmail && <span>Email: {evt.signerEmail}</span>}
                      {evt.adminEmail && <span>Admin Email: {evt.adminEmail}</span>}
                      {evt.signatureType && <span>Method: {evt.signatureType}</span>}
                    </div>

                    {evt.auditHash && (
                      <div className="text-[9.5px] text-[#737373] truncate" title={evt.auditHash}>
                        SHA-256 Seal: {evt.auditHash}
                      </div>
                    )}
                    {evt.userAgent && (
                      <div className="text-[9px] text-[#737373] truncate" title={evt.userAgent}>
                        Agent: {evt.userAgent}
                      </div>
                    )}
                  </div>
                ))
              ) : currentAgreement.signedAt ? (
                <div className="p-2.5 bg-white dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#2A2A2A] rounded-md font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      Initial Execution
                    </span>
                    <span className="text-[#737373]">
                      {formatISTDateTime(modalInitialSignedDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[#525252] dark:text-neutral-400 text-[10px]">
                    <span>Signatory: {currentAgreement.signedByName || "Client"}</span>
                    <span>IP: {modalInitialSignedIp || "Verified"}</span>
                  </div>
                  {modalInitialAuditHash && (
                    <div className="text-[9.5px] text-[#737373] truncate">
                      SHA-256 Seal: {modalInitialAuditHash}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[#737373] italic">No execution events recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Document Preview / Edit Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white dark:bg-[#000000] flex flex-col items-center">
          {/* Super Admin Direct Edit Top Banner on Document Section */}
          {canEdit && !isEditing && (
            <div className="w-full max-w-[794px] mb-4 flex items-center justify-between px-4 py-2.5 bg-[#F9F9F9] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-[#0A0A0A] dark:text-white">Super Admin Control:</span>
                <span className="text-[#737373] dark:text-neutral-400 hidden sm:inline">Direct editing enabled for SOW deliverables, timelines, milestones & legal clauses.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditForm(currentAgreement);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 font-bold text-xs bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] rounded-md hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          )}

          {isEditing ? (
            <AgreementDocumentEditor
              form={editForm}
              onChange={(updated) => setEditForm((prev) => ({ ...prev, ...updated }))}
              onBudgetOrPercentChange={handleBudgetOrPercentChange}
              agencyInfo={agencyInfo}
              onSave={handleSaveAgreement}
              onCancel={() => {
                setEditForm(currentAgreement);
                setIsEditing(false);
              }}
              isSaving={isSaving}
            />
          ) : (
            <div className="w-full flex justify-center overflow-x-auto pb-6">
              <AgreementDocumentPaper
                agreement={currentAgreement}
                agencyInfo={agencyInfo}
                page1Ref={page1Ref}
                page2Ref={page2Ref}
                pagesRef={pagesRef}
                onOpenSignModal={canSign && (!currentAgreement.signedAt || isModalPendingReconfirmation) ? () => setIsSignModalOpen(true) : undefined}
                onGenerateInvoice={canEdit ? handleGenerateMilestoneInvoice : undefined}
                generatingMilestone={generatingMilestone}
              />
            </div>
          )}
        </div>

        {/* Interactive Signature Modal */}
        <SignatureCanvasModal
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          onSign={handleSignAgreement}
          defaultName={currentAgreement.signedByName || currentAgreement.clientContactPerson || currentAgreement.clientName}
          defaultTitle={currentAgreement.signedByTitle || "Authorized Signatory"}
          projectTitle={currentAgreement.projectTitle}
          agreementNumber={currentAgreement.agreementNumber}
          isAmendment={isModalPendingReconfirmation}
        />

      </div>
    </div>
    </>,
    document.body
  );
}
