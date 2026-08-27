import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const packages = [
    {
      name: "Starter Package",
      targetAudience: "Local Businesses, Startups, Coaching Centers, Consultants, & Small Shops",
      deliverables: [
        "Custom responsive website (up to 5 pages)",
        "Mobile-optimized design & fast load times",
        "Contact & inquiry lead forms",
        "Direct WhatsApp integration",
        "Basic On-Page SEO setup",
        "Google Business Profile setup assistance",
        "Free SSL security configuration"
      ],
      support: "15 Days Dedicated Support",
      timeline: "5 to 10 Working Days",
      investment: "₹10,000+",
      order: 1
    },
    {
      name: "Growth Package",
      targetAudience: "Growing Businesses seeking direct inquiries, sales, and lead generation",
      deliverables: [
        "High-converting website or custom landing page",
        "Conversion-focused UI/UX architecture",
        "Meta Ads (Facebook & Instagram) campaign setup",
        "Lead capture system with automated WhatsApp alerts",
        "Analytics, Pixel, & conversion tracking setup",
        "Monthly campaign performance reports"
      ],
      support: "30 Days Dedicated Support",
      timeline: "10 to 20 Working Days",
      investment: "₹30,000+ (Ad spend separate)",
      order: 2
    },
    {
      name: "Enterprise Package",
      targetAudience: "Educational Institutes, Organizations, Agencies, & Scaled Companies",
      deliverables: [
        "Full-stack custom web application development",
        "Custom dashboard systems & admin panels",
        "Multi-user role & permission management",
        "Scalable database architecture",
        "Third-party API integrations",
        "Custom AI automation & 24/7 chatbots",
        "Cloud deployment & security hardening",
        "Staff training & technical documentation"
      ],
      support: "Priority VIP Support",
      timeline: "Custom / Milestone-based",
      investment: "₹80,000 to ₹1,20,000+",
      order: 3
    }
  ]

  console.log("Seeding Pricing Packages...")
  for (const pkg of packages) {
    await prisma.pricingPackage.create({ data: pkg })
  }

  const services = [
    {
      name: "Website Maintenance & Updates",
      scope: "Bug fixes, platform updates, security patches, and periodic content changes",
      monthlyRetainer: "₹2,000",
      yearlyPlan: "₹20,000",
      order: 1
    },
    {
      name: "Website Hosting & Cloud Monitoring",
      scope: "High-speed cloud hosting, uptime monitoring, SSL renewals, and weekly automated backups",
      monthlyRetainer: "₹1,500",
      yearlyPlan: "₹15,000",
      order: 2
    },
    {
      name: "Complete SEO Management",
      scope: "On-page technical SEO, keyword ranking tracking, site health monitoring, and backlink analysis",
      monthlyRetainer: "₹5,000",
      yearlyPlan: "₹50,000",
      order: 3
    },
    {
      name: "Google Business Profile Optimization",
      scope: "Local map pack ranking, weekly post updates, review response strategy, and business info management",
      monthlyRetainer: "₹3,000",
      yearlyPlan: "₹30,000",
      order: 4
    },
    {
      name: "Meta Ads (FB/IG) Campaign Management",
      scope: "Audience targeting, ad creative design, A/B testing, budget optimization, and weekly reporting",
      monthlyRetainer: "₹5,000",
      yearlyPlan: "₹55,000",
      order: 5
    },
    {
      name: "Google Ads (PPC) Management",
      scope: "High-intent search campaigns, keyword bid tuning, negative keyword filters, and ROI tracking",
      monthlyRetainer: "₹7,000",
      yearlyPlan: "₹75,000",
      order: 6
    },
    {
      name: "WhatsApp Automation Management",
      scope: "Automated chat flows, greeting rules, broadcast message setup, and quick-reply systems",
      monthlyRetainer: "₹2,500",
      yearlyPlan: "₹25,000",
      order: 7
    },
    {
      name: "AI Chatbot Maintenance",
      scope: "Business knowledge-base training, response refinement, and conversation flow updates",
      monthlyRetainer: "₹3,000",
      yearlyPlan: "₹30,000",
      order: 8
    },
    {
      name: "Social Media Creative Management",
      scope: "12 custom graphic posts/reels per month, strategic caption writing, and hashtag research",
      monthlyRetainer: "₹6,000",
      yearlyPlan: "₹65,000",
      order: 9
    },
    {
      name: "Dedicated Cloud Infrastructure Support",
      scope: "VPS/Cloud server maintenance, traffic autoscaling, database optimization, and disaster recovery",
      monthlyRetainer: "₹2,500",
      yearlyPlan: "₹25,000",
      order: 10
    }
  ]

  console.log("Seeding Pricing Services...")
  for (const srv of services) {
    await prisma.pricingService.create({ data: srv })
  }

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
