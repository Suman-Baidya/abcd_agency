import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { servicesData } from "@/data/services";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

export function generateStaticParams() {
  return servicesData.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: `${service.title} — ABCD Agency`,
    description: service.heroDesc,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);
  const serviceIndex = servicesData.findIndex((s) => s.slug === slug);

  if (!service) notFound();

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">

      {/* Compact Hero */}
      <section className="relative min-h-[45vh] flex flex-col justify-end overflow-hidden border-b border-[#E5E5E5] dark:border-[#262626]">
        <Image
          src={service.image}
          alt={service.title}
          fill
          priority
          sizes="100vw"
          className="object-cover grayscale"
        />
        {/* Light mode: fade to white from bottom. Dark mode: fade to near-black */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/10 dark:from-[#0A0A0A] dark:via-[#0A0A0A]/75 dark:to-[#0A0A0A]/25" />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 pt-24">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A0A0A]/50 dark:text-white/60 hover:text-[#0A0A0A] dark:hover:text-white transition-colors mb-6 group"
          >
            <svg className="w-4 h-4 stroke-current transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Services
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded bg-[#0A0A0A]/8 dark:bg-white/10 border border-[#0A0A0A]/15 dark:border-white/20 text-[#737373] dark:text-white/70">
              Service {String(serviceIndex + 1).padStart(2, "0")} / {servicesData.length.toString().padStart(2, "0")}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0A0A0A] dark:text-white leading-tight max-w-3xl mb-3">
            {service.title}
          </h1>
          <p className="text-sm sm:text-base text-[#737373] dark:text-white/60 leading-relaxed max-w-2xl">
            {service.heroDesc}
          </p>
        </div>
      </section>

      {/* Overview — Bold Inverted Statement Band */}
      <section className="relative overflow-hidden bg-[#0A0A0A] dark:bg-[#111111] border-b border-[#262626]">
        {/* Decorative grid lines */}
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          {/* Top rule + label */}
          <div className="flex items-center gap-4 mb-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">Overview</span>
            <span aria-hidden="true" className="flex-1 h-[1px] bg-white/10" />
          </div>
          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-start">
            {/* Decorative quote mark */}
            <span aria-hidden="true" className="hidden lg:block text-[9rem] leading-none font-serif text-white/8 select-none mt-[-1.5rem]">&ldquo;</span>
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug mb-6">
                What this service covers
              </h2>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
                {service.bodyDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DELIVERABLES + SIDEBAR — One Unified Section ═══ */}
      <section className="py-16 sm:py-24 border-b border-[#E5E5E5] dark:border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-14 lg:gap-16 items-start">

            {/* ── LEFT: Deliverables bento + CTA ── */}
            <div className="flex flex-col gap-10">

              {/* Label row */}
              <div className="flex items-baseline justify-between">
                <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-[#737373] dark:text-neutral-500">What We Deliver</h2>
                <span className="text-xs font-mono text-[#E5E5E5] dark:text-[#262626]">{String(service.deliverables.length).padStart(2, "0")} deliverables</span>
              </div>

              {/* Numbered ruled list — no wasted space */}
              <div className="border-t border-[#E5E5E5] dark:border-[#262626]">
                {service.deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center gap-5 sm:gap-8 py-4 sm:py-5 border-b border-[#E5E5E5] dark:border-[#262626] hover:bg-[#F5F5F5] dark:hover:bg-[#111111] -mx-4 sm:-mx-6 lg:-mx-0 px-4 sm:px-6 lg:px-0 transition-colors duration-150"
                  >
                    {/* Index */}
                    <span className="flex-shrink-0 w-7 font-mono text-[11px] font-semibold text-[#C0C0C0] dark:text-[#444] select-none tabular-nums">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    {/* Divider dot */}
                    <span aria-hidden="true" className="flex-shrink-0 w-1 h-1 rounded-full bg-[#E5E5E5] dark:bg-[#333]" />
                    {/* Item text */}
                    <p className="flex-1 text-sm sm:text-base font-semibold text-[#0A0A0A] dark:text-white leading-snug tracking-tight">
                      {item}
                    </p>
                    {/* Hover check */}
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A0A0A] dark:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
                      <svg className="w-3 h-3 stroke-white dark:stroke-[#0A0A0A]" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA — bottom of left column */}
              <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] dark:text-neutral-500 mb-3">Ready to start?</p>
                <p className="text-lg sm:text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight mb-6">
                  Let&apos;s build something that actually works.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button href="/contact" variant="primary" size="lg">Start This Service</Button>
                  <Button href="/services" variant="secondary" size="lg">Explore All Services</Button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Sticky sidebar ── */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-24">

              {/* Tech stack — dark panel */}
              <div className="rounded-2xl bg-[#0A0A0A] dark:bg-[#111111] border border-[#1a1a1a] dark:border-[#262626] p-6">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30 mb-5">Technologies Used</p>
                <div className="flex flex-wrap gap-2">
                  {service.technologies.map((tech) => (
                    <span key={tech} className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/10 text-white/60 bg-white/[0.04] hover:bg-white/10 hover:border-white/20 hover:text-white/80 transition-all duration-150 cursor-default">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Other services */}
              <div className="rounded-2xl border border-[#E5E5E5] dark:border-[#262626] overflow-hidden">
                <div className="px-5 py-3.5 bg-[#F5F5F5] dark:bg-[#111111] border-b border-[#E5E5E5] dark:border-[#262626]">
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] dark:text-neutral-500">Explore Other Services</p>
                </div>
                <ul className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
                  {servicesData.filter((s) => s.slug !== service.slug).map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="group/link flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#0A0A0A] hover:bg-[#F5F5F5] dark:hover:bg-[#111111] transition-colors duration-150"
                      >
                        <span className="flex-1 text-xs font-semibold text-[#0A0A0A] dark:text-white leading-snug">{s.title}</span>
                        <span className="flex-shrink-0 w-6 h-6 rounded-full border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center group-hover/link:border-[#0A0A0A] dark:group-hover/link:border-white group-hover/link:bg-[#0A0A0A] dark:group-hover/link:bg-white transition-all duration-150">
                          <svg className="w-2.5 h-2.5 stroke-[#737373] group-hover/link:stroke-white dark:group-hover/link:stroke-[#0A0A0A] transition-colors duration-150" fill="none" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROCESS — Dark Horizontal Timeline ═══ */}
      <section className="relative overflow-hidden bg-[#0A0A0A] dark:bg-[#0D0D0D]">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex items-center gap-4 mb-16">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Sprint Execution Roadmap</span>
            <span aria-hidden="true" className="flex-1 h-[1px] bg-white/10" />
            <span className="text-[10px] font-mono text-white/20">{service.processSteps.length} phases</span>
          </div>
          <div className="relative">
            <div aria-hidden="true" className="hidden lg:block absolute top-10 left-0 right-0 h-[1px] bg-white/8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
              {service.processSteps.map((step, idx) => (
                <div key={step} className="group flex flex-col">
                  <div className="relative flex items-center mb-8">
                    <div className="w-20 h-20 rounded-full border border-white/15 bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/30 transition-all duration-300">
                      <span className="font-mono text-2xl font-extrabold text-white/40 group-hover:text-white/70 transition-colors duration-300">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    {idx < service.processSteps.length - 1 && (
                      <svg aria-hidden="true" className="hidden lg:block absolute left-[4.5rem] ml-2 w-full text-white/10" viewBox="0 0 100 10" fill="none" preserveAspectRatio="none" style={{ height: '10px' }}>
                        <path d="M0 5 H95 M90 1 L99 5 L90 9" stroke="currentColor" strokeWidth="0.8" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2">Phase {String(idx + 1).padStart(2, "0")}</span>
                  <p className="text-base sm:text-lg font-bold text-white leading-snug tracking-tight">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {service.faq.length > 0 && (
        <section className="border-t border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-20 items-start">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373] dark:text-neutral-500 mb-3">FAQ</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white leading-snug mb-4">Common Questions</h2>
                <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed mb-6">
                  Everything you need to know before getting started with this service.
                </p>
                <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A0A0A] dark:text-white underline underline-offset-4 hover:opacity-70 transition-opacity">
                  Have another question? Contact us
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </div>
              <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-[#E5E5E5] dark:border-[#262626] px-6 sm:px-8">
                <FaqAccordion items={service.faq} />
              </div>
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}