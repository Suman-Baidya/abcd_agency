"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Plus, Edit, Trash2, X, Check, Loader2, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/(dashboard)/admin/projects/actions";

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories = [] }: CategoryManagerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Custom alert / Delete confirmation popup state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync prop changes from server
  useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  const handleCloseModal = () => {
    setIsOpen(false);
    setCategoryToDelete(null);
    setEditingId(null);
    // Non-blocking sync with server in background
    router.refresh();
  };

  // Handle Create Category with Instant Optimistic UI & Toast
  const handleCreate = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error("Please enter a category name", { duration: 3000 });
      return;
    }

    // Instant local duplicate check (0ms response)
    const exists = categoryList.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      toast.error(`Category "${trimmed}" already exists`, { duration: 3500 });
      return;
    }

    // Optimistic item added instantly to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticCategory: Category = {
      id: tempId,
      name: trimmed,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNewCategoryName("");
    setCategoryList((prev) =>
      [...prev, optimisticCategory].sort((a, b) => a.name.localeCompare(b.name))
    );
    setIsCreating(true);

    const toastId = toast.loading(`Saving "${trimmed}"...`);

    try {
      const res = await createCategory(trimmed);
      if (res.success && res.category) {
        setCategoryList((prev) =>
          prev.map((c) => (c.id === tempId ? (res.category as Category) : c))
        );
        toast.success(`Category "${res.category.name}" created!`, {
          id: toastId,
          duration: 3500,
        });
      } else {
        // Rollback optimistic item on failure
        setCategoryList((prev) => prev.filter((c) => c.id !== tempId));
        toast.error(res.error || "Failed to create category", {
          id: toastId,
          duration: 4000,
        });
      }
    } catch (err: any) {
      setCategoryList((prev) => prev.filter((c) => c.id !== tempId));
      toast.error(err.message || "Failed to create category", {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Update Category with Optimistic UI & Toast
  const handleUpdate = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty", { duration: 3000 });
      return;
    }

    const currentCat = categoryList.find((c) => c.id === id);
    if (currentCat && currentCat.name === trimmed) {
      setEditingId(null);
      return;
    }

    const oldName = currentCat?.name || "";
    setEditingId(null);

    // Optimistic update
    setCategoryList((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, name: trimmed } : c))
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    const toastId = toast.loading(`Renaming category...`);

    try {
      const res = await updateCategory(id, trimmed);
      if (res.success && res.category) {
        setCategoryList((prev) =>
          prev.map((c) => (c.id === id ? (res.category as Category) : c))
        );
        toast.success(`Category renamed to "${trimmed}"!`, {
          id: toastId,
          duration: 3500,
        });
      } else {
        // Rollback
        setCategoryList((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name: oldName } : c))
        );
        toast.error(res.error || "Failed to update category", {
          id: toastId,
          duration: 4000,
        });
      }
    } catch (err: any) {
      setCategoryList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: oldName } : c))
      );
      toast.error(err.message || "Failed to update category", {
        id: toastId,
        duration: 4000,
      });
    }
  };

  // Handle Confirmed Delete with Optimistic UI & Toast
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    const cat = categoryToDelete;
    setIsDeleting(true);

    // Optimistic removal
    setCategoryList((prev) => prev.filter((c) => c.id !== cat.id));
    const toastId = toast.loading(`Deleting "${cat.name}"...`);

    try {
      const res = await deleteCategory(cat.id);
      if (res.success) {
        setCategoryToDelete(null);
        toast.success(`Category "${cat.name}" deleted successfully!`, {
          id: toastId,
          duration: 3500,
        });
      } else {
        // Rollback
        setCategoryList((prev) =>
          [...prev, cat].sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.error(res.error || "Failed to delete category", {
          id: toastId,
          duration: 4000,
        });
      }
    } catch (err: any) {
      setCategoryList((prev) =>
        [...prev, cat].sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.error(err.message || "Failed to delete category", {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        id="projects-category-button"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto text-xs justify-center cursor-pointer gap-1.5"
      >
        <Tag className="w-3.5 h-3.5" />
        <span>Work Categories</span>
      </Button>

      {/* Main Slide-over Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title="Manage Work Categories"
        variant="slide-over"
      >
        <div className="flex flex-col h-full">
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            {/* Add New Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                Add New Category
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. E-Commerce, SaaS, Mobile App"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isCreating) {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  disabled={isCreating}
                  className="flex-1 text-xs sm:text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-[#FBFBFB] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white px-3.5 py-2.5 focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none transition-colors"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreate}
                  disabled={isCreating || !newCategoryName.trim()}
                  className="shrink-0 cursor-pointer"
                >
                  {isCreating ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  <span>Add</span>
                </Button>
              </div>
            </div>

            {/* Existing Categories List */}
            <div className="border-t border-[#E5E5E5] dark:border-[#262626] pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                  Existing Categories ({categoryList.length})
                </h3>
              </div>

              {categoryList.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-[#FBFBFB] dark:bg-[#111111] space-y-1">
                  <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                    No categories created yet
                  </p>
                  <p className="text-[11px] text-[#737373] dark:text-neutral-400">
                    Add categories to organize portfolio projects and case studies.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {categoryList.map((cat) => (
                    <li
                      key={cat.id}
                      className="group flex items-center justify-between p-3 border border-[#E5E5E5] dark:border-[#262626] rounded-xl hover:bg-[#FBFBFB] dark:hover:bg-[#141414] transition-all bg-white dark:bg-[#111111]"
                    >
                      {editingId === cat.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdate(cat.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="flex-1 text-xs sm:text-sm border border-[#0A0A0A] dark:border-white rounded-lg bg-transparent text-[#0A0A0A] dark:text-white px-2.5 py-1.5 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdate(cat.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg cursor-pointer transition-colors"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-[#737373] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-lg cursor-pointer transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-[#0A0A0A] dark:text-white truncate">
                              {cat.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(cat.id);
                                setEditName(cat.name);
                              }}
                              className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-lg transition-colors cursor-pointer"
                              title="Rename category"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoryToDelete(cat)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete category"
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
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Standalone Custom Alert / Confirmation Popup via React Portal */}
      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => !isDeleting && setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description={
          categoryToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <strong className="text-[#0A0A0A] dark:text-white font-semibold">
                &ldquo;{categoryToDelete.name}&rdquo;
              </strong>
              ? This action is permanent and will remove it from category filters and project tags.
            </span>
          ) : null
        }
        confirmLabel="Delete Category"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
