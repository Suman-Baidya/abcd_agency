"use client";

import React, { useState } from "react";
import { ListTodo, FolderKanban } from "lucide-react";
import { AdminKanbanManager } from "./AdminKanbanManager";

interface AdminProjectViewSwitcherProps {
  dataTableComponent: React.ReactNode;
  projects: any[];
  tasks: any[];
  clients: any[];
}

export function AdminProjectViewSwitcher({
  dataTableComponent,
  projects,
  tasks,
  clients,
}: AdminProjectViewSwitcherProps) {
  const [activeTab, setActiveTab] = useState<"table" | "kanban">("table");

  return (
    <div className="space-y-6">
      {/* Primary Tab Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#E5E5E5] dark:border-[#262626]">
        <div className="flex items-center gap-1 p-1 bg-[#F5F5F5] dark:bg-[#141414] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
          <button
            onClick={() => setActiveTab("table")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "table"
                ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-xs"
                : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Data Table</span>
          </button>

          <button
            onClick={() => setActiveTab("kanban")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "kanban"
                ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-xs"
                : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              Live Sync
            </span>
          </button>
        </div>

        <div className="text-xs text-[#737373] hidden sm:block">
          {activeTab === "table" ? "Comprehensive tabular financial & deliverable ledger" : "Interactive agile sprint lanes & project todo manager"}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "table" ? (
        <div className="animate-in fade-in duration-200">
          {dataTableComponent}
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <AdminKanbanManager
            initialProjects={projects}
            initialTasks={tasks}
            clients={clients}
          />
        </div>
      )}
    </div>
  );
}
