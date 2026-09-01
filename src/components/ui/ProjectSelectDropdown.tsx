"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, FolderKanban, Search, Layers } from "lucide-react";

export interface ProjectOption {
  id: string;
  title: string;
  category?: string;
  progress?: number;
  client?: string;
  status?: string;
}

interface ProjectSelectDropdownProps {
  projects: ProjectOption[];
  selectedId: string;
  onSelect: (projectId: string) => void;
  allLabel?: string;
  className?: string;
}

export function ProjectSelectDropdown({
  projects,
  selectedId,
  onSelect,
  allLabel = "All Projects & Deliverables",
  className = "",
}: ProjectSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedProject = projects.find((p) => p.id === selectedId);

  const filteredProjects = projects.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.client && p.client.toLowerCase().includes(q))
    );
  });

  return (
    <div className={`relative inline-block text-left w-full max-w-md ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#141414] hover:bg-[#F0F0F0] dark:hover:bg-[#1C1C1C] text-[#0A0A0A] dark:text-white transition-all shadow-xs outline-none focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          <Layers className="w-3.5 h-3.5 text-[#737373] shrink-0" />
          <span className="truncate">
            {selectedId === "all" || !selectedProject
              ? `${allLabel} (${projects.length})`
              : selectedProject.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedProject && typeof selectedProject.progress === "number" && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-[#EAEAEA] dark:bg-[#262626] text-[#0A0A0A] dark:text-white">
              {selectedProject.progress}%
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#737373] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-black dark:text-white" : ""
            }`}
          />
        </div>
      </button>

      {/* Custom Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 max-h-80 flex flex-col">
          {/* Search bar inside dropdown (if > 3 projects) */}
          {projects.length > 3 && (
            <div className="p-1.5 pb-2 border-b border-[#EBEBEB] dark:border-[#222222]">
              <div className="relative">
                <Search className="w-3 h-3 text-[#737373] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#F5F5F5] dark:bg-[#181818] rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] outline-none"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto space-y-1 p-1 scrollbar-thin flex-1">
            {/* "All Projects" Option */}
            <button
              type="button"
              onClick={() => {
                onSelect("all");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-xl text-left font-medium transition-colors cursor-pointer ${
                selectedId === "all"
                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]"
                  : "hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#0A0A0A] dark:text-neutral-200"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold">{allLabel}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  selectedId === "all"
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                    : "bg-[#EAEAEA] dark:bg-[#222222] text-[#737373]"
                }`}>
                  {projects.length}
                </span>
                {selectedId === "all" && <Check className="w-3.5 h-3.5" />}
              </div>
            </button>

            {projects.length > 0 && <div className="h-px bg-[#EBEBEB] dark:bg-[#222222] my-1" />}

            {/* Individual Project Items */}
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => {
                const isSelected = selectedId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelect(p.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] font-semibold"
                        : "hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#0A0A0A] dark:text-neutral-200 font-medium"
                    }`}
                  >
                    <div className="min-w-0 truncate">
                      <div className="truncate">{p.title}</div>
                      {p.category && (
                        <div className={`text-[10px] truncate ${
                          isSelected ? "text-white/70 dark:text-black/70" : "text-[#737373]"
                        }`}>
                          {p.category} {p.client ? `— ${p.client}` : ""}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {typeof p.progress === "number" && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          isSelected
                            ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                            : "bg-[#EAEAEA] dark:bg-[#222222] text-[#737373]"
                        }`}>
                          {p.progress}%
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-[11px] text-[#737373]">
                No projects match search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
