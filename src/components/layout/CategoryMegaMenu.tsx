"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Layers,
  CheckCircle2,
} from "lucide-react";
import type { Category, SubCategory } from "@/types/api";

const SUBCATEGORY_DESCRIPTIONS: Record<
  string,
  { desc: string; badge?: string; visualBg?: string }
> = {
  "mobile-ui": {
    desc: "iOS 18 & Android kits with full Auto Layout 5.0",
    badge: "Popular",
    visualBg: "from-emerald-500/20 to-teal-500/5",
  },
  "web-saas-ui": {
    desc: "Production-ready SaaS dashboards & web apps",
    badge: "Trending",
    visualBg: "from-blue-500/20 to-indigo-500/5",
  },
  "design-systems": {
    desc: "Figma Variables, atomic tokens & color scales",
    badge: "Variables-ready",
    visualBg: "from-purple-500/20 to-pink-500/5",
  },
  "dashboard-admin": {
    desc: "Data charts, analytics metrics & table flows",
    badge: "Dark & Light",
    visualBg: "from-amber-500/20 to-orange-500/5",
  },
  "saas-landing": {
    desc: "High-converting tech heroes, pricing & features",
    badge: "Top Pick",
    visualBg: "from-cyan-500/20 to-blue-500/5",
  },
  "portfolio-agency": {
    desc: "Showcases, case study grids & creator portfolios",
    badge: "Creative",
    visualBg: "from-pink-500/20 to-rose-500/5",
  },
  ecommerce: {
    desc: "Modern shopping carts, catalogs & checkout UI",
    badge: "New",
    visualBg: "from-emerald-500/20 to-lime-500/5",
  },
  "mobile-web": {
    desc: "Responsive mobile web layouts & PWAs",
    badge: "Responsive",
    visualBg: "from-indigo-500/20 to-violet-500/5",
  },
  "wireframe-kits": {
    desc: "Low & high fidelity UX blueprint screens",
    badge: "Essential",
    visualBg: "from-amber-500/20 to-yellow-500/5",
  },
  "user-flows": {
    desc: "User journey maps, flowchart nodes & IA trees",
    badge: "UX Core",
    visualBg: "from-blue-500/20 to-sky-500/5",
  },
  "3d-assets": {
    desc: "High-res 3D abstract shapes & glowing elements",
    badge: "3D Ready",
    visualBg: "from-fuchsia-500/20 to-purple-500/5",
  },
  "vector-icons": {
    desc: "Pixel-perfect system vector icons & SVG glyphs",
    badge: "SVG & Fig",
    visualBg: "from-lime-500/20 to-emerald-500/5",
  },
};

interface CategoryMegaMenuProps {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onSelectCategory: (categoryId: string, subcategoryId?: string | null) => void;
}

export function CategoryMegaMenu({
  category,
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onSelectCategory,
}: CategoryMegaMenuProps) {
  if (!isOpen) return null;

  const categoryId = category._id || category.id || "";
  const subcategories = category.subcategories || [];

  // Top 3 featured subcategories
  const featuredSubcats = subcategories.slice(0, 3);
  const directorySubcats = subcategories;

  // Split into 2 columns
  const midpoint = Math.ceil(directorySubcats.length / 2);
  const col1 = directorySubcats.slice(0, midpoint);
  const col2 = directorySubcats.slice(midpoint);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.99 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave || onClose}
          className="w-full max-w-4xl z-50 pointer-events-auto"
        >
          <div className="rounded-3xl border border-border/90 dark:border-white/10 bg-card/98 dark:bg-[#0c130e]/98 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl shadow-black/15 dark:shadow-black/60 overflow-hidden relative">
            {/* Ambient category glow */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: category.color || "#1a4d22" }}
            />

            {/* Mega Menu Layout */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: Featured Visual Cards */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${category.color || "#1a4d22"}20`,
                      color: category.color || "#1a4d22",
                    }}
                  >
                    <Layers size={14} />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Featured in {category.name}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {featuredSubcats.map((subcat) => {
                    const subcatId = subcat._id || subcat.id || subcat.slug;
                    const meta = SUBCATEGORY_DESCRIPTIONS[subcat.slug] ||
                      SUBCATEGORY_DESCRIPTIONS[subcatId] || {
                        desc: `Explore curated ${subcat.name.toLowerCase()} assets.`,
                        badge: "Free",
                        visualBg: "from-primary/15 to-transparent",
                      };

                    return (
                      <button
                        key={subcatId}
                        onClick={() => {
                          onSelectCategory(categoryId, subcatId);
                          onClose();
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border border-border/60 hover:border-primary/50 bg-gradient-to-r ${meta.visualBg} hover:bg-primary/10 transition-all duration-200 group cursor-pointer relative overflow-hidden`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                                {subcat.name}
                              </h4>
                              {meta.badge && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                                  {meta.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {meta.desc}
                            </p>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/40 shrink-0 transition-colors mt-0.5">
                            <ArrowRight
                              size={12}
                              className="group-hover:translate-x-0.5 transition-transform"
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Subcategories Directory List */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4 pl-0 lg:pl-4 lg:border-l lg:border-border/60">
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      All Subcategories
                    </span>
                    <button
                      onClick={() => {
                        onSelectCategory(categoryId, null);
                        onClose();
                      }}
                      className="text-xs text-primary hover:underline font-mono font-bold cursor-pointer"
                    >
                      View All {category.name} →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Column 1 */}
                    <div className="space-y-1">
                      {col1.map((subcat) => {
                        const subcatId = subcat._id || subcat.id || subcat.slug;
                        return (
                          <button
                            key={subcatId}
                            onClick={() => {
                              onSelectCategory(categoryId, subcatId);
                              onClose();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all flex items-center justify-between group cursor-pointer"
                          >
                            <span className="group-hover:translate-x-0.5 transition-transform">
                              {subcat.name}
                            </span>
                            <ArrowRight
                              size={12}
                              className="opacity-0 group-hover:opacity-100 text-primary transition-opacity shrink-0 ml-2"
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-1">
                      {col2.map((subcat) => {
                        const subcatId = subcat._id || subcat.id || subcat.slug;
                        return (
                          <button
                            key={subcatId}
                            onClick={() => {
                              onSelectCategory(categoryId, subcatId);
                              onClose();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all flex items-center justify-between group cursor-pointer"
                          >
                            <span className="group-hover:translate-x-0.5 transition-transform">
                              {subcat.name}
                            </span>
                            <ArrowRight
                              size={12}
                              className="opacity-0 group-hover:opacity-100 text-primary transition-opacity shrink-0 ml-2"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Direct Action Bar */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 size={13} className="text-primary" />
                    <span>100% Free for commercial and personal use</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectCategory(categoryId, null);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    <span>Browse All</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CategoryMegaMenu;
