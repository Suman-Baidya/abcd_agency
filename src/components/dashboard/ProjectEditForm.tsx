"use client";

import React, { useTransition, useState, useMemo, useRef, useEffect } from "react";
import { Project } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Search, Check, ChevronsUpDown, Building2, X } from "lucide-react";
import { updateProjectFull, createProjectInline } from "@/app/(dashboard)/admin/projects/actions";

interface ProjectEditFormProps {
  project?: Project;
  categories: string[];
  clients?: Array<{ id: string; name: string; email: string }>;
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

export function ProjectEditForm({ project, categories, clients = [], onSuccess, onCancel }: ProjectEditFormProps) {
  const [isPending, startTransition] = useTransition();

  // Find initial client
  const initialClientId = project?.clientId || (clients.find(c => c.name.toLowerCase() === (project?.client || "").toLowerCase())?.id) || "";
  const initialClientName = project?.client || (clients.find(c => c.id === initialClientId)?.name) || "";

  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId);
  const [clientName, setClientName] = useState<string>(initialClientName);
  const [isClientOpen, setIsClientOpen] = useState<boolean>(false);
  const [clientSearch, setClientSearch] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClientOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter clients by search query
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clients, clientSearch]);

  const selectedClientObj = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || (clientName ? { id: selectedClientId, name: clientName, email: "" } : null);
  }, [clients, selectedClientId, clientName]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setIsClientOpen(true);
      return;
    }
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
      <input type="hidden" name="clientId" value={selectedClientId} />
      <input type="hidden" name="client" value={clientName} />

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

          {/* Smart Searchable Client Selector */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#0A0A0A] dark:text-white">
                Client / Account <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-[#737373] dark:text-neutral-400">
                Select existing client
              </span>
            </div>

            {/* Combobox Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setIsClientOpen(!isClientOpen);
                setClientSearch("");
              }}
              className="w-full text-left flex items-center justify-between text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white outline-none hover:border-[#0A0A0A] dark:hover:border-white transition-colors cursor-pointer"
            >
              {selectedClientObj ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-[9px] font-bold shrink-0">
                    {selectedClientObj.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium truncate">{selectedClientObj.name}</span>
                  {selectedClientObj.email && (
                    <span className="text-xs text-[#737373] dark:text-neutral-400 font-mono truncate hidden sm:inline">
                      ({selectedClientObj.email})
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[#737373] dark:text-neutral-500">
                  -- Select Client Account --
                </span>
              )}
              <ChevronsUpDown className="w-4 h-4 text-[#737373] shrink-0 ml-2 opacity-70" />
            </button>

            {/* Smart Searchable Dropdown Menu */}
            {isClientOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-lg shadow-xl p-2 space-y-2 animate-in fade-in duration-100">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                  <input
                    type="text"
                    placeholder="Search client by name or email..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-8 pr-7 py-1.5 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-[#F9F9F9] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                  {clientSearch && (
                    <button
                      type="button"
                      onClick={() => setClientSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Clients Options List */}
                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((c) => {
                      const isSelected = selectedClientId === c.id || clientName.toLowerCase() === c.name.toLowerCase();
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedClientId(c.id);
                            setClientName(c.name);
                            setIsClientOpen(false);
                            setClientSearch("");
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] font-semibold"
                              : "hover:bg-[#F5F5F5] dark:hover:bg-[#1C1C1C] text-[#0A0A0A] dark:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isSelected
                                  ? "bg-white text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-white"
                                  : "bg-[#E5E5E5] text-[#0A0A0A] dark:bg-[#262626] dark:text-white"
                              }`}
                            >
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{c.name}</p>
                              {c.email && (
                                <p className={`text-[10px] truncate ${isSelected ? "text-neutral-300 dark:text-neutral-600" : "text-[#737373] dark:text-neutral-400"}`}>
                                  {c.email}
                                </p>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-xs text-[#737373] dark:text-neutral-500">
                      {clientSearch ? `No clients matching "${clientSearch}"` : "No registered clients found"}
                    </div>
                  )}
                </div>
              </div>
            )}
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
