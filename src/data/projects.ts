export interface ProjectData {
  slug: string;
  title: string;
  client: string;
  category: string;
  summary: string;
  tagline: string;
  impact: string;
  timeline: string;
  techStack: string[];
  problem: string;
  solution: string;
  results: string[];
  features: string[];
}

export const projectsData: ProjectData[] = [
  {
    slug: "rgycsp-portal",
    title: "RGYCSP National Education & Student ERP",
    client: "Rajiv Gandhi Youth Computer Saksharta Program",
    category: "Full-Stack Web App & ERP",
    summary:
      "A complete digital management platform for admissions, fee workflows, center branch management, and instant digital diploma verification across 50+ centers.",
    tagline: "40% increase in student admissions & verification speed",
    impact: "+40% Admissions Rate",
    timeline: "6 Weeks (End-to-End)",
    techStack: ["Next.js 15", "TypeScript", "PostgreSQL", "Prisma ORM", "Auth.js", "Tailwind CSS"],
    problem:
      "RGYCSP previously relied on physical paperwork, manual spreadsheets, and offline certification processing across dozens of regional branch centers. This caused severe verification backlogs, lost student records, and slow branch fee reconciliations.",
    solution:
      "We engineered a centralized, role-based Next.js web portal with instant QR-code diploma verification, automated student enrollment workflows, real-time center revenue tracking, and automated transactional emails for student status updates.",
    results: [
      "Over 40% increase in student admission velocity across active centers.",
      "Instant 0-second certificate verification with tamper-proof QR validation.",
      "100% elimination of lost student paper records and reconciliation discrepancies.",
      "99.98% system uptime during peak examination registration cycles.",
    ],
    features: [
      "Role-Based Access Control (Super Admin, Center Admin, Student)",
      "Automated Certificate & Marksheet PDF Generation",
      "Real-Time Center Financial Accounting & Invoicing",
      "Instant Public Verification Registry",
    ],
  },
  {
    slug: "apexflow-saas",
    title: "ApexFlow Real-Time SaaS Analytics Dashboard",
    client: "ApexFlow Technologies",
    category: "SaaS Product & Dashboard",
    summary:
      "High-throughput multi-tenant SaaS dashboard for tracking real-time operations, subscription metering, and cloud telemetry.",
    tagline: "Sub-50ms analytics query latency across 100k daily events",
    impact: "<50ms Query Latency",
    timeline: "4 Weeks (MVP to Production)",
    techStack: ["Next.js 15", "TypeScript", "Neon DB", "Prisma ORM", "Tailwind CSS", "Vercel AI"],
    problem:
      "ApexFlow needed to process and visualize large volumes of high-velocity telemetry streams for their B2B clients without crashing or incurring huge cloud database egress bills.",
    solution:
      "We architected an event-driven telemetry ingest pipeline and an ultra-fast Server Component dashboard using Neon Serverless Postgres connection pooling, aggressive data caching, and optimized SQL aggregate queries.",
    results: [
      "Reduced dashboard query latency from 850ms down to under 50ms.",
      "Successfully scaled to 100,000+ daily telemetry events with zero cold-start delay.",
      "Cut client cloud database infrastructure expenses by 60%.",
    ],
    features: [
      "Live Metric Streaming & Aggregation",
      "Multi-Tenant Isolation & Workspace Management",
      "Usage-Based Billing Calculation & Invoicing",
      "Customizable Alerting & Webhooks",
    ],
  },
  {
    slug: "nexus-ai-engine",
    title: "Nexus Autonomous Lead & Workflow Automation",
    client: "Nexus Enterprise Consulting",
    category: "AI & Workflow Automation",
    summary:
      "Autonomous lead scoring and routing system built on Google Gemini 2.5 and automated transactional email workflows.",
    tagline: "85% reduction in manual customer qualification time",
    impact: "85% Time Saved",
    timeline: "3 Weeks",
    techStack: ["Google Gemini 2.5", "Next.js 15", "TypeScript", "Resend", "Cloudinary", "Prisma"],
    problem:
      "Sales leads coming through enterprise channels took 36–48 hours to be reviewed and assigned manually, leading to poor conversion rates and delayed discovery calls.",
    solution:
      "We built an automated AI triage pipeline powered by Google Gemini 2.5 that parses inbound proposals, extracts technical requirements, qualifies intent, and dispatches personalized briefing documents and calendar invites via Resend.",
    results: [
      "Inbound lead qualification time plummeted from 48 hours to under 30 seconds.",
      "Sales call booking rate increased by 55% within the first month.",
      "Saved 20+ hours per week of manual data entry for the sales engineering team.",
    ],
    features: [
      "Semantic Proposal Parsing & Intent Scoring",
      "Automated Custom Briefing PDF Generation",
      "Smart Calendar & Meeting Dispatching",
      "CRM Sync with Two-Way Webhooks",
    ],
  },
];
