"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "react-hot-toast";
import { ImageUploadInput } from "@/components/ui/ImageUploadInput";
import { MultiImageUploadInput } from "@/components/ui/MultiImageUploadInput";
import {
  createEcoSystemPlatform,
  updateEcoSystemPlatform,
  deleteEcoSystemPlatform,
  toggleEcoSystemPublish,
} from "@/app/(dashboard)/admin/ecosystem/actions";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  Globe,
  CheckCircle2,
  Users,
  Cpu,
  KeyRound,
} from "lucide-react";

interface PlatformItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  status: string;
  statusColor?: string | null;
  appUrl?: string | null;
  demoEmail?: string | null;
  demoPassword?: string | null;
  thumbnailUrl?: string | null;
  screenshots?: string[];
  features: string[];
  techStack: string[];
  targetAudience?: string | null;
  pricingModel?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  order: number;
  createdAt: string;
}

interface EcoSystemManagerProps {
  initialPlatforms: PlatformItem[];
}

export function EcoSystemManager({ initialPlatforms }: EcoSystemManagerProps) {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<PlatformItem[]>(initialPlatforms);

  useEffect(() => {
    setPlatforms(initialPlatforms);
  }, [initialPlatforms]);

  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PlatformItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("AI Automation");
  const [status, setStatus] = useState("Live Platform");
  const [appUrl, setAppUrl] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoPassword, setDemoPassword] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState("");
  const [pricingModel, setPricingModel] = useState("SaaS & Custom White-Label Licensing");
  const [featuresText, setFeaturesText] = useState("");
  const [techStackText, setTechStackText] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const openCreateModal = () => {
    setEditingPlatform(null);
    setName("");
    setSlug("");
    setTagline("");
    setDescription("");
    setCategory("EdTech SaaS");
    setStatus("Live Platform");
    setAppUrl("");
    setDemoEmail("");
    setDemoPassword("");
    setThumbnailUrl("");
    setScreenshots([]);
    setTargetAudience("Schools, Universities, Coaching Centers, Online Academies");
    setPricingModel("SaaS & Custom White-Label Licensing");
    setFeaturesText("");
    setTechStackText("Next.js 15, PostgreSQL, Google Gemini AI, Tailwind CSS");
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PlatformItem) => {
    setEditingPlatform(p);
    setName(p.name);
    setSlug(p.slug);
    setTagline(p.tagline);
    setDescription(p.description);
    setCategory(p.category);
    setStatus(p.status);
    setAppUrl(p.appUrl || "");
    setDemoEmail(p.demoEmail || "");
    setDemoPassword(p.demoPassword || "");
    setThumbnailUrl(p.thumbnailUrl || "");
    setScreenshots(Array.isArray(p.screenshots) ? p.screenshots : []);
    setTargetAudience(p.targetAudience || "");
    setPricingModel(p.pricingModel || "SaaS & Custom White-Label Licensing");
    setFeaturesText((p.features || []).join("\n"));
    setTechStackText((p.techStack || []).join(", "));
    setIsPublished(p.isPublished);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("isPublished", isPublished ? "true" : "false");
    formData.set("screenshots", screenshots.join("\n"));

    // If thumbnail is empty but we have screenshots, use the first screenshot
    const formThumbnail = (formData.get("thumbnailUrl") as string)?.trim();
    if (!formThumbnail && screenshots.length > 0) {
      formData.set("thumbnailUrl", screenshots[0]);
    }

    startTransition(async () => {
      try {
        if (editingPlatform) {
          await updateEcoSystemPlatform(editingPlatform.id, formData);
          toast.success("Platform updated successfully", { duration: 3500 });
        } else {
          await createEcoSystemPlatform(formData);
          toast.success("Platform created successfully", { duration: 3500 });
        }
        setIsModalOpen(false);
        router.refresh();
      } catch (err: any) {
        toast.error(err?.message || "Failed to save platform", { duration: 4000 });
      }
    });
  };

  const handleDelete = (id: string) => {
    // Optimistic removal
    setPlatforms((prev) => prev.filter((p) => p.id !== id));
    startTransition(async () => {
      try {
        await deleteEcoSystemPlatform(id);
        setDeleteConfirmId(null);
        toast.success("Platform deleted successfully", { duration: 3500 });
        router.refresh();
      } catch (err: any) {
        setPlatforms(initialPlatforms);
        toast.error(err?.message || "Failed to delete platform", { duration: 4000 });
      }
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    const nextPublished = !current;
    // Immediate optimistic update so button toggle reflects right away
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPublished: nextPublished } : p))
    );

    startTransition(async () => {
      try {
        await toggleEcoSystemPublish(id, nextPublished);
        router.refresh();
        toast.success(
          nextPublished ? "Platform published to public showcase" : "Platform set to Draft (hidden from showcase)",
          { duration: 3000 }
        );
      } catch (err: any) {
        // Rollback state if server action fails
        setPlatforms((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isPublished: current } : p))
        );
        toast.error(err?.message || "Failed to update platform visibility", { duration: 4000 });
      }
    });
  };

  // Filtered platforms from reactive state
  const filtered = platforms.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.targetAudience && p.targetAudience.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", "EdTech SaaS", "AI Automation", "Marketing Engine", "Enterprise Software"];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div id="admin-ecosystem-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Ecosys Platforms &amp; Software
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Manage and publish proprietary software, AI tools, and multi-tenant platforms.
          </p>
        </div>

        <Button
          id="admin-ecosystem-create-btn"
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          className="shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Platform</span>
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div id="admin-ecosystem-kpis" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111]">
          <p className="text-[11px] font-mono uppercase text-[#737373] dark:text-neutral-400">
            Total Platforms
          </p>
          <p className="text-2xl font-bold text-[#0A0A0A] dark:text-white mt-1">
            {platforms.length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111]">
          <p className="text-[11px] font-mono uppercase text-[#737373] dark:text-neutral-400">
            Live Public Apps
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {platforms.filter((p) => p.isPublished).length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111]">
          <p className="text-[11px] font-mono uppercase text-[#737373] dark:text-neutral-400">
            AI Automations
          </p>
          <p className="text-2xl font-bold text-[#0A0A0A] dark:text-white mt-1">
            {platforms.filter((p) => p.category.includes("AI")).length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111]">
          <p className="text-[11px] font-mono uppercase text-[#737373] dark:text-neutral-400">
            Draft / Staging
          </p>
          <p className="text-2xl font-bold text-[#737373] dark:text-neutral-400 mt-1">
            {platforms.filter((p) => !p.isPublished).length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div id="admin-ecosystem-filter-bar" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === c
                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]"
                  : "border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platforms..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>
      </div>

      {/* Data Table Container - Zero Horizontal Scroll */}
      <div id="admin-ecosystem-table" className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden shadow-2xs w-full">
        {/* Desktop & Tablet Table (Strictly Fixed Columns, No Horizontal Scroll) */}
        <div className="hidden sm:block w-full overflow-hidden">
          <table className="table-fixed w-full border-collapse text-left text-xs sm:text-sm text-[#262626] dark:text-neutral-300">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] dark:text-[#A3A3A3] bg-[#F9F9F9] dark:bg-[#0E0E0E] border-b border-[#E5E5E5] dark:border-[#262626]">
                <th style={{ width: "28%" }} className="w-[28%] px-4 py-3 text-left">Platform</th>
                <th style={{ width: "14%" }} className="w-[14%] px-3 py-3 text-left whitespace-nowrap">Category</th>
                <th style={{ width: "16%" }} className="w-[16%] px-3 py-3 text-left whitespace-nowrap">Status</th>
                <th style={{ width: "24%" }} className="w-[24%] px-3 py-3 text-left">Target Audience</th>
                <th style={{ width: "9%" }} className="w-[9%] px-2 py-3 text-center whitespace-nowrap">Visibility</th>
                <th style={{ width: "9%" }} className="w-[9%] px-3 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAFAFA] dark:hover:bg-[#161616] transition-colors">
                    {/* Platform Info */}
                    <td style={{ width: "28%" }} className="px-4 py-3 max-w-0 overflow-hidden">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.thumbnailUrl ? (
                          <div className="relative w-8 h-8 rounded-md border border-[#E5E5E5] dark:border-[#262626] overflow-hidden bg-black shrink-0">
                            <Image src={item.thumbnailUrl} alt="" fill sizes="32px" className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center text-[#737373] text-[10px] font-mono font-bold shrink-0">
                            {item.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="font-semibold text-xs sm:text-sm text-[#0A0A0A] dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#737373] dark:text-neutral-400 truncate">
                            {item.tagline}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-[#737373]">
                            <span>📷 {item.screenshots?.length || (item.thumbnailUrl ? 1 : 0)} slides</span>
                            <span>·</span>
                            <span>✓ {item.features?.length || 0} features</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category - Strictly One Line */}
                    <td style={{ width: "14%" }} className="px-3 py-3 whitespace-nowrap overflow-hidden">
                      <span className="text-xs font-mono text-[#0A0A0A] dark:text-neutral-300 whitespace-nowrap inline-block">
                        {item.category}
                      </span>
                    </td>

                    {/* Status - Strictly One Line */}
                    <td style={{ width: "16%" }} className="px-3 py-3 whitespace-nowrap overflow-hidden">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium font-mono whitespace-nowrap bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="whitespace-nowrap">{item.status}</span>
                      </span>
                    </td>

                    {/* Target Audience - Truncated with Ellipsis (Dot Dot) */}
                    <td style={{ width: "24%" }} className="px-3 py-3 max-w-0 overflow-hidden" title={item.targetAudience || ""}>
                      <div className="truncate text-xs text-[#737373] dark:text-neutral-400 block">
                        {item.targetAudience || "General B2B"}
                      </div>
                    </td>

                    {/* Visibility Toggle */}
                    <td style={{ width: "9%" }} className="px-2 py-3 text-center whitespace-nowrap overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item.id, item.isPublished)}
                        disabled={isPending}
                        className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          item.isPublished
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700"
                        }`}
                        title="Toggle visibility on public /ecosystem"
                      >
                        {item.isPublished ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ width: "9%" }} className="px-3 py-3 text-right whitespace-nowrap overflow-hidden">
                      <div className="inline-flex items-center justify-end gap-1">
                        {item.appUrl && (
                          <a
                            href={item.appUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
                            title="Visit live platform"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-md text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors cursor-pointer"
                          title="Edit platform"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Delete platform"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#737373]">
                    No platforms found. Click &quot;New Platform&quot; to add your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Stacked Cards (Zero Horizontal Scroll on Phones) */}
        <div className="sm:hidden divide-y divide-[#E5E5E5] dark:divide-[#262626]">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.thumbnailUrl ? (
                      <div className="relative w-8 h-8 rounded-md border border-[#E5E5E5] dark:border-[#262626] overflow-hidden bg-black shrink-0">
                        <Image src={item.thumbnailUrl} alt="" fill sizes="32px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center text-[#737373] text-[10px] font-mono font-bold shrink-0">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[#0A0A0A] dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#737373] dark:text-neutral-400 truncate">
                        {item.category} · 📷 {item.screenshots?.length || (item.thumbnailUrl ? 1 : 0)} slides · ✓ {item.features?.length || 0} feats
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{item.status}</span>
                  </span>
                </div>

                {item.targetAudience && (
                  <p className="text-[11px] text-[#737373] dark:text-neutral-400 truncate" title={item.targetAudience}>
                    Target: {item.targetAudience}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item.id, item.isPublished)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                      item.isPublished
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700"
                    }`}
                  >
                    {item.isPublished ? "Public" : "Draft"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {item.appUrl && (
                      <a
                        href={item.appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-md text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                        title="Visit platform"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1 rounded-md text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                      title="Edit platform"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1 rounded-md text-red-600 hover:text-red-700"
                      title="Delete platform"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-[#737373]">
              No platforms found. Click &quot;New Platform&quot; to add your first one.
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Platform Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlatform ? `Edit Platform: ${editingPlatform.name}` : "Create New Software Platform"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="space-y-4 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                Platform Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. EduExam Cloud or AutomateGrowth AI"
                className="w-full text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                One-Line Tagline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                required
                placeholder="e.g. Multi-Tenant Student Examination & Assessment Engine"
                className="w-full text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                Category
              </label>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                <option value="EdTech SaaS">EdTech SaaS</option>
                <option value="Marketing Automation">Marketing Automation</option>
                <option value="AI Automation">AI Automation</option>
                <option value="Enterprise Software">Enterprise Software</option>
                <option value="FinTech Engine">FinTech Engine</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                Status Badge
              </label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                <option value="Live Platform">Live Platform</option>
                <option value="Enterprise Ready">Enterprise Ready</option>
                <option value="Private Beta">Private Beta</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white flex items-center justify-between">
                <span>Target Audience & Category List (Comma-separated)</span>
                <span className="text-[10px] font-mono text-[#737373]">Shown as tags on card</span>
              </label>
              <input
                type="text"
                name="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Schools, Universities, Coaching Centers, Online Academies"
                className="w-full text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-[#737373]">Presets:</span>
                <button
                  type="button"
                  onClick={() => setTargetAudience("Schools, Universities, Coaching Centers, Online Academies")}
                  className="px-2 py-0.5 rounded border border-[#E5E5E5] dark:border-[#262626] hover:bg-[#F5F5F5] dark:hover:bg-[#262626] cursor-pointer"
                >
                  EdTech
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAudience("Digital Agencies, E-Commerce Brands, B2B Sales Teams")}
                  className="px-2 py-0.5 rounded border border-[#E5E5E5] dark:border-[#262626] hover:bg-[#F5F5F5] dark:hover:bg-[#262626] cursor-pointer"
                >
                  Marketing
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAudience("Manufacturers, Wholesale Distributors, Logistics Chains")}
                  className="px-2 py-0.5 rounded border border-[#E5E5E5] dark:border-[#262626] hover:bg-[#F5F5F5] dark:hover:bg-[#262626] cursor-pointer"
                >
                  Enterprise ERP
                </button>
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                Live App or Demo URL
              </label>
              <input
                type="url"
                name="appUrl"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://eduexam.abcddigitalhub.com or https://your-app.vercel.app"
                className="w-full text-xs font-mono border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* Sandbox Credentials Control Section */}
            <div className="sm:col-span-2 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                    Live Interactive Sandbox Credentials
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                  Controls Blueprint Modal & Cards
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                Provide test/demo login credentials so visitors can test drive this platform. These credentials appear in the Interactive Blueprint modal with 1-click copy buttons.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
                    Test Login / Email
                  </label>
                  <input
                    type="text"
                    name="demoEmail"
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    placeholder="e.g. demo@abcd-exam-hub.com"
                    className="w-full text-xs font-mono border border-emerald-300 dark:border-emerald-800 rounded-md bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
                    Test Password
                  </label>
                  <input
                    type="text"
                    name="demoPassword"
                    value={demoPassword}
                    onChange={(e) => setDemoPassword(e.target.value)}
                    placeholder="e.g. demo123"
                    className="w-full text-xs font-mono border border-emerald-300 dark:border-emerald-800 rounded-md bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="sm:col-span-2 p-3.5 border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-[#FAFAFA] dark:bg-[#141414]">
              <ImageUploadInput
                name="thumbnailUrl"
                label="Primary Platform Thumbnail / Banner (Slide #1 Cover)"
                defaultValue={thumbnailUrl}
                folder="abcd_agency/ecosystem"
              />
            </div>

            {/* Multiple Showcase Screenshots for Image Slider */}
            <div className="sm:col-span-2 p-3.5 border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-[#FAFAFA] dark:bg-[#141414]">
              <MultiImageUploadInput
                name="screenshots"
                label="Multi-Image Slider Carousel Screenshots"
                initialImages={screenshots}
                onChange={setScreenshots}
                folder="abcd_agency/ecosystem"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white flex items-center justify-between">
                <span>Core Capabilities & Feature Checklist (One per line)</span>
                <span className="text-[10px] font-mono text-[#737373]">
                  {featuresText.split("\n").filter(Boolean).length} capabilities added
                </span>
              </label>
              <textarea
                name="features"
                rows={4}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="AI-Powered Question Generator & Automatic Grading&#10;Real-Time Anti-Cheat Camera & Screen Proctoring&#10;Multi-Tenant School, Teacher & Student Portals&#10;Instant Result Publishing & Granular Performance Analytics&#10;Secure Encrypted Question Banks & Bulk Excel Onboarding"
                className="w-full text-xs font-mono border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white leading-relaxed"
              />
              <p className="text-[10px] text-[#737373] dark:text-neutral-400">
                Tip: Each line appears with a checkmark in the public Ecosys card capabilities list.
              </p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                Tech Stack (Comma-separated)
              </label>
              <input
                type="text"
                name="techStack"
                value={techStackText}
                onChange={(e) => setTechStackText(e.target.value)}
                placeholder="Next.js 15, PostgreSQL, Redis, Tailwind CSS"
                className="w-full text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Comprehensive technical breakdown of how this platform solves problems for users..."
                className="w-full text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-3 pb-4">
              <input
                type="checkbox"
                id="isPublishedCheck"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded accent-black cursor-pointer"
              />
              <label htmlFor="isPublishedCheck" className="text-xs font-semibold text-[#0A0A0A] dark:text-white cursor-pointer select-none">
                Publish publicly to showcase and client portals
              </label>
            </div>
            </div>
          </div>

          {/* Static / Sticky Bottom Action Bar */}
          <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 px-4 sm:px-6 py-3.5 border-t border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] flex items-center justify-end gap-2.5 z-20 shrink-0 mt-auto">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
            >
              {isPending ? "Saving..." : editingPlatform ? "Save Changes" : "Create Platform"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal using ConfirmModal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => !isPending && setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Delete Platform"
        description={
          deleteConfirmId ? (
            <span>
              Are you sure you want to delete{" "}
              <strong className="text-[#0A0A0A] dark:text-white font-semibold">
                &ldquo;{initialPlatforms.find((p) => p.id === deleteConfirmId)?.name || "this platform"}&rdquo;
              </strong>
              ? This will remove it from the public showcase and client portals.
            </span>
          ) : null
        }
        confirmLabel="Delete Platform"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isPending}
      />
    </div>
  );
}
