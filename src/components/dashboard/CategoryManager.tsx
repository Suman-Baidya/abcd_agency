"use client";

import React, { useState, useTransition } from "react";
import { Category } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/app/(dashboard)/admin/projects/actions";

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createCategory(newCategoryName);
      if (res.success) {
        setNewCategoryName("");
      } else {
        setError(res.error || "Failed to create");
      }
    });
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await updateCategory(id, editName);
      if (res.success) {
        setEditingId(null);
      } else {
        setError(res.error || "Failed to update");
      }
    });
  };

  const handleDelete = async (id: string) => {
    setError(null);
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (!res.success) {
        setError(res.error || "Failed to delete");
      }
    });
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setIsOpen(true)} className="w-full sm:w-auto text-xs justify-center">
        Work Category
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Manage Categories"
        variant="slide-over"
      >
        <div className="flex flex-col h-full">
          <div className="space-y-6 flex-1 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}

            {/* Add New Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#0A0A0A] dark:text-white">Add New Category</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. E-Commerce"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  disabled={isPending}
                  className="flex-1 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-3 py-2 focus:border-[#0A0A0A] dark:focus:border-white outline-none transition-colors"
                />
                <Button variant="primary" size="sm" onClick={handleCreate} disabled={isPending || !newCategoryName.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            <div className="border-t border-[#E5E5E5] dark:border-[#262626] pt-6 space-y-3">
              <h3 className="text-xs font-bold text-[#737373] dark:text-neutral-400 uppercase tracking-wider mb-2">
                Existing Categories
              </h3>

              {categories.length === 0 ? (
                <p className="text-sm text-[#737373] italic">No categories created yet.</p>
              ) : (
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id} className="flex items-center justify-between p-3 border border-[#E5E5E5] dark:border-[#262626] rounded-md hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors">
                      {editingId === cat.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                            disabled={isPending}
                            className="flex-1 text-sm border border-[#0A0A0A] dark:border-white rounded-md bg-transparent text-[#0A0A0A] dark:text-white px-2 py-1 outline-none"
                          />
                          <button onClick={() => handleUpdate(cat.id)} disabled={isPending} className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} disabled={isPending} className="p-1 text-[#737373] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-md">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-[#0A0A0A] dark:text-white">
                            {cat.name}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                            <button
                              onClick={() => { setEditingId(cat.id); setEditName(cat.name); setError(null); }}
                              disabled={isPending}
                              className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-md transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              disabled={isPending}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
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
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
