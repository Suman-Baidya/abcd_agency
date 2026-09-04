import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/Button";
import {
  Home,
  Layers,
  ArrowRight,
  Code2,
  Briefcase,
  HelpCircle,
  Terminal,
} from "lucide-react";

export const metadata = {
  title: "404 — Page Not Found | ABCD Agency",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative overflow-hidden">
        {/* Subtle Background Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
          {/* Monospace System Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] text-[#737373] dark:text-neutral-400 font-mono text-[11px] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] dark:bg-white animate-pulse" />
            <span>ERR_ROUTE_NOT_FOUND // 404</span>
          </div>

          {/* Large Hero Display */}
          <div className="space-y-2">
            <h1 className="text-8xl sm:text-9xl font-extrabold tracking-tighter text-[#0A0A0A] dark:text-white select-none leading-none">
              404
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
              Lost in the Digital Void
            </h2>
            <p className="text-sm sm:text-base text-[#737373] dark:text-[#A3A3A3] max-w-md mx-auto leading-relaxed">
              The endpoint or resource you requested cannot be located. It may have been archived, restructured, or never existed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Button
              href="/"
              variant="primary"
              size="sm"
              className="!min-h-[38px] px-4 py-2 text-xs font-medium rounded-lg shrink-0"
            >
              <Home className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              Return to Homepage
            </Button>
            <Button
              href="/work"
              variant="secondary"
              size="sm"
              className="!min-h-[38px] px-4 py-2 text-xs font-medium rounded-lg shrink-0"
            >
              <Briefcase className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              Explore Case Studies
            </Button>
          </div>

          {/* Quick Helpful Destinations */}
          <div className="pt-8 border-t border-[#E5E5E5] dark:border-[#262626]">
            <p className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-neutral-400 mb-4">
              Direct System Navigation
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <Link
                href="/services"
                className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] hover:border-[#0A0A0A] dark:hover:border-white transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Code2 className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                  <ArrowRight className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-white">Our Services</h3>
                <p className="text-[11px] text-[#737373] dark:text-neutral-400 line-clamp-2 mt-0.5">
                  Full-stack software, mobile apps & AI solutions.
                </p>
              </Link>

              <Link
                href="/portal"
                className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] hover:border-[#0A0A0A] dark:hover:border-white transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Layers className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                  <ArrowRight className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-white">Client Portal</h3>
                <p className="text-[11px] text-[#737373] dark:text-neutral-400 line-clamp-2 mt-0.5">
                  Access active projects, tickets & milestones.
                </p>
              </Link>

              <Link
                href="/contact"
                className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] hover:border-[#0A0A0A] dark:hover:border-white transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <HelpCircle className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                  <ArrowRight className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-white">Get Support</h3>
                <p className="text-[11px] text-[#737373] dark:text-neutral-400 line-clamp-2 mt-0.5">
                  Report a broken link or reach our technical team.
                </p>
              </Link>
            </div>
          </div>

          {/* System Terminal Ping */}
          <div className="inline-flex items-center gap-2 font-mono text-[10px] text-[#737373] dark:text-neutral-500 pt-4">
            <Terminal className="w-3 h-3" />
            <span>STATUS: 404 // HOST: abcdagency.com // ALL SERVICES OPERATIONAL</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
