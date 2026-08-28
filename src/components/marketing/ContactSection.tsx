import React from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function ContactSection() {
  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-[#0A0A0A] border-t border-[#E5E5E5] dark:border-[#262626] transition-colors duration-200" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 lg:mb-16">
          <SectionHeader
            subtitle="Get In Touch"
            title="Start your project today."
            description="Fill out the form below and our team will get back to you within 24 hours to schedule a discovery call."
            align="left"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-7 w-full border border-[#E5E5E5] dark:border-[#262626] rounded-xl p-6 sm:p-8 bg-[#F5F5F5] dark:bg-[#111111] shadow-sm">
            <ContactForm />
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <ContactInfo />
          </div>
        </div>
      </div>
    </section>
  );
}
