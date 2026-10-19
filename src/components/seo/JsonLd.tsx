import React from "react";
import { siteConfig as staticConfig } from "@/lib/siteConfig";
import { getSiteConfig } from "@/lib/dbConfig";

export async function JsonLd() {
  const config = await getSiteConfig();
  const baseUrl = config.websiteUrl || staticConfig.url || "https://abcddigitalhub.com";
  const logoUrl = config.lightLogoUrl || `${baseUrl}/images/abcd_square_logo.png`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${baseUrl}/#organization`,
    name: config.agencyName || staticConfig.name,
    alternateName: ["ABCD Digital Hub", "ABCD Digital", "ABCD Hub", "ABCD"],
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      caption: config.agencyName || staticConfig.name,
    },
    image: logoUrl,
    description:
      "ABCD Digital Hub is a high-performance software engineering studio specializing in custom full-stack web application development, scalable multi-tenant SaaS platforms, and autonomous AI automation systems.",
    email: config.contactEmail || `hello@${staticConfig.domain}`,
    telephone: config.contactPhone || staticConfig.contact.mobile,
    founder: {
      "@type": "Person",
      name: "Suman Baidya",
      jobTitle: "Founder & Lead Software Architect",
      sameAs: [
        config.enableLinkedin !== false ? (config.linkedinUrl || staticConfig.social.linkedin) : null,
        config.enableTwitter !== false ? (config.twitterUrl || staticConfig.social.x) : null,
      ].filter(Boolean),
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: config.contactPhone || staticConfig.contact.mobile,
        contactType: "customer support",
        email: config.contactEmail || `hello@${staticConfig.domain}`,
        availableLanguage: ["English", "Bengali", "Hindi"],
      },
    ],
    knowsAbout: [
      "Full-Stack Web Application Development",
      "Next.js App Router Architecture",
      "TypeScript",
      "React 19",
      "Neon Serverless PostgreSQL",
      "Prisma ORM",
      "Google Gemini AI Integration",
      "Multi-Tenant SaaS Architecture",
      "Cloud Infrastructure & Edge Deployment",
      "Real-Time WebRTC Anti-Cheat Proctoring",
      "Autonomous Marketing Automation",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Software Engineering & Digital Consulting Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Full-Stack Web Application Development",
            serviceType: "Full-Stack Web Application Development",
            description: "Custom end-to-end web application development using Next.js 15, TypeScript, PostgreSQL, and modern cloud architectures.",
            provider: { "@id": `${baseUrl}/#organization` },
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Multi-Tenant SaaS Product Engineering",
            serviceType: "SaaS Application Development",
            description: "Enterprise SaaS systems with tenant isolation, RBAC security, subscription billing, and 99.9% uptime SLAs.",
            provider: { "@id": `${baseUrl}/#organization` },
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Autonomous AI & Workflow Automation",
            serviceType: "AI Automation Engineering",
            description: "Custom LLM integrations with Google Gemini and Groq, automated document extraction, intelligent scoring, and agentic workflows.",
            provider: { "@id": `${baseUrl}/#organization` },
          },
        },
      ],
    },
    sameAs: [
      config.enableFacebook !== false ? (config.facebookUrl || staticConfig.social.facebook) : null,
      config.enableInstagram !== false ? (config.instagramUrl || staticConfig.social.instagram) : null,
      config.enableLinkedin !== false ? (config.linkedinUrl || staticConfig.social.linkedin) : null,
      config.enableYoutube !== false ? (config.youtubeUrl || staticConfig.social.youtube) : null,
      config.enableTwitter !== false ? (config.twitterUrl || staticConfig.social.x) : null,
      config.enableBehance !== false ? config.behanceUrl : null,
    ].filter(Boolean),
    priceRange: "$$",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: config.agencyName || staticConfig.name,
    description: "Full-stack software engineering partner and digital consulting hub building modern web applications, scalable SaaS products, and automated business workflows.",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/work?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const softwareProductsSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "ABCD Exam Hub",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Cloud / Web",
        description: "AI-powered exam management and online assessment platform featuring real-time anti-cheat proctoring, multi-tenant portals, and automatic grading.",
        url: `${baseUrl}/ecosystem#abcd-exam-hub`,
        creator: { "@id": `${baseUrl}/#organization` },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Available for live test sandbox exploration and white-label enterprise licensing.",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "AutomateGrowth AI",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Cloud / Web",
        description: "Autonomous multi-channel marketing automation and lead conversion engine with intelligent lead scoring, email, and WhatsApp drips.",
        url: `${baseUrl}/ecosystem#automate-growth-ai`,
        creator: { "@id": `${baseUrl}/#organization` },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Available for live test sandbox exploration and enterprise deployment.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareProductsSchema) }}
      />
    </>
  );
}
