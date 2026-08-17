import React from "react";

interface TechItem {
  name: string;
  category: string;
}

const technologies: TechItem[] = [
  { name: "Next.js 15 (App Router)", category: "Frontend / SSR" },
  { name: "TypeScript Strict", category: "Language" },
  { name: "PostgreSQL & Prisma", category: "Database & ORM" },
  { name: "Tailwind CSS", category: "Design System" },
  { name: "Google Gemini & Groq", category: "AI & Inference" },
  { name: "Vercel & Neon", category: "Edge Cloud" },
];

export function TechStack() {
  return (
    <section className="py-14 bg-[#111111] text-white border-y border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Label */}
          <div className="flex-shrink-0 text-center lg:text-left">
            <p className="text-xs font-mono uppercase tracking-widest text-[#737373]">
              Core Tech Stack
            </p>
            <p className="text-sm font-semibold text-white mt-0.5">
              Production-Grade Tooling
            </p>
          </div>

          {/* Tech Badges / Items */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap items-center justify-center gap-3 sm:gap-4 w-full lg:w-auto">
            {technologies.map((tech) => (
              <div
                key={tech.name}
                className="px-4 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#262626] flex flex-col items-center lg:items-start text-center lg:text-left transition-colors hover:border-neutral-500"
              >
                <span className="text-xs font-bold text-white tracking-tight">
                  {tech.name}
                </span>
                <span className="text-[10px] font-mono text-[#737373] mt-0.5">
                  {tech.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
