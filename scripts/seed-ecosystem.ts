import { db } from "../src/lib/prisma";

async function main() {
  console.log("Checking EcoSystem platforms...");
  const count = await db.ecoSystemPlatform.count();
  if (count === 0) {
    await db.ecoSystemPlatform.createMany({
      data: [
        {
          name: "EduExam Cloud",
          slug: "eduexam-cloud",
          tagline: "Multi-Tenant Student Examination & Assessment Engine",
          description: "A full-scale, multi-tenant digital examination web application engineered for schools, universities, and coaching institutes. Features live timed proctored exams, dynamic question banks (MCQs, coding, subjective), instant automated grading, student performance analytics, and dedicated parent/admin reporting portals.",
          category: "EdTech SaaS",
          status: "Enterprise Ready",
          statusColor: "emerald",
          appUrl: "https://eduexam.abcddigitalhub.com",
          features: [
            "Multi-tenant architecture (isolated school & branch tenancies)",
            "Anti-cheat proctoring with tab-switch detection & timer locks",
            "Rich question bank supporting LaTeX, equations & coding snippets",
            "Automated grade distribution & student report card generator",
            "Parent & faculty portals with fee & performance telemetry"
          ],
          techStack: ["Next.js 15", "PostgreSQL", "Prisma", "Tailwind CSS", "Redis", "AWS S3"],
          targetAudience: "Schools, Colleges, Test Prep & Coaching Centers",
          pricingModel: "Multi-Tenant Subscription & Custom White-Label Deployment",
          isFeatured: true,
          isPublished: true,
          order: 1,
        },
        {
          name: "AutomateGrowth AI",
          slug: "automategrowth-ai",
          tagline: "Autonomous Inbound Lead Qualification & Omnichannel Marketing Engine",
          description: "A 24/7 AI-driven automation ecosystem built to capture, qualify, and convert inbound prospects. Integrates WhatsApp Business API, Meta ads webhooks, and Google Ads leads into an intelligent autonomous follow-up sequence with Gemini AI lead scoring and instant calendar booking.",
          category: "AI Automation",
          status: "Live Platform",
          statusColor: "emerald",
          appUrl: "https://growth.abcddigitalhub.com",
          features: [
            "Instant 60-second AI WhatsApp & email personalized follow-ups",
            "Intelligent lead qualification and ICP scoring with Google Gemini",
            "Automated CRM sync with Google Sheets, Notion, and HubSpot",
            "Ad-spend attribution tracking & automated weekly ROI reporting",
            "Customizable conversational workflows with no-code trigger builder"
          ],
          techStack: ["Next.js", "Google Gemini 2.5", "WhatsApp Cloud API", "Neon PostgreSQL", "Resend"],
          targetAudience: "E-commerce Brands, Real Estate, Clinics & B2B Agencies",
          pricingModel: "Monthly SaaS Retainer & Enterprise Custom Pipeline Setup",
          isFeatured: true,
          isPublished: true,
          order: 2,
        }
      ]
    });
    console.log("Successfully seeded 2 initial EcoSystem platforms!");
  } else {
    console.log(`Found ${count} existing EcoSystem platform(s). No seeding needed.`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
