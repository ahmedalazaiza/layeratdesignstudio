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
  Tag as TagIcon,
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowUpDown,
  Check,
  X,
  Loader2,
  Hash,
} from "lucide-react";
import { adminService, type TagPayload } from "@/services/adminService";
import { toast } from "sonner";
import type { Tag } from "@/types/api";

const columnHelper = createColumnHelper<Tag>();

export function TagsAdminPanel() {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [formError, setFormError] = useState("");

  // 1. Fetch live tags
  const { data: tags = [], isLoading } = useQuery<Tag[]>({
    queryKey: ["adminTags"],
    queryFn: () => adminService.getTags(),
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (payload: TagPayload) => adminService.createTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTags"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag created successfully!");
      closeModal();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to create tag";
      if (msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("duplicate")) {
        setFormError("A tag with this name already exists.");
        toast.error("Tag name already exists. Please choose another name.");
      } else {
        setFormError(msg);
        toast.error(msg);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TagPayload> }) =>
      adminService.updateTag(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTags"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag updated successfully!");
      closeModal();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to update tag";
      if (msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("duplicate")) {
        setFormError("A tag with this name already exists.");
        toast.error("Tag name already exists. Please choose another name.");
      } else {
        setFormError(msg);
        toast.error(msg);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTags"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag deleted successfully!");
      setDeleteConfirmId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete tag");
    },
  });

  const openCreateModal = () => {
    setEditingTag(null);
    setName("");
    setSlug("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Tag name is required");
      return;
    }

    const payload: TagPayload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
    };

    if (editingTag) {
      const tagId = editingTag._id || editingTag.id || "";
      updateMutation.mutate({ id: tagId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Tag Name",
        cell: (info) => {
          const tag = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                <Hash size={12} /> {tag.name}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor("slug", {
        header: "Slug",
        cell: (info) => (
          <span className="text-xs font-mono text-muted-foreground">
            {info.getValue() || info.row.original.id || "-"}
          </span>
        ),
      }),

      columnHelper.accessor("productCount", {
        header: "Tagged Products",
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
          const tag = info.row.original;
          const tagId = tag._id || tag.id || "";
          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openEditModal(tag)}
                className="p-1.5 rounded-xl border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Edit Tag"
              >
                <Edit2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(tagId)}
                className="p-1.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                title="Delete Tag"
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
    data: tags,
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
            Design Tags & Keywords
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Manage searchable design system tags, keywords, and filter pills.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={14} /> Add Tag
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="w-full sm:w-80 relative">
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filter tags..."
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
            Loading tags...
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

      {/* ── Add / Edit Tag Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-foreground">
                {editingTag ? "Edit Tag" : "New Tag"}
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
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g., Design Systems"
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
                  placeholder="e.g., design-systems"
                  className={inputClass}
                />
              </div>

              {formError && (
                <p className="text-xs text-destructive font-medium">{formError}</p>
              )}

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
                  {editingTag ? "Update Tag" : "Create Tag"}
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
              Delete Tag?
            </h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this tag?
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

export default TagsAdminPanel;
