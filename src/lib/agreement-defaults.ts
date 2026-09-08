import { parseCurrencyToNumber, formatNumberToINR } from "./sync-financials";

export interface AgreementFinancials {
  totalAmountRaw: number;
  advancePercent: number;
  advanceAmountRaw: number;
  deliveryPercent: number;
  deliveryAmountRaw: number;
  finalPercent: number;
  finalAmountRaw: number;
  paymentDueDays: number;
}

export interface ProjectAgreementData {
  id?: string;
  projectId: string;
  agreementNumber: string;
  status: "Active" | "Draft" | "Completed";
  
  // Timeline
  startDate: string;
  deliveryDate: string;
  estimatedDuration: string;
  
  // Financials
  totalAmountRaw: number;
  advancePercent: number;
  advanceAmountRaw: number;
  deliveryPercent: number;
  deliveryAmountRaw: number;
  finalPercent: number;
  finalAmountRaw: number;
  paymentDueDays: number;
  
  // Review & Revisions
  reviewWindowDays: number;
  revisionRounds: number;
  
  // Terms & Notes
  termsAndPolicy: string;
  notes?: string;
  
  issuedAt?: string | Date;
  updatedAt?: string | Date | null;
  
  // Digital Signature & Audit Trail (IT Act, 2000 compliant)
  signedAt?: string | Date | null;
  signedByName?: string | null;
  signedByEmail?: string | null;
  signedByTitle?: string | null;
  signedIp?: string | null;
  signedUserAgent?: string | null;
  signatureType?: "DRAW" | "TYPE" | null;
  clientSignature?: string | null;
  contractorSignedAt?: string | Date | null;
  contractorSignature?: string | null;
  signedAuditHash?: string | null;

  // Complete Confirmation History & Non-Repudiation (IT Act 2000 § 10A & IEA § 65B)
  originalSignedAt?: string | Date | null;
  originalSignedIp?: string | null;
  originalAuditHash?: string | null;
  confirmationHistory?: string | ConfirmationEvent[] | null;

  // Associated Project & Client info
  projectTitle?: string;
  projectCategory?: string;
  projectSummary?: string;
  clientName?: string;
  clientContactPerson?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientLocation?: string;
}

export interface ConfirmationEvent {
  id: string;
  event: "INITIAL_EXECUTION" | "SUPER_ADMIN_AMENDMENT" | "AMENDMENT_RECONFIRMATION";
  timestamp: string; // ISO 8601
  formattedTimeIST: string; // Human-readable IST
  ip?: string;
  userAgent?: string;
  signerName?: string;
  signerTitle?: string;
  signerEmail?: string;
  signatureType?: "DRAW" | "TYPE";
  auditHash?: string;
  adminName?: string;
  adminEmail?: string;
  notes?: string;
}

export function formatISTDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return (
    d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }) + " IST"
  );
}

export function parseConfirmationHistory(
  raw: string | ConfirmationEvent[] | null | undefined
): ConfirmationEvent[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


export function calculateAgreementFinancials(
  budgetRaw: number,
  advancePercent = 40,
  deliveryPercent = 40,
  finalPercent = 20,
  paymentDueDays = 7
): AgreementFinancials {
  const advanceAmountRaw = Math.round((budgetRaw * advancePercent) / 100);
  const deliveryAmountRaw = Math.round((budgetRaw * deliveryPercent) / 100);
  const finalAmountRaw = Math.max(0, budgetRaw - advanceAmountRaw - deliveryAmountRaw);

  return {
    totalAmountRaw: budgetRaw,
    advancePercent,
    advanceAmountRaw,
    deliveryPercent,
    deliveryAmountRaw,
    finalPercent,
    finalAmountRaw,
    paymentDueDays,
  };
}

export function generateAgreementNumber(projectIndex?: number, slug?: string): string {
  const currentYear = new Date().getFullYear();
  if (slug) {
    const cleanSlug = slug.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    return `ABCD-AGR-${currentYear}-${cleanSlug}`;
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ABCD-AGR-${currentYear}-${randomSuffix}`;
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

export const DEFAULT_AGREEMENT_TERMS = `
1. INDEPENDENT CONTRACTOR ENGAGEMENT & SCOPE
The Client formally engages Suman Baidya, operating professionally under the brand name ABCD Agency ("Independent Contractor / Consultant"), to provide the bespoke software engineering, system architecture, UI/UX design, and digital consulting deliverables set forth in Section 1 (Scope of Work & Deliverables). Nothing herein shall be construed as creating an employment relationship, partnership, or corporate entity between the parties.

2. SCOPE OF DELIVERABLES & CHANGE ORDERS
Work is executed in strict adherence to the agreed technical deliverables and milestones. Any additional features, scope expansion, third-party integrations, or functional changes requested outside this Statement of Work shall be quoted and scheduled as a supplementary Change Order.

3. FINANCIAL CONSIDERATIONS & PAYMENT SCHEDULE
- Upfront Advance Deposit (Milestone 1): Due immediately upon execution of this SOW to schedule resources and commence development sprints.
- Staging / Demo Delivery (Milestone 2): Due upon functional deployment of the agreed features on the staging server for client review.
- Final Settlement Balance (Milestone 3): Due within the Net payment period following formal sign-off and completion of the Client Review Window.
All amounts are quoted in Indian National Rupees (INR) unless explicitly documented otherwise.

4. CLIENT REVIEW, INSPECTION & ACCEPTANCE PERIOD
The Client is granted an official inspection and testing period of fourteen (14) calendar days following milestone/staging delivery. During this period, the Client may submit documented bug reports, feedback, and technical adjustments within the agreed project scope. Failure to provide documented feedback or written notification within the 14-day Review Window shall legally constitute formal technical sign-off and complete acceptance.

5. INTELLECTUAL PROPERTY & CODE TRANSFER
Upon 100% receipt and full clearance of all project fees and invoices, full legal ownership of the bespoke source code, database schemas, and digital assets created specifically for this project shall irrevocably transfer to the Client. The Contractor retains all rights to proprietary reusable utilities, developer tools, and generic foundational frameworks.

6. CONFIDENTIALITY & DATA PROTECTION
Both parties mutually covenant to maintain strict confidentiality regarding all proprietary business data, trade secrets, software code, customer information, and financial records exchanged during the project lifecycle.

7. REVISIONS & QUALITY ASSURANCE
The project includes two (2) consolidated rounds of feedback, functional refinements, and QA adjustments within the original scope. Revisions exceeding the included rounds or requesting architectural changes outside the SOW will be billed at standard freelance hourly/sprint rates.

8. LIMITATION OF LIABILITY
Services are delivered in accordance with industry best practices. To the maximum extent permitted by applicable law, the Contractor's aggregate legal liability arising out of this engagement shall not exceed the total fees actually received by the Contractor from the Client under this Statement of Work.

9. TERMINATION & CANCELLATION
Either party may terminate this agreement upon fourteen (14) days written notice. In the event of termination, the Client remains liable for all work completed, milestones achieved, and expenses incurred up to the effective termination date.

10. GOVERNING LAW, AMENDMENTS & ARBITRATION
This Agreement is executed pursuant to the Indian Contract Act, 1872 and the Information Technology Act, 2000. The parties explicitly agree that digital, electronic, or typed signatures executed through the platform constitute legally valid, authentic, and admissible electronic records under Section 10A of the IT Act, 2000 and Section 65B of the Indian Evidence Act, 1872 (or Bharatiya Sakshya Adhiniyam, 2023). Any subsequent written addendum, scope adjustment, or revision communicated electronically or acknowledged in the Client Portal shall form an integral part of this contract. Any disputes arising out of this engagement shall first be subject to good-faith mutual negotiation for fourteen (14) days, failing which they shall be referred to sole arbitration under the Arbitration and Conciliation Act, 1996, with exclusive legal jurisdiction vested in West Bengal, India.
`.trim();
