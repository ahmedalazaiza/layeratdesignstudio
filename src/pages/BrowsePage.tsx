import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, Check, ChevronDown, Sparkles } from "lucide-react";
import { ProductCard } from "../components/product/ProductCard";
import { CustomSelect } from "../components/ui/CustomSelect";
import { Footer } from "../components/layout/Footer";
import type { Product, Category, AuthUser, BrowseFilters, Page } from "../types";

interface BrowsePageProps {
  initialFilters?: Partial<BrowseFilters>;
  onProductClick: (p: Product) => void;
  authUser?: AuthUser | null;
  onWishlistToggle?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  onAuthOpen?: (mode: "login" | "register" | "forgot_password") => void;
  categories: Category[];
  products: Product[];
  onNavigate: (p: Page) => void;
  wishlist?: string[];
  activeCategoryId?: string | null;
  activeSubcategoryId?: string | null;
  onCategoryChange?: (catId: string | null) => void;
  onSubcategoryChange?: (subcatId: string | null) => void;
  initialSearchQuery?: string;
}

export function BrowsePage({
  initialFilters,
  onProductClick,
  authUser = null,
  onWishlistToggle,
  onToggleWishlist,
  onAuthOpen = () => {},
  categories,
  products,
  onNavigate,
  wishlist,
  activeCategoryId,
  activeSubcategoryId,
  onCategoryChange,
  onSubcategoryChange,
  initialSearchQuery,
}: BrowsePageProps) {
  const handleWishlist = onToggleWishlist || onWishlistToggle || (() => {});

  const [filters, setFilters] = useState<BrowseFilters>({
    query: initialSearchQuery ?? initialFilters?.query ?? "",
    categoryId: activeCategoryId ?? initialFilters?.categoryId ?? null,
    subcategoryId: activeSubcategoryId ?? initialFilters?.subcategoryId ?? null,
    isFree: null,
    sortBy: "newest",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);

  // Synchronize when parent updates activeCategoryId or initialSearchQuery or activeSubcategoryId
  useEffect(() => {
    if (activeCategoryId !== undefined) {
      setFilters((f) => ({ ...f, categoryId: activeCategoryId }));
      if (activeCategoryId) {
        setExpandedCats((prev) =>
          prev.includes(activeCategoryId) ? prev : [...prev, activeCategoryId]
        );
      }
    }
  }, [activeCategoryId]);

  useEffect(() => {
    if (activeSubcategoryId !== undefined) {
      setFilters((f) => ({ ...f, subcategoryId: activeSubcategoryId }));
    }
  }, [activeSubcategoryId]);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setFilters((f) => ({ ...f, query: initialSearchQuery }));
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialFilters) {
      setFilters((f) => ({ ...f, ...initialFilters }));
      if (initialFilters.categoryId) {
        setExpandedCats((prev) =>
          prev.includes(initialFilters.categoryId!)
            ? prev
            : [...prev, initialFilters.categoryId!]
        );
      }
    }
  }, [initialFilters]);

  const toggleCatExpand = (catId: string) => {
    setExpandedCats((e) =>
      e.includes(catId) ? e.filter((c) => c !== catId) : [...e, catId]
    );
  };

  const handleSelectCategory = (catId: string | null) => {
    setFilters((f) => ({ ...f, categoryId: catId, subcategoryId: null }));
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
  };

  // Filter and sort products
  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (filters.categoryId && p.categoryId !== filters.categoryId)
          return false;
        if (filters.subcategoryId && p.subcategoryId !== filters.subcategoryId)
          return false;
        if (filters.query) {
          const q = filters.query.toLowerCase().trim();
          return (
            p.title.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "downloads")
          return (b.downloadsCount || b.downloads || 0) - (a.downloadsCount || a.downloads || 0);
        if (filters.sortBy === "rating") return b.rating - a.rating;
        if (filters.sortBy === "alphabetical")
          return a.title.localeCompare(b.title);
        // Default newest
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
  }, [products, filters]);

  const activeCat = categories.find((c) => c.id === filters.categoryId);

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "downloads", label: "Most Downloaded" },
    { value: "rating", label: "Highest Rated" },
    { value: "alphabetical", label: "Alphabetical (A-Z)" },
  ];

  return (
    <motion.main
      key="browse"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pt-20 lg:pt-24"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8 pb-8 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-medium mb-3">
              <Sparkles size={12} />
              100% Free Library
            </div>
            <h1 className="text-3xl lg:text-5xl font-display font-extrabold text-foreground">
              {activeCat ? activeCat.name : "All Design Resources"}
            </h1>
            <p className="text-muted-foreground text-sm mt-2 max-w-xl leading-relaxed">
              {activeCat
                ? `Explore our collection of free ${activeCat.name.toLowerCase()} for Figma.`
                : "Explore our complete curated catalog of Figma UI kits, design systems, wireframe kits, and templates."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Mobile quick search */}
            <div className="relative lg:hidden w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={filters.query}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, query: e.target.value }))
                }
                placeholder="Search free resources..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-3 justify-between sm:justify-end">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 transition-colors cursor-pointer"
              >
                <Filter size={15} /> <span>Filters</span>
              </button>

              {/* Custom Sort Select */}
              <div className="w-44 sm:w-48">
                <CustomSelect
                  options={sortOptions}
                  value={filters.sortBy}
                  onChange={(val) =>
                    setFilters((f) => ({
                      ...f,
                      sortBy: val as BrowseFilters["sortBy"],
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Quick-Category Chips (Touch-friendly scroll) */}
        <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2 -mx-4 px-4">
          <button
            onClick={() => handleSelectCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap ${
              filters.categoryId === null
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            All Resources ({products.length})
          </button>
          {categories.map((cat) => {
            const isSelected = filters.categoryId === cat.id;
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block space-y-6 sticky top-28 bg-card border border-border rounded-3xl p-6 shadow-sm">
            {/* Search */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-medium">
                Search
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={filters.query}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, query: e.target.value }))
                  }
                  placeholder="Search UI kits, icons..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Category list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide font-medium">
                  Categories
                </label>
                {filters.categoryId && (
                  <button
                    onClick={() => handleSelectCategory(null)}
                    className="text-xs text-primary hover:underline font-mono"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {/* All */}
                <button
                  onClick={() => handleSelectCategory(null)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                    filters.categoryId === null
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span>All Resources</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {products.length}
                  </span>
                </button>

                {/* Categories */}
                {categories.map((cat) => {
                  const isSelected = filters.categoryId === cat.id;
                  const isExpanded = expandedCats.includes(cat.id);
                  const count = products.filter(
                    (p) => p.categoryId === cat.id
                  ).length;

                  return (
                    <div key={cat.id}>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors text-left cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <span className="text-xs font-mono text-muted-foreground ml-2">
                            {count}
                          </span>
                        </button>
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <button
                            onClick={() => toggleCatExpand(cat.id)}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                          >
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 ${
                                isExpanded ? "rotate-180 text-primary" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Subcategories */}
                      <AnimatePresence>
                        {isExpanded && cat.subcategories && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4 pr-1 py-1 space-y-0.5 border-l border-border/60 ml-3 my-1"
                          >
                            {cat.subcategories.map((sub) => {
                              const subCount = products.filter(
                                (p) => p.subcategoryId === sub.id
                              ).length;
                              const isSubSelected =
                                filters.subcategoryId === sub.id;

                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => {
                                    handleSelectCategory(cat.id);
                                    setFilters((f) => ({
                                      ...f,
                                      subcategoryId: isSubSelected
                                        ? null
                                        : sub.id,
                                    }));
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                                    isSubSelected
                                      ? "text-primary font-bold bg-primary/10"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                  }`}
                                >
                                  <span className="truncate">{sub.name}</span>
                                  {subCount > 0 && (
                                    <span className="text-[10px] font-mono text-muted-foreground ml-1">
                                      {subCount}
                                    </span>
                                  )}
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
            </div>

            {/* License info box */}
            <div className="rounded-2xl p-4 bg-muted/40 border border-border text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <Check size={14} className="text-primary" /> Free Commercial License
              </div>
              <p className="text-muted-foreground leading-relaxed">
                All downloaded resources can be freely used in personal, client, and commercial projects with no attribution required.
              </p>
            </div>
          </aside>

          {/* Product grid */}
          <div className="lg:col-span-3">
            {/* Active filters pill list */}
            {(filters.query || filters.categoryId || filters.subcategoryId) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-muted-foreground font-mono">
                  Active Filters:
                </span>
                {filters.query && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    Search: "{filters.query}"
                    <button
                      onClick={() => setFilters((f) => ({ ...f, query: "" }))}
                      className="hover:text-foreground cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filters.categoryId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    Category: {categories.find((c) => c.id === filters.categoryId)?.name}
                    <button
                      onClick={() => handleSelectCategory(null)}
                      className="hover:text-foreground cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filters.subcategoryId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    Subcategory: {filters.subcategoryId}
                    <button
                      onClick={() =>
                        setFilters((f) => ({ ...f, subcategoryId: null }))
                      }
                      className="hover:text-foreground cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    handleSelectCategory(null);
                    setFilters({
                      query: "",
                      categoryId: null,
                      subcategoryId: null,
                      isFree: null,
                      sortBy: "newest",
                    });
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline font-mono ml-2 cursor-pointer"
                >
                  Reset all
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-24 rounded-3xl border border-border bg-card p-8">
                <Search size={40} className="mx-auto mb-4 text-muted-foreground/40" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  No resources found
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                  Try adjusting your search keywords or removing selected category filters.
                </p>
                <button
                  onClick={() => {
                    handleSelectCategory(null);
                    setFilters({
                      query: "",
                      categoryId: null,
                      subcategoryId: null,
                      isFree: null,
                      sortBy: "newest",
                    });
                  }}
                  className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onProductClick={onProductClick}
                    authUser={authUser}
                    onWishlistToggle={handleWishlist}
                    onAuthOpen={onAuthOpen}
                    categories={categories}
                    wishlist={wishlist}
                    isWishlisted={
                      wishlist
                        ? wishlist.includes(prod.id)
                        : Boolean(authUser?.wishlist?.includes(prod.id))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] lg:hidden bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSidebarOpen(false);
            }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-xs bg-card border-l border-border h-full p-6 overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="text-lg font-display font-bold text-foreground">
                  Filters
                </h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile search */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-medium">
                  Search
                </label>
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={filters.query}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, query: e.target.value }))
                    }
                    placeholder="Search resources..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Mobile categories */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-medium">
                  Categories
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleSelectCategory(null);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                      filters.categoryId === null
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Resources
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        handleSelectCategory(cat.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                        filters.categoryId === cat.id
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md"
              >
                Apply Filters ({filtered.length})
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer onNavigate={onNavigate} categories={categories} />
    </motion.main>
  );
}
