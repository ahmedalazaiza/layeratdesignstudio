"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowUpDown,
  Check,
  X,
  Loader2,
  FolderTree,
  FileCode,
  Tag as TagIcon,
  Sparkles,
} from "lucide-react";
import { adminService, type CategoryPayload } from "@/services/adminService";
import { toast } from "sonner";
import type { Category } from "@/types/api";

const columnHelper = createColumnHelper<Category>();

export function CategoriesAdminPanel({ categories: initialCategories }: { categories?: Category[] } = {}) {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modal Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#aaff38");
  const [subcategories, setSubcategories] = useState<{ name: string; slug?: string }[]>([]);
  const [newSubName, setNewSubName] = useState("");
  const [includedFiles, setIncludedFiles] = useState<string[]>(["Figma (.fig)"]);

  // 1. Fetch live categories from backend API
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["adminCategories"],
    queryFn: () => adminService.getCategories(),
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CategoryPayload) => adminService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully!");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CategoryPayload> }) =>
      adminService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully!");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully!");
      setDeleteConfirmId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete category");
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setColor("#aaff38");
    setSubcategories([
      { name: "Design Systems", slug: "design-systems" },
      { name: "UI Kits", slug: "ui-kits" },
    ]);
    setIncludedFiles(["Figma (.fig)"]);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug || "");
    setDescription(cat.description || "");
    setColor(cat.color || "#aaff38");
    setSubcategories(
      (cat.subcategories || []).map((s) => ({
        name: s.name,
        slug: s.slug,
      }))
    );
    setIncludedFiles(cat.includedFiles || ["Figma (.fig)"]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const addSubcategory = () => {
    if (!newSubName.trim()) return;
    const subSlug = newSubName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSubcategories([...subcategories, { name: newSubName.trim(), slug: subSlug }]);
    setNewSubName("");
  };

  const removeSubcategory = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const payload: CategoryPayload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      color,
      subcategories,
      includedFiles,
    };

    if (editingCategory) {
      const catId = editingCategory._id || editingCategory.id || "";
      updateMutation.mutate({ id: catId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // TanStack Table Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Category Name",
        cell: (info) => {
          const cat = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: `${cat.color || "#aaff38"}20`,
                  color: cat.color || "#aaff38",
                }}
              >
                <Layers size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{cat.name}</p>
                <span className="text-[10px] font-mono text-muted-foreground">
                  /{cat.slug || cat.id}
                </span>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor((row) => (row.subcategories ? row.subcategories.length : 0), {
        id: "subcategories",
        header: "Subcategories",
        cell: (info) => {
          const cat = info.row.original;
          const subs = cat.subcategories || [];
          return (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {subs.length === 0 ? (
                <span className="text-[11px] font-mono text-muted-foreground italic">None</span>
              ) : (
                subs.slice(0, 3).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-muted text-muted-foreground border border-border"
                  >
                    {s.name}
                  </span>
                ))
              )}
              {subs.length > 3 && (
                <span className="text-[10px] font-mono text-primary font-bold">
                  +{subs.length - 3} more
                </span>
              )}
            </div>
          );
        },
      }),

      columnHelper.accessor("productCount", {
        header: "Products",
        cell: (info) => (
          <span className="text-xs font-mono font-bold text-foreground">
            {info.getValue() || 0}
          </span>
        ),
      }),

      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const cat = info.row.original;
          const catId = cat._id || cat.id || "";
          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openEditModal(cat)}
                className="p-1.5 rounded-xl border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Edit Category"
              >
                <Edit2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(catId)}
                className="p-1.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                title="Delete Category"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: categories,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const inputClass =
    "w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 text-xs font-mono focus:outline-none focus:border-primary/60";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Categories & Subcategories
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Manage top-level design categories and nested subcategory filters.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="w-full sm:w-80 relative">
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filter categories..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground/40 text-xs font-mono focus:outline-none focus:border-primary/60"
        />
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
        />
      </div>

      {/* TanStack Table Card */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-primary" />
            Loading categories...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-border bg-muted/40 font-mono">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center gap-1"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <ArrowUpDown size={12} className="text-muted-foreground/50" />
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Category Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-foreground">
                {editingCategory ? "Edit Category" : "New Category"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., UI/UX Kits"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., ui-ux-kits"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Design systems and high-converting UI components..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Subcategories Editor */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-mono text-muted-foreground block">
                  Nested Subcategories
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="New subcategory name..."
                    className={inputClass}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSubcategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSubcategory}
                    className="px-3 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs font-mono shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {subcategories.map((sub, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl text-xs font-mono bg-muted border border-border flex items-center gap-1.5 text-foreground"
                    >
                      {sub.name}
                      <button
                        type="button"
                        onClick={() => removeSubcategory(i)}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-2xl border border-border text-xs font-mono hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs font-mono hover:shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-destructive/40 bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-display font-bold text-foreground">
              Delete Category?
            </h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this category? Products in this category may become unassigned.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-mono hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-bold text-xs font-mono hover:opacity-90 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleteMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesAdminPanel;
