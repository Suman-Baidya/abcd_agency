"use client";

import React, { useState } from "react";
import { HelpCircle, Sparkles } from "lucide-react";
import "driver.js/dist/driver.css";

interface PortalTourProps {
  isProspect?: boolean;
}

export function PortalTour({ isProspect = false }: PortalTourProps) {
  const [isRunning, setIsRunning] = useState(false);

  const startTour = async () => {
    setIsRunning(true);
    try {
      const { driver } = await import("driver.js");

      const steps = isProspect
        ? [
            {
              element: "#portal-tour-header",
              popover: {
                title: "Welcome to Your Portal",
                description:
                  "This is your dashboard to explore digital services, submit project inquiries, and track scope updates.",
                side: "bottom",
                align: "start",
              },
            },
            {
              element: "#portal-tour-services",
              popover: {
                title: "Explore Agency Services",
                description:
                  "Browse custom Web & SaaS development, AI automation, and UI/UX design deliverables.",
                side: "right",
                align: "start",
              },
            },
            {
              element: "#portal-tour-inquiries",
              popover: {
                title: "Submit & Track Briefs",
                description:
                  "Submit new project requirements and receive estimates from our engineering leads in < 24h.",
                side: "right",
                align: "start",
              },
            },
            {
              element: "#portal-tour-install",
              popover: {
                title: "Install as Desktop / Mobile App",
                description:
                  "Install the ABCD Web App on your PC or phone for 1-tap fast access anytime.",
                side: "top",
                align: "center",
              },
            },
          ]
        : [
            {
              element: "#portal-tour-header",
              popover: {
                title: "Client Command Center",
                description:
                  "Access all your live Kanban sprint deliverables, milestone status, and documents in one place.",
                side: "bottom",
                align: "start",
              },
            },
            {
              element: "#portal-tour-projects",
              popover: {
                title: "Live Sprint Deliverables",
                description:
                  "Track real-time progress across Scoping, In-Progress, Testing, and Deployed stages.",
                side: "right",
                align: "start",
              },
            },
            {
              element: "#portal-tour-revisions",
              popover: {
                title: "Quality Assurance & Revisions",
                description:
                  "Submit change requests and communicate directly with your assigned engineering team.",
                side: "right",
                align: "start",
              },
            },
            {
              element: "#portal-tour-finance",
              popover: {
                title: "Invoices & Payment Ledger",
                description:
                  "View sprint billings, download PDF invoices, and review payment history.",
                side: "right",
                align: "start",
              },
            },
            {
              element: "#portal-tour-install",
              popover: {
                title: "Install Web App",
                description:
                  "Add ABCD Agency to your Windows Start Menu, macOS Dock, or Mobile Home Screen.",
                side: "top",
                align: "center",
              },
            },
          ];

      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayColor: "rgba(0, 0, 0, 0.75)",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Finish Tour",
        steps: steps as any,
        onDestroyed: () => {
          setIsRunning(false);
          try {
            localStorage.setItem("abcd_portal_tour_seen", "true");
          } catch {}
        },
      });

      driverObj.drive();
    } catch (err) {
      console.error("Failed to start Driver.js tour:", err);
      setIsRunning(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startTour}
      disabled={isRunning}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#161616] text-[#0A0A0A] dark:text-white text-xs font-semibold hover:bg-[#F5F5F5] dark:hover:bg-[#222222] transition-colors cursor-pointer shadow-2xs"
      title="Start guided portal walkthrough"
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
      <span>Take Tour</span>
    </button>
  );
}
