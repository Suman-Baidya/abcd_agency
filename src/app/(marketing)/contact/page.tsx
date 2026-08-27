import React from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { PageHeader } from "@/components/ui/PageHeader";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact ABCD Agency — Start Your Project",
  description:
    "Get in touch with ABCD Agency for custom web application development, SaaS engineering, and AI digital transformation.",
};

export default function ContactPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
        title="Start a Project"
        description="Ready to build something exceptional? Tell us about your project, timeline, and core technical goals."
        icon={<MessageSquare className="w-32 h-32" />}
      />

      {/* Content */}
      <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Layout: Form Left, Info Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <ContactInfo />
          </div>
        </div>
      </div>
    </div>
  );
}
