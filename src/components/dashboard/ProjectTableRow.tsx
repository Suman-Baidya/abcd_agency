"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ProjectEditForm } from "./ProjectEditForm";
import { ProjectViewDetails } from "./ProjectViewDetails";
import { quickUpdateStatus, quickUpdateProgress, deleteProject } from "@/app/(dashboard)/admin/projects/quick-actions";
import { Project } from "@prisma/client";

interface ProjectTableRowProps {
  project: Project;
  serialNumber: number;
  categories: string[];
}

export function ProjectTableRow({ project, serialNumber, categories }: ProjectTableRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      quickUpdateStatus(project.id, e.target.value);
    });
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      startTransition(() => {
        quickUpdateProgress(project.id, val);
      });
    }
  };

  const handleDeleteConfirm = () => {
    startTransition(() => {
      try {
        deleteProject(project.id);
      } catch (err) {
        console.error("Failed to delete project", err);
      }
      setIsDeleteOpen(false);
    });
  };

  let weeksText = "4 Weeks";
  let dateText = "Aug 01 - Sep 30, '2026'";
  if (project.deadline) {
    try {
      const dates = JSON.parse(project.deadline);
      if (dates.startDate && dates.endDate) {
        const start = new Date(dates.startDate);
        const end = new Date(dates.endDate);
        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.max(1, Math.ceil(diffDays / 7));
        weeksText = `${diffWeeks} Week${diffWeeks !== 1 ? 's' : ''}`;
        
        const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' };
        const startStr = start.toLocaleDateString('en-US', formatOptions);
        const endStr = end.toLocaleDateString('en-US', formatOptions);
        const yearStr = end.getFullYear().toString().slice(-2);
        dateText = `${startStr} - ${endStr}, '${yearStr}'`;
      }
    } catch(e) {
      // Fallback for legacy string format or invalid JSON, use example
      weeksText = "4 Weeks";
      dateText = "Aug 01 - Sep 30, '26";
    }
  }

  return (
    <>
    <tr className={`hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors ${isPending ? "opacity-50" : ""}`}>
      {/* SL Number */}
      <td className="px-5 py-4 text-center font-mono text-xs font-medium text-[#737373] dark:text-neutral-500">
        {serialNumber < 10 ? `0${serialNumber}` : serialNumber}
      </td>

      {/* Project & Client (Combined, Truncated) */}
      <td className="px-5 py-4 w-80 max-w-[20rem]">
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="font-semibold text-[#0A0A0A] dark:text-white truncate" title={project.title}>
              {project.title}
            </span>
            {project.isFeatured && (
              <Badge variant="outline" size="sm" className="ml-2 text-[9px] shrink-0">Featured</Badge>
            )}
          </div>
          <span className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5" title={project.client}>
            {project.client}
          </span>
        </div>
      </td>

      {/* Quick Status Selection */}
      <td className="px-5 py-4 text-center">
        <select
          value={project.status}
          onChange={handleStatusChange}
          disabled={isPending}
          className={`text-xs border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer ${
            project.status === "On Track" 
              ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
              : project.status === "Delayed"
              ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
              : "bg-transparent text-[#0A0A0A] dark:text-white border-[#E5E5E5] dark:border-[#262626]"
          }`}
        >
          <option value="On Track" className="dark:bg-[#111111]">On Track</option>
          <option value="In Review" className="dark:bg-[#111111]">In Review</option>
          <option value="Delayed" className="dark:bg-[#111111]">Delayed</option>
          <option value="On Hold" className="dark:bg-[#111111]">On Hold</option>
        </select>
      </td>

      {/* Quick Progress Input */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-2 min-w-[80px]">
          <div className="flex items-center">
            <input 
              type="number" 
              defaultValue={project.progress} 
              onBlur={handleProgressChange}
              disabled={isPending}
              min={0}
              max={100}
              className="w-14 text-xs font-mono border border-[#E5E5E5] dark:border-[#262626] rounded-md px-1.5 py-0.5 text-right bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
            />
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400 ml-1">%</span>
          </div>
          
          <div className="w-full h-1.5 bg-[#E5E5E5] dark:bg-[#262626] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0A0A0A] dark:bg-white rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </td>

      <td className="px-5 py-4 font-mono text-xs whitespace-nowrap text-[#737373] dark:text-neutral-300">
        {project.budget || "₹ 1,50,000"}
      </td>
      
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white mb-0.5">
            {weeksText}
          </span>
          <span className="text-[11px] font-mono text-[#737373] dark:text-neutral-400">
            {dateText}
          </span>
        </div>
      </td>

      {/* Action Icons */}
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setIsViewOpen(true)}
            className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#262626]"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEditOpen(true)}
            className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#262626]"
            title="Edit Project"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            disabled={isPending}
            className="p-1.5 text-[#737373] hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>

    {/* View Details Slide-over */}
    <Modal
      isOpen={isViewOpen}
      onClose={() => setIsViewOpen(false)}
      title="Project Details"
      variant="slide-over"
      headerActions={
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsViewOpen(false);
              setIsEditOpen(true);
            }}
            className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#262626]"
            title="Edit Project"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsViewOpen(false);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 text-[#737373] hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <ProjectViewDetails 
        project={project} 
        onEdit={() => {
          setIsViewOpen(false);
          setIsEditOpen(true);
        }}
        onDelete={() => {
          setIsViewOpen(false);
          setIsDeleteOpen(true);
        }}
      />
    </Modal>

    {/* Edit Project Slide-over */}
    <Modal
      isOpen={isEditOpen}
      onClose={() => setIsEditOpen(false)}
      title="Edit Project"
      variant="slide-over"
    >
      <ProjectEditForm 
        project={project} 
        categories={categories}
        onSuccess={() => setIsEditOpen(false)} 
        onCancel={() => setIsEditOpen(false)} 
      />
    </Modal>

    {/* Delete Confirmation Modal */}
    <Modal
      isOpen={isDeleteOpen}
      onClose={() => setIsDeleteOpen(false)}
      title="Delete Project"
      variant="centered"
    >
      <div className="space-y-6">
        <p className="text-[#737373] dark:text-neutral-300">
          Are you sure you want to completely delete <strong>{project.title}</strong>? 
          This action is permanent and cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
          <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDeleteConfirm}>
            Yes, Delete Project
          </Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
