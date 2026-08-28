"use client";

import React, { useTransition } from "react";
import { Project } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { updateProjectFull, createProjectInline } from "@/app/(dashboard)/admin/projects/actions";

interface ProjectEditFormProps {
  project?: Project;
  categories: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

function parseDeadline(deadline: string | undefined | null) {
  if (!deadline) return { startDate: "", endDate: "" };
  try {
    const parsed = JSON.parse(deadline);
    let start = parsed.startDate || "";
    let end = parsed.endDate || "";
    if (start.length > 10) start = start.substring(0, 10);
    if (end.length > 10) end = end.substring(0, 10);
    return { startDate: start, endDate: end };
  } catch (e) {
    return { startDate: "", endDate: "" };
  }
}

export function ProjectEditForm({ project, categories, onSuccess, onCancel }: ProjectEditFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      if (project) {
        await updateProjectFull(project.id, formData);
      } else {
        await createProjectInline(formData);
      }
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="space-y-6 pb-24">
        {/* Public Marketing Fields */}
        <div>
          <h2 className="text-xs font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider mb-3 border-b border-[#E5E5E5] dark:border-[#262626] pb-2">
            Public Marketing Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Project Title</label>
            <input type="text" name="title" defaultValue={project?.title} required className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Slug (URL)</label>
            <input type="text" name="slug" defaultValue={project?.slug} required className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Client Name</label>
            <input type="text" name="client" defaultValue={project?.client} required className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Category</label>
            <select 
              name="category" 
              defaultValue={project?.category || ""} 
              required 
              className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none cursor-pointer" 
            >
              <option value="" disabled>Select a Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Tagline</label>
            <input type="text" name="tagline" defaultValue={project?.tagline} required className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Summary</label>
            <textarea name="summary" defaultValue={project?.summary} required rows={3} className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Deep Dive HTML Content</label>
            <textarea name="content" defaultValue={project?.content || ""} rows={16} className="w-full text-sm font-mono border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none min-h-[300px]" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Measurable Impact</label>
            <input type="text" name="impact" defaultValue={project?.impact} required className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Tech Stack</label>
            <input type="text" name="techStack" defaultValue={project?.techStack.join(", ")} className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="flex items-center gap-3 p-4 border border-[#E5E5E5] dark:border-[#262626] rounded-md cursor-pointer hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors">
              <input type="checkbox" name="isFeatured" defaultChecked={project?.isFeatured} className="w-4 h-4 accent-[#0A0A0A] dark:accent-white" />
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">Featured Project</p>
                <p className="text-xs text-[#737373]">Show this project on the homepage marketing section.</p>
              </div>
            </label>
          </div>
        </div>
      </div>

        {/* Internal Dashboard Fields */}
        <div className="pt-2">
          <h2 className="text-xs font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider mb-3 border-b border-[#E5E5E5] dark:border-[#262626] pb-2">
            Internal Tracking
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Status</label>
            <select name="status" defaultValue={project?.status || "On Track"} className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none cursor-pointer">
              <option value="On Track">On Track</option>
              <option value="In Review">In Review</option>
              <option value="Delayed">Delayed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Progress (%)</label>
            <input type="number" name="progress" min="0" max="100" defaultValue={project?.progress || 0} className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Budget</label>
            <input type="text" name="budget" defaultValue={project?.budget || ""} className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">Start Date</label>
            <input type="date" name="startDate" lang="en-GB" defaultValue={parseDeadline(project?.deadline).startDate} className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">End Date</label>
            <input type="date" name="endDate" lang="en-GB" defaultValue={parseDeadline(project?.deadline).endDate} className="w-full text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none" />
          </div>
        </div>
      </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[#E5E5E5] dark:border-[#262626] flex justify-end gap-3 bg-white dark:bg-[#0A0A0A] shrink-0 sticky bottom-0 pb-2 z-10">
        <Button type="button" onClick={onCancel} variant="secondary" disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving..." : project ? "Save Changes" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
