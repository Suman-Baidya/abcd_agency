export interface ServiceDetail {
  slug: string;
  title: string;
  shortDesc: string;
  heroDesc: string;
  bodyDesc: string;
  deliverables: string[];
  technologies: string[];
  processSteps: string[];
  faq: { q: string; a: string }[];
  image: string;
}

export const servicesData: ServiceDetail[] = [
  {
    slug: "web-development",
    title: "Custom Web & Software Development",
    image: "https://cdn.pixabay.com/photo/2017/08/10/08/47/laptop-2620118_1280.jpg",
    shortDesc: "Production-ready web applications built on Next.js 15, TypeScript, and serverless databases.",
    heroDesc:
      "We architect scalable, high-velocity web platforms and multi-tenant SaaS systems engineered for sub-second responses and flawless reliability.",
    bodyDesc:
      "From a single-feature MVP to a fully multi-tenanted SaaS platform, we handle every layer of the stack. Our engineering process defaults to Next.js 15 App Router, serverless PostgreSQL (Neon), and TypeScript strict mode so every line of code we ship is maintainable, type-safe, and ready to scale on day one. We design systems — proper separation of concerns, robust error boundaries, Prisma migrations with zero-downtime deploys, and automated CI pipelines before your product ever reaches a real user.",
    deliverables: [
      "Next.js App Router full-stack web apps",
      "Multi-tenant SaaS architecture & billing",
      "Serverless PostgreSQL & Prisma data layers",
      "Authentication, roles & access control",
      "Security & compliance hardening",
      "Performance optimization & scalability engineering",
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
        a: "A focused MVP is typically delivered in 2–4 weeks, while complex multi-tenant SaaS platforms range from 4–8 weeks depending on scope and integration complexity.",
      },
      {
        q: "Do we get full ownership of the source code?",
        a: "Yes, 100%. All GitHub repositories, database schemas, environment configurations, and assets are transferred directly to your organization upon project completion — no lock-in.",
      },
      {
        q: "Can you integrate with our existing systems and third-party APIs?",
        a: "Absolutely. We regularly integrate with payment gateways (Stripe, Razorpay), CRMs, ERPs, communication APIs (Twilio, Resend), and custom internal services via REST or GraphQL.",
      },
      {
        q: "How do you ensure the application stays secure after handover?",
        a: "We provide a security documentation package covering environment variable management, dependency update policies, and recommended monitoring tools (Sentry, Vercel observability). We also offer optional retainer plans for ongoing security patches.",
      },
    ],
  },
  {
    slug: "consulting",
    title: "Creative UI/UX & Digital Product Design",
    image: "https://cdn.pixabay.com/photo/2015/05/28/14/38/ux-787980_1280.jpg",
    shortDesc: "Transform manual spreadsheets and fragmented tools into custom internal software workflows.",
    heroDesc:
      "Modernize legacy business processes with bespoke ERP systems, student/employee portals, and automated digital operations.",
    bodyDesc:
      "Most growing businesses reach a point where spreadsheets and disconnected tools become the bottleneck. We build purpose-fit internal software: custom portals, operations dashboards, and ERP modules that map precisely to your actual workflows. Every engagement starts with an operational audit — we map every manual process and identify exactly where software can eliminate friction, reduce errors, and free up hours of human time each week. The result is software your team actually wants to use.",
    deliverables: [
      "Full Figma design systems & component libraries",
      "User journey mapping & high-fidelity prototypes",
      "Custom ERP & internal operations portals",
      "Accessible, mobile-first UX specifications",
      "Role-based staff & management dashboards",
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
        a: "Yes. We write custom data extraction and sanitization scripts to seamlessly import your historical records into the new relational database, with full validation and a dry-run before the live cut-over.",
      },
      {
        q: "How do you handle user training and change management?",
        a: "We deliver recorded walkthrough videos, written documentation tailored to each role (admin, manager, staff), and up to two live training sessions included in every engagement.",
      },
      {
        q: "What if our internal requirements change mid-project?",
        a: "We work in two-week sprints with a defined change-request process. Minor scope shifts are absorbed within the sprint; larger changes are quoted transparently before any work begins.",
      },
      {
        q: "Do you sign NDAs for sensitive business data?",
        a: "Yes, we sign a mutual NDA before the discovery phase. All data handled during the project is processed under strict confidentiality agreements and deleted from our systems at handover.",
      },
    ],
  },
  {
    slug: "ui-ux",
    title: "Performance Marketing & Lead Generation",
    image: "https://cdn.pixabay.com/photo/2016/10/09/08/32/digital-marketing-1725340_1280.jpg",
    shortDesc: "High-converting digital interfaces and comprehensive design systems built for speed.",
    heroDesc:
      "We design minimal, intuitive user interfaces that eliminate cognitive friction, maximize conversion rates, and translate seamlessly into clean code.",
    bodyDesc:
      "Getting traffic to your site is only half the battle — converting it is where revenue is made. We engineer full-funnel growth systems: from ad creative and targeting that brings the right audience, to landing page design and CRO tactics that turn visitors into qualified leads, to automated email sequences that close them. Our campaigns are data-driven from day one — conversion tracking is set up across Meta Pixel, Google Tag Manager, and GA4 before spending a single rupee. Most clients see a measurable improvement in cost-per-lead within the first 30 days.",
    deliverables: [
      "Meta & Google Ads campaign management",
      "Lead funnel architecture & landing pages",
      "Search engine optimisation & content strategy",
      "Email marketing automation & drip sequences",
      "Analytics dashboards & conversion tracking",
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
        a: "Yes. We provide complete, structured Figma libraries alongside production-ready Tailwind CSS / React components so your engineering team has zero ambiguity at handover.",
      },
      {
        q: "What is the minimum ad budget you recommend to see results?",
        a: "For Meta Ads, we recommend a minimum of Rs.30,000/month to gather statistically significant data within 4-6 weeks. For Google Search, Rs.20,000/month is a viable starting point for most B2B niches.",
      },
      {
        q: "How long before we see a measurable return from SEO?",
        a: "Organic SEO typically shows meaningful ranking improvements in 60-90 days for low-competition keywords, and 4-6 months for competitive terms. We set realistic milestones upfront and report on them weekly.",
      },
      {
        q: "Can you run campaigns in regional languages?",
        a: "Yes. We have experience running campaigns in Hindi, Bengali, Tamil, and Telugu alongside English, with native copywriting reviewed by regional speakers before any ads go live.",
      },
    ],
  },
  {
    slug: "ai-integration",
    title: "Business Automation & Cloud IT Solutions",
    image: "https://cdn.pixabay.com/photo/2017/06/14/16/20/network-2402637_1280.jpg",
    shortDesc: "Practical LLM pipelines, autonomous agent workflows, and smart integrations with Google Gemini & Groq.",
    heroDesc:
      "Integrate intelligence directly into your product workflows: automated lead qualification, document intelligence, and smart retrieval systems.",
    bodyDesc:
      "AI is most valuable when it automates repetitive, high-volume tasks that drain your team's time. We build production-grade AI pipelines using Google Gemini and Groq through the Vercel AI SDK: structured JSON extraction from unstructured documents, autonomous lead qualification bots, semantic search over your knowledge base, and scheduled AI agents that trigger on business events. We treat reliability as the primary design constraint — every pipeline has deterministic fallbacks, Zod-validated structured outputs, and cost controls built in for predictable performance and predictable bills.",
    deliverables: [
      "Google Gemini & Groq LLM API integration",
      "Autonomous lead parsing & qualification pipelines",
      "Document extraction & structured JSON ingestion",
      "Vector search & semantic retrieval systems",
      "Workflow automation & scheduled AI agents",
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
        a: "We deploy fast, cost-efficient models (e.g. Gemini 2.5 Flash / Groq Llama 3) with structured output caching and response memoization to keep latency under 800ms and costs predictable at scale.",
      },
      {
        q: "Can the AI workflows integrate with our existing software (CRM, ERP, Slack)?",
        a: "Yes. We build integration layers using webhooks, REST APIs, and Zapier-compatible event emitters so AI outputs flow directly into your existing tools without requiring a separate login.",
      },
      {
        q: "What happens when the AI model produces an incorrect output?",
        a: "Every pipeline includes a Zod-validated output schema. If the model returns malformed or out-of-range data, the fallback handler gracefully degrades to a rule-based default and alerts your team — the system never silently fails.",
      },
      {
        q: "Is our proprietary data used to train any third-party AI models?",
        a: "No. We configure all API calls with data-retention opt-outs where available (Google Cloud, Groq enterprise terms). Your data is used solely for inference and is never included in model fine-tuning or training datasets.",
      },
    ],
  },
];
