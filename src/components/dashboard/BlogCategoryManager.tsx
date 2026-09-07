"use client";

import React, { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash2, X, Check, Tag, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "@/app/(dashboard)/admin/settings/blogActions";

export interface BlogCategoryItem {
  id: string;
  name: string;
}

interface BlogCategoryManagerProps {
  categories: BlogCategoryItem[];
  onCategoriesChange?: (categories: BlogCategoryItem[]) => void;
}

export function BlogCategoryManager({
  categories = [],
  onCategoriesChange,
}: BlogCategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryList, setCategoryList] = useState<BlogCategoryItem[]>(categories);
  const [isPending, startTransition] = useTransition();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync prop changes
  React.useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  const handleCreate = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setError(null);

    startTransition(async () => {
      const res = await createBlogCategory(trimmed);
      if (res.success && res.category) {
        const updated = [...categoryList, res.category as BlogCategoryItem];
        setCategoryList(updated);
        onCategoriesChange?.(updated);
        setNewCategoryName("");
        toast.success(`Category "${trimmed}" created!`);
      } else {
        const msg = res.error || "Failed to create category";
        setError(msg);
        toast.error(msg);
      }
    });
  };

  const handleUpdate = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setError(null);

    startTransition(async () => {
      const res = await updateBlogCategory(id, trimmed);
      if (res.success && res.category) {
        const updated = categoryList.map((c) =>
          c.id === id ? (res.category as BlogCategoryItem) : c
        );
        setCategoryList(updated);
        onCategoriesChange?.(updated);
        setEditingId(null);
        toast.success("Category updated!");
      } else {
        const msg = res.error || "Failed to update category";
        setError(msg);
        toast.error(msg);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    setError(null);
    startTransition(async () => {
      const res = await deleteBlogCategory(id);
      if (res.success) {
        const updated = categoryList.filter((c) => c.id !== id);
        setCategoryList(updated);
        onCategoriesChange?.(updated);
        toast.success(`Category "${name}" removed`);
      } else {
        const msg = res.error || "Failed to delete category";
        setError(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <>
      <Button
        id="blog-category-button"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-1.5 text-xs w-full sm:w-auto cursor-pointer"
      >
        <Tag className="w-3.5 h-3.5" />
        <span>Category</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Manage Blog Categories"
        variant="slide-over"
      >
        <div className="flex flex-col h-full">
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}

            {/* Add New Category Form */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
                Add New Category
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Cybersecurity, Web3, DevOps..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  disabled={isPending}
                  className="flex-1 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2.5 focus:border-[#0A0A0A] dark:focus:border-white outline-none transition-colors placeholder:text-[#737373]"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreate}
                  disabled={isPending || !newCategoryName.trim()}
                  className="shrink-0"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-[#737373]">
                Categories help organize articles across the editorial dashboard and public blog gallery.
              </p>
            </div>

            {/* Existing Categories List */}
            <div className="border-t border-[#E5E5E5] dark:border-[#262626] pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                  Active Categories
                </h3>
                <span className="text-[11px] font-mono text-[#737373]">
                  {categoryList.length} total
                </span>
              </div>

              {categoryList.length === 0 ? (
                <p className="text-xs text-[#737373] italic py-4 text-center">
                  No categories created yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {categoryList.map((cat) => (
                    <li
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors"
                    >
                      {editingId === cat.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                            disabled={isPending}
                            className="flex-1 text-xs border border-[#0A0A0A] dark:border-white rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-2 py-1 outline-none"
                          />
                          <button
                            onClick={() => handleUpdate(cat.id)}
                            disabled={isPending}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={isPending}
                            className="p-1 text-[#737373] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-md cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-[#737373]" />
                            <span className="text-xs font-medium text-[#0A0A0A] dark:text-white">
                              {cat.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingId(cat.id);
                                setEditName(cat.name);
                                setError(null);
                              }}
                              disabled={isPending}
                              className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-md transition-colors cursor-pointer"
                              title="Edit Category Name"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
                              disabled={isPending}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-[#E5E5E5] dark:border-[#262626] flex justify-end shrink-0 sticky bottom-0 z-10 bg-white dark:bg-[#0A0A0A] pb-2">
            <Button variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
