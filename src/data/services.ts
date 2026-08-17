export interface ServiceDetail {
  slug: string;
  title: string;
  shortDesc: string;
  heroDesc: string;
  deliverables: string[];
  technologies: string[];
  processSteps: string[];
  faq: { q: string; a: string }[];
}

export const servicesData: ServiceDetail[] = [
  {
    slug: "web-development",
    title: "Web & SaaS Engineering",
    shortDesc: "Production-ready web applications built on Next.js 15, TypeScript, and serverless databases.",
    heroDesc:
      "We architect scalable, high-velocity web platforms and multi-tenant SaaS systems engineered for sub-second responses and flawless reliability.",
    deliverables: [
      "Next.js App Router full-stack web platforms",
      "Multi-tenant SaaS architectures & metering",
      "Serverless PostgreSQL & Prisma data layers",
      "Authentication & role-based access controls",
      "Automated CI/CD deployment pipelines",
    ],
    technologies: ["Next.js 15", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS", "Neon Serverless"],
    processSteps: [
      "Technical Architecture & Database Schema Design",
      "Core API, Auth & Component Implementation",
      "Security Auditing & Load Testing",
      "Zero-Downtime Deployment & Handover",
    ],
    faq: [
      {
        q: "What is your typical delivery timeframe for a web application?",
        a: "A focused MVP is typically delivered in 2–4 weeks, while complex multi-tenant SaaS platforms range from 4–8 weeks depending on scope.",
      },
      {
        q: "Do we get full ownership of the source code?",
        a: "Yes, 100%. All GitHub repositories, database schemas, and assets are transferred directly to your organization upon project completion.",
      },
    ],
  },
  {
    slug: "consulting",
    title: "Business Digitalization & Portals",
    shortDesc: "Transform manual spreadsheets and fragmented tools into custom internal software workflows.",
    heroDesc:
      "Modernize legacy business processes with bespoke ERP systems, student/employee portals, and automated digital operations.",
    deliverables: [
      "Custom ERP & internal operations portals",
      "Document, invoice & verification workflows",
      "Legacy database migration & synchronization",
      "Role-based staff management dashboards",
    ],
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Resend", "Cloudinary"],
    processSteps: [
      "Operational Audit & Workflow Mapping",
      "Database Modeling & Migration Strategy",
      "Portal Development & Security Hardening",
      "Staff Onboarding & Training",
    ],
    faq: [
      {
        q: "Can you migrate data from our existing spreadsheets or legacy systems?",
        a: "Yes. We write custom data extraction and sanitization scripts to seamlessly import your historical records into the new relational database.",
      },
    ],
  },
  {
    slug: "ui-ux",
    title: "UI/UX & Design Systems",
    shortDesc: "High-converting digital interfaces and comprehensive design systems built for speed.",
    heroDesc:
      "We design minimal, intuitive user interfaces that eliminate cognitive friction, maximize conversion rates, and translate seamlessly into clean code.",
    deliverables: [
      "Full Figma design systems & component libraries",
      "User journey mapping & high-fidelity prototypes",
      "Accessible (WCAG) and mobile-first UX specifications",
      "Direct Figma-to-Tailwind CSS component implementation",
    ],
    technologies: ["Figma", "Tailwind CSS", "TypeScript", "Geist Typography"],
    processSteps: [
      "Competitor Research & User Journey Mapping",
      "Wireframing & Low-Fidelity Prototyping",
      "High-Fidelity Component System Design",
      "Interactive Prototype Validation & Code Handover",
    ],
    faq: [
      {
        q: "Do you supply both Figma files and frontend code?",
        a: "Yes. We provide complete, structured Figma libraries alongside production-ready Tailwind CSS / React components.",
      },
    ],
  },
  {
    slug: "ai-integration",
    title: "AI Integration & Automation",
    shortDesc: "Practical LLM pipelines, autonomous agent workflows, and smart integrations with Google Gemini & Groq.",
    heroDesc:
      "Integrate intelligence directly into your product workflows: automated lead qualification, document intelligence, and smart retrieval systems.",
    deliverables: [
      "Google Gemini 2.5 and Groq LLM integration",
      "Autonomous lead parsing & qualification pipelines",
      "Document extraction & structured JSON ingestion",
      "Vector search & semantic retrieval systems",
    ],
    technologies: ["Google Gemini", "Groq AI", "Vercel AI SDK", "TypeScript", "Next.js"],
    processSteps: [
      "AI Feasibility & Prompt Engineering Architecture",
      "API Pipeline & Streaming Integration",
      "Guardrails, Error Handling & Fallback Design",
      "Production Deployment & Token Cost Optimization",
    ],
    faq: [
      {
        q: "How do you control AI token usage and inference latency?",
        a: "We deploy fast, cost-efficient models (e.g. Gemini 2.5 Flash / Groq) with structured output caching to keep latency low and costs predictable.",
      },
    ],
  },
];
