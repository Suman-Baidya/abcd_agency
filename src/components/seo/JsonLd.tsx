import React from "react";
import { siteConfig } from "@/lib/siteConfig";

export function JsonLd() {
  const baseUrl = siteConfig.url || "https://abcddigitalhub.com";
  const logoUrl = `${baseUrl}/images/abcd_square_logo.png`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${baseUrl}/#organization`,
    name: siteConfig.name,
    alternateName: ["ABCD Digital Hub", "ABCD Digital", "ABCD Hub", "ABCD"],
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      caption: siteConfig.name,
    },
    image: logoUrl,
    description:
      "ABCD Digital Hub is a full-stack digital engineering studio and client management platform delivering modern web applications, scalable SaaS architectures, and autonomous AI automation.",
    email: `hello@${siteConfig.domain}`,
    telephone: siteConfig.contact.mobile,
    founder: {
      "@type": "Person",
      name: "Suman Baidya",
      jobTitle: "Founder & Lead Software Architect",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.contact.mobile,
        contactType: "customer support",
        email: `hello@${siteConfig.domain}`,
        availableLanguage: ["English", "Bengali", "Hindi"],
      },
    ],
    sameAs: [
      siteConfig.social.facebook,
      siteConfig.social.instagram,
      siteConfig.social.linkedin,
      siteConfig.social.youtube,
      siteConfig.social.x,
    ].filter(Boolean),
    priceRange: "$$",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: siteConfig.name,
    description: "Full-stack software engineering partner and digital consulting hub.",
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
    </>
  );
}
