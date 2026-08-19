"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Check,
  ChevronDown,
  Sparkles,
  Layers,
  ArrowUpDown,
  Tag as TagIcon,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useAuth } from "@/hooks/useAuth";
import type { Product, Category, Tag, Page } from "@/types/api";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "popular", label: "Most Popular" },
  { value: "downloads", label: "Top Downloads" },
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function BrowsePage({
  onProductClick,
  onNavigate,
}: {
  onProductClick?: (p: Product) => void;
  onNavigate?: (page: Page) => void;
}) {
  const router = useRouter();
  const { authUser, toggleWishlist, wishlist, openAuthModal } = useAuth();
  const {
    query,
    category,
    subCategory,
    tag,
    sort,
    page,
    setQuery,
    setCategory,
    setSubCategory,
    setTag,
    setSort,
    setPage,
    resetAllFilters,
    hasActiveFilters,
  } = useProductFilters();

  const [searchInput, setSearchInput] = useState(query || "");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal search input with URL query state
  useEffect(() => {
    setSearchInput(query || "");
  }, [query]);

  // Debounced search handler
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setQuery(val.trim());
    }, 350);
  };

  // 1. Fetch Categories & Subcategories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch Tags
  const { data: tags = [], isLoading: tagsLoading } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => categoryService.getTags(),
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch Filtered Products
  const {
    data: productsData,
    isLoading: productsLoading,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["products", query, category, subCategory, tag, sort, page],
    queryFn: () =>
      productService.getProducts({
        query: query || undefined,
        category: category || undefined,
        subCategory: subCategory || undefined,
        tag: tag || undefined,
        sort: sort || "newest",
        page: page || 1,
        limit: 20,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });

  const products = productsData?.products || [];
  const meta = productsData?.meta;
  const totalPages = meta?.totalPages || 1;

  // Auto-expand category in sidebar when selected
  useEffect(() => {
    if (category) {
      setExpandedCategories((prev) => (prev.includes(category) ? prev : [...prev, category]));
    }
  }, [category]);

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleProductSelect = (p: Product) => {
    if (onProductClick) {
      onProductClick(p);
    } else {
      router.push(`/product/${p.slug || p.id || p._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Hero Banner */}
      <div className="border-b border-border/70 bg-card/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-3">
                <Sparkles size={11} />
                <span>100% Free Lifetime Downloads</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                Figma Resources & UI Kits
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Explore production-ready design systems, mobile screens, SaaS dashboards, and wireframe kits.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="w-full md:w-80 lg:w-96 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search UI kits, design systems..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm"
              />
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setQuery("");
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Tag Pills */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-mono uppercase text-muted-foreground/70 tracking-wide shrink-0 mr-1 flex items-center gap-1">
                <TagIcon size={12} /> Tags:
              </span>

              {tags.map((t) => {
                const tagIdentifier = t.slug || t.name;
                const isSelected = tag === tagIdentifier;
                return (
                  <button
                    key={t._id || t.id || tagIdentifier}
                    type="button"
                    onClick={() => setTag(tagIdentifier)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border hover:border-primary/40"
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Active Filter Badges & Count */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              Showing <strong className="text-foreground">{products.length}</strong> resources
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors cursor-pointer"
              >
                <X size={11} />
                Reset Filters
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle & Sort Dropdown */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-border bg-card text-foreground text-xs font-semibold cursor-pointer shadow-sm"
            >
              <SlidersHorizontal size={14} className="text-primary" />
              <span>Categories</span>
            </button>

            <div className="w-44 sm:w-48">
              <CustomSelect
                value={sort}
                onChange={(val) => setSort(val)}
                options={SORT_OPTIONS}
                placeholder="Sort by"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ── Desktop Category Sidebar ── */}
          <aside className="hidden lg:block lg:col-span-1 rounded-3xl border border-border bg-card p-5 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                <Layers size={16} className="text-primary" />
                Categories
              </h3>
              {category && (
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  className="text-[11px] font-mono text-muted-foreground hover:text-primary cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-1">
              {/* "All Resources" option */}
              <button
                type="button"
                onClick={() => setCategory("")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                  !category
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span>All Categories</span>
                {!category && <Check size={14} className="text-primary" />}
              </button>

              {/* Categorized Trees */}
              {categories.map((cat) => {
                const catId = cat.slug || cat._id || cat.id || "";
                const isSelected = category === catId || category === cat.slug || category === cat._id;
                const isExpanded = expandedCategories.includes(catId);
                const hasSubs = cat.subcategories && cat.subcategories.length > 0;

                return (
                  <div key={catId} className="space-y-0.5">
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCategory(cat.slug || catId)}
                        className="flex-1 text-left truncate"
                      >
                        {cat.name}
                      </button>

                      {hasSubs && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategoryExpand(catId);
                          }}
                          className="p-1 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                        >
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    <AnimatePresence>
                      {hasSubs && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="pl-4 space-y-0.5 overflow-hidden border-l border-border/60 ml-3"
                        >
                          {cat.subcategories!.map((sub) => {
                            const subId = sub.slug || sub._id || sub.id || "";
                            const isSubSelected = subCategory === subId || subCategory === sub.slug;

                            return (
                              <button
                                key={subId}
                                type="button"
                                onClick={() => {
                                  if (!isSelected) setCategory(cat.slug || catId);
                                  setSubCategory(isSubSelected ? "" : sub.slug || subId);
                                }}
                                className={`w-full text-left px-3 py-1.5 rounded-xl text-[11px] font-mono transition-colors flex items-center justify-between cursor-pointer ${
                                  isSubSelected
                                    ? "bg-primary/15 text-primary font-bold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                }`}
                              >
                                <span className="truncate">{sub.name}</span>
                                {isSubSelected && <Check size={12} className="text-primary" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* ── Mobile Sidebar Modal ── */}
          <AnimatePresence>
            {mobileSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm p-4 flex items-end justify-center"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setMobileSidebarOpen(false);
                }}
              >
                <motion.div
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  exit={{ y: 100 }}
                  className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                    <h3 className="text-base font-display font-bold text-foreground">
                      Filter Categories
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCategory("");
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold ${
                        !category ? "bg-primary text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      All Categories
                    </button>

                    {categories.map((cat) => (
                      <button
                        key={cat.slug || cat.id}
                        type="button"
                        onClick={() => {
                          setCategory(cat.slug || cat._id || cat.id || "");
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold ${
                          category === (cat.slug || cat._id || cat.id)
                            ? "bg-primary text-primary-foreground font-bold"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Product Grid ── */}
          <main className="lg:col-span-3">
            {productsLoading && products.length === 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-80 rounded-3xl border border-border bg-card/60 animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-3xl p-8 bg-card/40">
                <Package size={40} className="mx-auto mb-3 text-muted-foreground/40" />
                <h3 className="text-lg font-display font-bold text-foreground mb-1">
                  No design resources match your criteria
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
                  Try adjusting your search terms, selecting different categories, or clearing tags.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-xs cursor-pointer shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  layout
                  className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id || product._id}
                      product={product}
                      onProductClick={handleProductSelect}
                      authUser={authUser}
                      onWishlistToggle={toggleWishlist}
                      onAuthOpen={openAuthModal}
                      categories={categories}
                      wishlist={wishlist}
                      isWishlisted={wishlist.includes(product.id || product._id || "")}
                    />
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12 pt-6 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="px-3.5 py-2 rounded-2xl border border-border bg-card text-foreground text-xs font-mono font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      Prev
                    </button>

                    <span className="text-xs font-mono text-muted-foreground">
                      Page <strong className="text-foreground">{page}</strong> of{" "}
                      <strong className="text-foreground">{totalPages}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="px-3.5 py-2 rounded-2xl border border-border bg-card text-foreground text-xs font-mono font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default BrowsePage;
