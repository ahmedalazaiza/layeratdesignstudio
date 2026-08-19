"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
  Search,
  ArrowUpDown,
  Plus,
  ExternalLink,
  Eye,
  Download,
  Star,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { publisherService } from "@/services/publisherService";
import type { Product } from "@/types/api";

const columnHelper = createColumnHelper<Product>();

export function PublisherProductsTable() {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch publisher's own products
  const { data: responseData, isLoading } = useQuery({
    queryKey: ["myProducts"],
    queryFn: () => publisherService.getMyProducts({ limit: 100 }),
    staleTime: 60 * 1000,
  });

  const products = responseData?.products || [];

  const columns = useMemo(
    () => [
      // 1. Thumbnail & Title
      columnHelper.accessor("title", {
        header: "Resource",
        cell: (info) => {
          const product = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-14 h-10 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                <img
                  src={product.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate max-w-xs sm:max-w-sm">
                  {product.title}
                </p>
                <span className="text-[10px] font-mono text-muted-foreground">
                  /{product.slug || product.id}
                </span>
              </div>
            </div>
          );
        },
      }),

      // 2. Category
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => {
          const cat = info.getValue();
          const name = typeof cat === "object" ? (cat as any)?.name : cat || "Figma";
          return (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-muted text-muted-foreground border border-border/80">
              {name}
            </span>
          );
        },
      }),

      // 3. Price
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => {
          const price = Number(info.getValue()) || 0;
          return price === 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
              Free
            </span>
          ) : (
            <span className="text-xs font-mono font-bold text-foreground">
              ${price}
            </span>
          );
        },
      }),

      // 4. Status
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue() || "published";
          const isPublished = status === "published";
          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                isPublished
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}
            >
              {status}
            </span>
          );
        },
      }),

      // 5. Downloads
      columnHelper.accessor((row) => row.downloads || row.downloadsCount || 0, {
        id: "downloads",
        header: "Downloads",
        cell: (info) => (
          <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
            <Download size={12} className="text-primary" />
            {info.getValue()}
          </span>
        ),
      }),

      // 6. Rating
      columnHelper.accessor("rating", {
        header: "Rating",
        cell: (info) => (
          <span className="flex items-center gap-1 text-xs font-mono font-bold text-foreground">
            <Star size={12} className="text-primary fill-primary" />
            {(Number(info.getValue()) || 5.0).toFixed(1)}
          </span>
        ),
      }),

      // 7. Actions
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const product = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Link
                href={`/product/${product.slug || product.id}`}
                target="_blank"
                className="p-1.5 rounded-xl border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
                title="View Live in Studio"
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: products,
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

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Filter */}
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search your products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground/40 text-xs font-mono focus:outline-none focus:border-primary/60"
          />
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
          />
        </div>

        {/* Upload Button */}
        <Link
          href="/publisher/products/new"
          className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          Upload New Resource
        </Link>
      </div>

      {/* TanStack Table Card */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-primary" />
            Loading your products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package size={36} className="mx-auto text-muted-foreground/40" />
            <h3 className="text-sm font-bold text-foreground">No published products yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Ready to showcase your design work? Click below to upload your first Figma UI kit.
            </p>
            <Link
              href="/publisher/products/new"
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xs inline-block"
            >
              Upload Product
            </Link>
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

        {/* Pagination Footer */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border text-xs font-mono text-muted-foreground">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded-xl border border-border disabled:opacity-40 hover:bg-muted cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded-xl border border-border disabled:opacity-40 hover:bg-muted cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
