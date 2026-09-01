"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  FolderKanban, 
  Plus, 
  Search, 
  User, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Edit3, 
  ArrowRight,
  Flame,
  Layers,
  X,
  Eye,
  Calendar,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { 
  createProjectTask, 
  updateProjectTaskStatus, 
  updateProjectTask, 
  deleteProjectTask, 
  KanbanStatus, 
  KanbanPriority 
} from "@/app/(dashboard)/admin/projects/kanban-actions";
import { ProjectSelectDropdown } from "@/components/ui/ProjectSelectDropdown";
import { DatePicker } from "@/components/ui/DatePicker";
import toast from "react-hot-toast";
import { formatProjectDeadline, evaluateTaskUrgency } from "@/lib/formatDate";

export const KANBAN_LANES: { id: KanbanStatus; title: string; color: string; borderClass: string; bgBadge: string; textBadge: string }[] = [
  { 
    id: "Backlog", 
    title: "Backlog", 
    color: "border-indigo-500", 
    borderClass: "border-t-indigo-500",
    bgBadge: "bg-indigo-50 dark:bg-indigo-950/40",
    textBadge: "text-indigo-600 dark:text-indigo-300"
  },
  { 
    id: "Todo", 
    title: "To Do", 
    color: "border-emerald-500", 
    borderClass: "border-t-emerald-500",
    bgBadge: "bg-emerald-50 dark:bg-emerald-950/40",
    textBadge: "text-emerald-600 dark:text-emerald-300"
  },
  { 
    id: "InProgress", 
    title: "In Progress", 
    color: "border-amber-500", 
    borderClass: "border-t-amber-500",
    bgBadge: "bg-amber-50 dark:bg-amber-950/40",
    textBadge: "text-amber-600 dark:text-amber-300"
  },
  { 
    id: "Done", 
    title: "Done / QA", 
    color: "border-rose-500", 
    borderClass: "border-t-rose-500",
    bgBadge: "bg-rose-50 dark:bg-rose-950/40",
    textBadge: "text-rose-600 dark:text-rose-300"
  },
  { 
    id: "Approved", 
    title: "Approved & Live", 
    color: "border-blue-600", 
    borderClass: "border-t-blue-600",
    bgBadge: "bg-blue-50 dark:bg-blue-950/40",
    textBadge: "text-blue-600 dark:text-blue-300"
  },
];

export const PRIORITY_CONFIG: Record<string, { label: string; badge: string; dot: string; weight: number }> = {
  Urgent: { 
    label: "Urgent", 
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20", 
    dot: "bg-rose-500",
    weight: 5
  },
  Critical: { 
    label: "Critical", 
    badge: "bg-black text-white dark:bg-white dark:text-black border border-black/20 dark:border-white/20 font-bold", 
    dot: "bg-white dark:bg-black",
    weight: 4
  },
  High: { 
    label: "High", 
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20", 
    dot: "bg-amber-500",
    weight: 3
  },
  Medium: { 
    label: "Medium", 
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20", 
    dot: "bg-indigo-500",
    weight: 2
  },
  Low: { 
    label: "Low", 
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20", 
    dot: "bg-emerald-500",
    weight: 1
  },
};

interface AdminKanbanManagerProps {
  initialProjects: any[];
  initialTasks: any[];
  clients: any[];
}

export function AdminKanbanManager({
  initialProjects,
  initialTasks,
  clients,
}: AdminKanbanManagerProps) {
  const [projects, setProjects] = useState<any[]>(initialProjects);
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"tasks" | "today-priorities" | "projects-overview">("tasks");
  const [activeMobileLane, setActiveMobileLane] = useState<string>("all"); // Mobile phone lane switcher
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<any | null>(null);
  const [taskForm, setTaskForm] = useState({
    projectId: initialProjects[0]?.id || "",
    title: "",
    description: "",
    priority: "Medium",
    status: "Todo",
    assignee: "",
    dueDate: "",
  });

  // Dynamically computed projects with live-synced task progress
  const syncedProjects = useMemo(() => {
    return projects.map((p) => {
      const projTasks = tasks.filter((t) => t.projectId === p.id);
      if (projTasks.length === 0) return p;
      const completedCount = projTasks.filter((t) => t.status === "Approved" || t.status === "Done").length;
      const computedProgress = Math.round((completedCount / projTasks.length) * 100);
      return {
        ...p,
        progress: computedProgress,
      };
    });
  }, [projects, tasks]);

  // Active Project object
  const activeProject = useMemo(() => {
    if (selectedProjectId === "all") return null;
    return syncedProjects.find((p) => p.id === selectedProjectId) || null;
  }, [syncedProjects, selectedProjectId]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedProjectId !== "all" && task.projectId !== selectedProjectId) {
        return false;
      }
      if (selectedPriority !== "all" && task.priority !== selectedPriority) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesAssignee = task.assignee?.toLowerCase().includes(q);
        const matchesProject = task.projectRel?.title?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAssignee && !matchesProject) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, selectedProjectId, selectedPriority, searchQuery]);

  // Today's Priority Tasks (Smart Dual Ranking: Due Date Urgency + Priority Tag Weight)
  const todayPriorities = useMemo(() => {
    return [...tasks]
      .filter((t) => t.status !== "Approved" && t.status !== "Done")
      .map((t) => ({
        ...t,
        urgency: evaluateTaskUrgency(t.dueDate, t.priority),
      }))
      .sort((a, b) => b.urgency.score - a.urgency.score);
  }, [tasks]);

  // Pre-partition tasks by lane in a single O(N) pass for maximum rendering performance
  const tasksByLane = useMemo(() => {
    const map: Record<string, any[]> = {
      Backlog: [],
      Todo: [],
      InProgress: [],
      Done: [],
      Approved: [],
    };
    filteredTasks.forEach((t) => {
      if (map[t.status]) {
        map[t.status].push(t);
      } else {
        map.Todo.push(t);
      }
    });
    return map;
  }, [filteredTasks]);

  // Task Stats
  const taskStats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((t) => t.status === "Approved" || t.status === "Done").length;
    const inProgress = filteredTasks.filter((t) => t.status === "InProgress").length;
    const urgent = filteredTasks.filter((t) => t.priority === "Urgent" || t.priority === "Critical").length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, urgent, progressPercent };
  }, [filteredTasks]);

  // Move task status
  const handleMoveStatus = async (taskId: string, newStatus: KanbanStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const res = await updateProjectTaskStatus(taskId, newStatus);
    if (!res.success) {
      toast.error(res.error || "Failed to update task status");
    } else {
      toast.success(`Moved to ${newStatus}`, { duration: 1200 });
    }
  };


  // Open Create Modal
  const handleOpenCreate = (defaultStatus: KanbanStatus = "Todo") => {
    setEditingTask(null);
    // Default due date: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");

    setTaskForm({
      projectId: selectedProjectId !== "all" ? selectedProjectId : (projects[0]?.id || ""),
      title: "",
      description: "",
      priority: "Medium",
      status: defaultStatus,
      assignee: "",
      dueDate: `${yyyy}-${mm}-${dd}`,
    });
    setShowTaskModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      projectId: task.projectId,
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "Todo",
      assignee: task.assignee || "",
      dueDate: task.dueDate || "",
    });
    setShowTaskModal(true);
  };

  // Submit Task Form
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    if (!taskForm.projectId) {
      toast.error("Please select a project");
      return;
    }

    setIsSyncing(true);
    if (editingTask) {
      const res = await updateProjectTask(editingTask.id, taskForm);
      if (res.success && res.task) {
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...t, ...res.task } : t)));
        toast.success("Task updated successfully");
        setShowTaskModal(false);
      } else {
        toast.error(res.error || "Failed to update task");
      }
    } else {
      const res = await createProjectTask(taskForm);
      if (res.success && res.task) {
        const matchingProj = projects.find((p) => p.id === taskForm.projectId);
        const newTaskWithRel = {
          ...res.task,
          projectRel: matchingProj ? { id: matchingProj.id, title: matchingProj.title, client: matchingProj.client } : null,
        };
        setTasks((prev) => [newTaskWithRel, ...prev]);
        toast.success("Task added to sprint & synced to Client Portal");
        setShowTaskModal(false);
      } else {
        toast.error(res.error || "Failed to create task");
      }
    }
    setIsSyncing(false);
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const res = await deleteProjectTask(taskId);
    if (res.success) {
      toast.success("Task removed");
    } else {
      toast.error(res.error || "Failed to delete task");
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* CLEAN UNIFIED TOOLBAR: Sub-tabs (Left) + Search & Filter & CTA (Right) */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 bg-white dark:bg-[#0E0E0E] rounded-2xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Mode Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F5F5] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setViewMode("tasks")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              viewMode === "tasks"
                ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-xs"
                : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Sprint Task Board
          </button>

          <button
            onClick={() => setViewMode("today-priorities")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              viewMode === "today-priorities"
                ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-xs"
                : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            What To Do First
            {todayPriorities.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                {todayPriorities.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setViewMode("projects-overview")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              viewMode === "projects-overview"
                ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-xs"
                : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Project Stages ({syncedProjects.length})
          </button>
        </div>

        {/* Right: Controls aligned in single line */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between lg:justify-end w-full lg:w-auto">
          {/* Custom Project Selector Dropdown */}
          <div className="w-48 sm:w-56 shrink-0">
            <ProjectSelectDropdown
              projects={syncedProjects}
              selectedId={selectedProjectId}
              onSelect={setSelectedProjectId}
              allLabel="All Active Projects"
            />
          </div>

          {/* Priority Filter */}
          {viewMode === "tasks" && (
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs font-medium py-2 px-3 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#141414] text-[#0A0A0A] dark:text-white outline-none cursor-pointer shrink-0"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="Critical">Critical Task</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          )}

          {/* Search Input */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#141414] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-black dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Add Task Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenCreate("Todo")}
            className="flex items-center gap-1.5 shadow-xs shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE PROJECT BANNER (If a single project is selected) */}
      {/* ========================================================================= */}
      {activeProject && (
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-[#141414] dark:to-[#181818] rounded-2xl border border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-[#202020] border border-[#E5E5E5] dark:border-[#333333] text-[#0A0A0A] dark:text-white">
                {activeProject.category || "Deliverable"}
              </span>
              <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">{activeProject.title}</span>
              <span className="text-xs text-[#737373]">— {activeProject.client}</span>
            </div>
            <p className="text-[11px] text-[#737373] dark:text-neutral-400">
              Sprint deliverables auto-syncing in real-time with the Client Portal.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-[10px] text-[#737373] font-semibold">Sprint Progress</div>
              <div className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                {taskStats.completed} / {taskStats.total} tasks ({taskStats.progressPercent}%)
              </div>
            </div>
            <div className="w-24 h-2 rounded-full bg-[#E5E5E5] dark:bg-[#262626] overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${taskStats.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE PRIORITY LEGEND */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs py-1 px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0A0A0A] dark:text-white tracking-tight">Kanban Board</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#737373]">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-1.5 rounded-sm bg-rose-500"></span> Urgent
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-1.5 rounded-sm bg-amber-500"></span> High
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-1.5 rounded-sm bg-indigo-500"></span> Medium
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-1.5 rounded-sm bg-emerald-500"></span> Low
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-1.5 rounded-sm bg-black dark:bg-white"></span> Critical Task
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SPRINT TASK BOARD (5 Compact Template Lanes) */}
      {/* ========================================================================= */}
      {viewMode === "tasks" && (
        <div className="space-y-4">
          {/* Mobile-Only Lane Quick Switcher Tabs (375px+ phones) */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveMobileLane("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMobileLane === "all"
                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                  : "bg-[#F5F5F5] dark:bg-[#161616] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white border border-[#E5E5E5] dark:border-[#262626]"
              }`}
            >
              <span>All Lanes</span>
              <span className="text-[10px] font-mono opacity-80">({filteredTasks.length})</span>
            </button>
            {KANBAN_LANES.map((lane) => {
              const count = (tasksByLane[lane.id] || []).length;
              return (
                <button
                  key={lane.id}
                  onClick={() => setActiveMobileLane(lane.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeMobileLane === lane.id
                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                      : "bg-[#F5F5F5] dark:bg-[#161616] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white border border-[#E5E5E5] dark:border-[#262626]"
                  }`}
                >
                  <span>{lane.title}</span>
                  <span className="text-[10px] font-mono opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
            {KANBAN_LANES.filter((lane) => activeMobileLane === "all" || activeMobileLane === lane.id).map((lane) => {
              const laneTasks = tasksByLane[lane.id] || [];

            return (
              <div
                key={lane.id}
                className={`bg-[#F9F9F9] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] border-t-4 ${lane.borderClass} rounded-2xl p-3.5 space-y-3 min-h-[460px] shadow-xs flex flex-col`}
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA] dark:border-[#222222]">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[11px] font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">
                      {lane.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${lane.bgBadge} ${lane.textBadge}`}>
                      {laneTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenCreate(lane.id)}
                    className="p-1 rounded-md text-[#737373] hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#202020] transition-colors cursor-pointer"
                    title={`Add task to ${lane.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Compact Task Cards Stack */}
                <div className="space-y-2 flex-1">
                  {laneTasks.length > 0 ? (
                    laneTasks.map((task) => {
                      const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG["Medium"];
                      const urgencyInfo = evaluateTaskUrgency(task.dueDate, task.priority);
                      const currentLaneIndex = KANBAN_LANES.findIndex((l) => l.id === task.status);

                      return (
                        <div
                          key={task.id}
                          className="p-3 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#161616] hover:border-black dark:hover:border-neutral-400 transition-all shadow-xs group space-y-2 cursor-pointer"
                          onClick={() => setSelectedTaskDetail(task)}
                        >
                          {/* Top: Priority Pill + Project Tag */}
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${priorityInfo.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`}></span>
                              {priorityInfo.label}
                            </span>

                            {task.projectRel?.title && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#737373] bg-[#F5F5F5] dark:bg-[#222222] px-1.5 py-0.5 rounded max-w-[100px] truncate">
                                {task.projectRel.title}
                              </span>
                            )}
                          </div>

                          {/* Middle: Title & Optional short description */}
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white leading-snug truncate">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-[10px] text-[#737373] dark:text-neutral-400 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Assignee & Due Date Row */}
                          <div className="flex items-center justify-between text-[10px] text-[#737373] pt-1.5 border-t border-[#F0F0F0] dark:border-[#222222]">
                            <div className="flex items-center gap-1 truncate max-w-[95px]">
                              <User className="w-3 h-3 text-[#737373]" />
                              <span className="truncate">{task.assignee || "Unassigned"}</span>
                            </div>

                            {task.dueDate && (
                              <div className={`flex items-center gap-1 shrink-0 px-1.5 py-0.2 rounded text-[9px] font-medium ${urgencyInfo.badgeClass}`}>
                                <Clock className="w-2.5 h-2.5" />
                                <span>{urgencyInfo.urgencyLabel || urgencyInfo.formattedDate}</span>
                              </div>
                            )}
                          </div>

                          {/* Bottom Actions Row: View, Edit, Delete, Move arrows */}
                          <div 
                            className="flex items-center justify-between pt-1 border-t border-[#F5F5F5] dark:border-[#202020]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1">
                              {/* View Details Button */}
                              <button
                                onClick={() => setSelectedTaskDetail(task)}
                                className="p-1 text-[#737373] hover:text-black dark:hover:text-white rounded hover:bg-[#F0F0F0] dark:hover:bg-[#222222] transition-colors"
                                title="View Full Details"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEdit(task)}
                                className="p-1 text-[#737373] hover:text-black dark:hover:text-white rounded hover:bg-[#F0F0F0] dark:hover:bg-[#222222] transition-colors"
                                title="Edit Task"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-[#737373] hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Move Status Buttons */}
                            <div className="flex items-center gap-1">
                              {currentLaneIndex > 0 && (
                                <button
                                  onClick={() => handleMoveStatus(task.id, KANBAN_LANES[currentLaneIndex - 1].id)}
                                  className="w-5 h-5 flex items-center justify-center text-[10px] font-bold border border-[#E5E5E5] dark:border-[#333333] rounded hover:bg-[#F5F5F5] dark:hover:bg-[#252525] text-[#737373] hover:text-black dark:hover:text-white transition-colors"
                                  title={`Move back to ${KANBAN_LANES[currentLaneIndex - 1].title}`}
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                              )}
                              {currentLaneIndex < KANBAN_LANES.length - 1 && (
                                <button
                                  onClick={() => handleMoveStatus(task.id, KANBAN_LANES[currentLaneIndex + 1].id)}
                                  className="w-5 h-5 flex items-center justify-center text-[10px] font-bold border border-[#E5E5E5] dark:border-[#333333] rounded hover:bg-[#F5F5F5] dark:hover:bg-[#252525] text-[#0A0A0A] dark:text-white transition-colors"
                                  title={`Advance to ${KANBAN_LANES[currentLaneIndex + 1].title}`}
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-[10px] text-[#A3A3A3] dark:text-neutral-500 border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-xl flex flex-col items-center justify-center gap-1.5">
                      <span>No tasks in this lane</span>
                      <button
                        onClick={() => handleOpenCreate(lane.id)}
                        className="text-[10px] text-[#0A0A0A] dark:text-white font-bold underline cursor-pointer"
                      >
                        + Add Task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: WHAT TO DO FIRST (TODAY'S PRIORITIES - SMART DUAL RANKING) */}
      {/* ========================================================================= */}
      {viewMode === "today-priorities" && (
        <Card className="overflow-hidden !p-0 rounded-2xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs">
          <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] bg-[#FDFDFD] dark:bg-[#121212] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Smart Action Priority Matrix
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Automatically ranked by <strong>target calendar due date</strong> and <strong>priority level</strong> so you know what to execute first.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg">
              {todayPriorities.length} Active Tasks Pending
            </span>
          </div>

          <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
            {todayPriorities.length > 0 ? (
              todayPriorities.map((task: any, idx: number) => {
                const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG["Medium"];
                const urgency = task.urgency || evaluateTaskUrgency(task.dueDate, task.priority);

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      urgency.isOverdue 
                        ? "bg-rose-500/5 hover:bg-rose-500/10" 
                        : urgency.isToday 
                        ? "bg-amber-500/5 hover:bg-amber-500/10" 
                        : "hover:bg-[#F9F9F9] dark:hover:bg-[#161616]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center w-7 shrink-0">
                        <span className="text-xs font-mono font-bold text-[#737373]">
                          #{idx + 1}
                        </span>
                        {idx === 0 && (
                          <span className="text-[8px] font-bold uppercase text-amber-600 dark:text-amber-400">
                            TOP
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Priority badge */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${priorityInfo.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`}></span>
                            {priorityInfo.label}
                          </span>

                          {/* Time urgency smart chip */}
                          {task.dueDate ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${urgency.badgeClass}`}>
                              {urgency.isOverdue && <AlertTriangle className="w-2.5 h-2.5" />}
                              {urgency.isToday && <Clock className="w-2.5 h-2.5" />}
                              <span>{urgency.urgencyLabel || urgency.formattedDate}</span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-[#737373] bg-[#F0F0F0] dark:bg-[#202020] px-1.5 py-0.5 rounded">
                              No deadline
                            </span>
                          )}

                          {/* Project Tag */}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] bg-[#F0F0F0] dark:bg-[#222222] px-2 py-0.5 rounded">
                            {task.projectRel?.title || "Deliverable"}
                          </span>

                          {/* Current Lane */}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                            {task.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-[11px] text-[#737373] dark:text-neutral-400">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedTaskDetail(task)}
                        className="p-1.5 text-xs font-semibold rounded-lg border border-[#E5E5E5] dark:border-[#333333] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] text-[#0A0A0A] dark:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                      <select
                        value={task.status}
                        onChange={(e) => handleMoveStatus(task.id, e.target.value as any)}
                        className="text-xs font-bold py-1.5 px-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#333333] bg-white dark:bg-[#202020] text-[#0A0A0A] dark:text-white cursor-pointer"
                      >
                        {KANBAN_LANES.map((lane) => (
                          <option key={lane.id} value={lane.id}>
                            {lane.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-[#737373]">
                All priority tasks completed.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ALL PROJECTS HIGH-LEVEL LIFECYCLE OVERVIEW */}
      {/* ========================================================================= */}
      {viewMode === "projects-overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {[
            { id: "Planning", title: "Planning & Architecture", color: "border-t-blue-500" },
            { id: "In Progress", title: "Active Sprint Development", color: "border-t-amber-500" },
            { id: "In Review", title: "QA & Client Acceptance", color: "border-t-purple-500" },
            { id: "Completed", title: "Delivered & Live", color: "border-t-emerald-500" },
          ].map((col) => {
            const colProjects = syncedProjects.filter((p) => {
              if (col.id === "Completed") return p.status === "Completed" || p.progress === 100;
              if (col.id === "In Review") return p.status === "In Review";
              if (col.id === "Planning") return p.status === "Planning" || p.progress < 20;
              return p.status === "In Progress" || p.status === "On Track" || (p.progress >= 20 && p.progress < 100);
            });

            return (
              <div
                key={col.id}
                className={`bg-[#F9F9F9] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] border-t-4 ${col.color} rounded-2xl p-4 space-y-3 shadow-xs`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#EBEBEB] dark:border-[#222222]">
                  <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-white">{col.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#202020] text-[#737373]">
                    {colProjects.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colProjects.length > 0 ? (
                    colProjects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          setSelectedProjectId(proj.id);
                          setViewMode("tasks");
                        }}
                        className="p-3 space-y-2 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#161616] hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-xs group"
                      >
                        {/* Top: Category Tag + Progress % */}
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#737373] bg-[#F5F5F5] dark:bg-[#222222] px-1.5 py-0.5 rounded max-w-[120px] truncate">
                            {proj.category || "Deliverable"}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#0A0A0A] dark:text-white">
                            {proj.progress || 0}%
                          </span>
                        </div>

                        {/* Title & Client */}
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white truncate">
                            {proj.title}
                          </h4>
                          <p className="text-[10px] text-[#737373] truncate">
                            Client: {proj.client || "Unassigned"}
                          </p>
                        </div>

                        {/* Slim Progress Bar */}
                        <div className="w-full h-1 bg-[#EAEAEA] dark:bg-[#262626] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0A0A0A] dark:bg-white rounded-full transition-all duration-300"
                            style={{ width: `${proj.progress || 0}%` }}
                          />
                        </div>

                        {/* Footer: Timeline & Open Tasks CTA */}
                        <div className="flex items-center justify-between text-[10px] text-[#737373] pt-1.5 border-t border-[#F0F0F0] dark:border-[#222222]">
                          <span className="truncate max-w-[110px]">
                            {formatProjectDeadline(proj.deadline).dateRange}
                          </span>
                          <span className="font-bold text-[#0A0A0A] dark:text-white group-hover:underline flex items-center gap-0.5 shrink-0">
                            Open Tasks <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-xs text-[#A3A3A3] border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-xl">
                      No active projects in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW TASK FULL DETAILS */}
      {/* ========================================================================= */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-thin">
            <div className="flex items-start justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                    (PRIORITY_CONFIG[selectedTaskDetail.priority] || PRIORITY_CONFIG["Medium"]).badge
                  }`}>
                    {(PRIORITY_CONFIG[selectedTaskDetail.priority] || PRIORITY_CONFIG["Medium"]).label}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] bg-[#F0F0F0] dark:bg-[#202020] px-2 py-0.5 rounded">
                    {selectedTaskDetail.projectRel?.title || "Deliverable"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white mt-1.5">
                  {selectedTaskDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskDetail(null)}
                className="p-1.5 text-[#737373] hover:text-black dark:hover:text-white rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#202020]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Description */}
              <div>
                <span className="font-bold text-[#737373] block mb-1">Task Scope & Acceptance Criteria:</span>
                <p className="text-[#0A0A0A] dark:text-neutral-200 bg-[#F9F9F9] dark:bg-[#161616] p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] leading-relaxed">
                  {selectedTaskDetail.description || "No specific detailed scope notes attached to this task."}
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-0.5">
                  <span className="text-[10px] text-[#737373] font-semibold block">Sprint Lane</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white">{selectedTaskDetail.status}</span>
                </div>

                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-0.5">
                  <span className="text-[10px] text-[#737373] font-semibold block">Assignee</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white">{selectedTaskDetail.assignee || "Unassigned"}</span>
                </div>

                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-0.5">
                  <span className="text-[10px] text-[#737373] font-semibold block">Target Due Date</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#737373]" />
                    {selectedTaskDetail.dueDate ? evaluateTaskUrgency(selectedTaskDetail.dueDate, selectedTaskDetail.priority).formattedDate : "Flexible"}
                  </span>
                </div>

                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-0.5">
                  <span className="text-[10px] text-[#737373] font-semibold block">Client Portal Sync</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Live Synced</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
              <button
                onClick={() => {
                  const idToDelete = selectedTaskDetail.id;
                  setSelectedTaskDetail(null);
                  handleDeleteTask(idToDelete);
                }}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Delete Task
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const taskToEdit = selectedTaskDetail;
                    setSelectedTaskDetail(null);
                    handleOpenEdit(taskToEdit);
                  }}
                >
                  Edit Task
                </Button>
                <Button variant="primary" size="sm" onClick={() => setSelectedTaskDetail(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT SPRINT TASK (WITH CALENDAR DATE PICKER) */}
      {/* ========================================================================= */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-thin">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                {editingTask ? "Edit Sprint Task / Todo" : "Create New Sprint Task / Todo"}
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1.5 text-[#737373] hover:text-black dark:hover:text-white rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#202020]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4 text-xs">
              {/* Project Selection */}
              <div>
                <label className="block font-bold text-[#737373] mb-1">Target Project *</label>
                <select
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#161616] text-[#0A0A0A] dark:text-white font-semibold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  required
                >
                  {syncedProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} — {p.client || "Client"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Title */}
              <div>
                <label className="block font-bold text-[#737373] mb-1">Task Title / Todo *</label>
                <input
                  type="text"
                  placeholder="e.g., Integrate OAuth 2.0 & NextAuth Session"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-medium"
                  required
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block font-bold text-[#737373] mb-1">Scope & Details (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Provide technical scope, acceptance criteria, or design links..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                />
              </div>

              {/* Priority & Lane Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#737373] mb-1">Priority Tag</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#161616] text-[#0A0A0A] dark:text-white font-semibold outline-none"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical Task</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#737373] mb-1">Kanban Sprint Lane</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#161616] text-[#0A0A0A] dark:text-white font-semibold outline-none"
                  >
                    {KANBAN_LANES.map((lane) => (
                      <option key={lane.id} value={lane.id}>
                        {lane.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignee & Target Calendar Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#737373] mb-1">Assignee</label>
                  <input
                    type="text"
                    placeholder="e.g., Suman / Lead Dev"
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#161616] text-[#0A0A0A] dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#737373] mb-1">Target Due Date</label>
                  <DatePicker
                    value={taskForm.dueDate}
                    onChange={(dateStr) => setTaskForm({ ...taskForm, dueDate: dateStr })}
                    placeholder="Select due date..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSyncing}>
                  {isSyncing ? "Saving..." : editingTask ? "Save Changes" : "Create & Sync Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
