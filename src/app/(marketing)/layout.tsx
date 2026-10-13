import React from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { SmartChatbot } from "@/components/ui/SmartChatbot";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { MarketingLayoutProvider } from "@/components/marketing/MarketingLayoutContext";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingLayoutProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
        <ScrollProgressBar />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsApp />
        <SmartChatbot />
      </div>
    </MarketingLayoutProvider>
  );
}
