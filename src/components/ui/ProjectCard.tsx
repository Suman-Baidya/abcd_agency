import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Project } from "@prisma/client";

interface ProjectCardProps {
  project: Pick<Project, "title" | "slug" | "category" | "tagline" | "summary" | "impact" | "techStack">;
  hrefPrefix?: string;
}

export function ProjectCard({ project, hrefPrefix = "/work/" }: ProjectCardProps) {
  return (
    <Link
      href={`${hrefPrefix}${project.slug}`}
      className="group flex flex-col rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:hover:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white h-full"
    >
      {/* Project Preview Graphic */}
      <div className="h-56 bg-[#F5F5F5] dark:bg-[#161616] border-b border-[#E5E5E5] dark:border-[#262626] p-6 flex flex-col justify-between relative overflow-hidden shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
            {project.category}
          </span>
          <Badge variant="solid" size="sm">
            {project.impact}
          </Badge>
        </div>

        {/* Abstract Visual Pattern */}
        <div className="my-auto py-2">
          <div className="h-1.5 w-16 sm:w-20 bg-[#0A0A0A] dark:bg-white rounded-full mb-2" />
          <div className="h-1.5 w-32 sm:w-36 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
        </div>

        <div className="text-[11px] font-mono text-[#737373] dark:text-neutral-400">
          Case Study →
        </div>
      </div>

      {/* Project Details */}
      <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight group-hover:underline underline-offset-4 mb-2">
            {project.title}
          </h3>
          <p className="text-sm font-medium text-[#0A0A0A] dark:text-neutral-200 mb-3">
            {project.tagline}
          </p>
          <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed mb-6">
            {project.summary}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#E5E5E5] dark:border-[#262626] mt-auto">
          {project.techStack.map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
