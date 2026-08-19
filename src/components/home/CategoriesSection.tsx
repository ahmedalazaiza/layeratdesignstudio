import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Layers } from "lucide-react";
import type { Category } from "../../types";

interface CategoriesSectionProps {
  onCategoryClick: (categoryId: string) => void;
  categories: Category[];
}

export function CategoriesSection({
  onCategoryClick,
  categories,
}: CategoriesSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="categories" ref={ref} className="py-16 sm:py-24 lg:py-32 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-primary font-mono text-xs sm:text-sm font-medium tracking-widest uppercase">
            Browse By Category
          </span>
          <h2 className="mt-2 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-foreground break-words">
            What are you building?
          </h2>
          <p className="mt-3 sm:mt-4 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Every resource is crafted by professional UX/UI designers and
            organized for fast discovery.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => {
            const catId = cat.id || cat._id || "";
            return (
              <motion.button
                key={catId || i}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => onCategoryClick(catId)}
                className="group relative text-left p-7 rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_60px_rgba(82,51,253,0.12)] transition-all duration-300 overflow-hidden cursor-pointer"
              >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${cat.color || "#1a4d22"}18`,
                  border: `1px solid ${cat.color || "#1a4d22"}35`,
                }}
              >
                {typeof cat.icon === "function" || typeof cat.icon === "object" ? (
                  React.createElement(cat.icon as any, { size: 22, style: { color: cat.color || "#1a4d22" } })
                ) : (
                  <Layers size={22} style={{ color: cat.color || "#1a4d22" }} />
                )}
              </div>

              <h3 className="font-display font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors flex items-center justify-between">
                {cat.name}
                <ArrowUpRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-primary"
                />
              </h3>

              <div className="space-y-1">
                {(cat.subcategories || []).slice(0, 3).map((sub) => {
                  const subId = sub.id || (sub as any)._id || sub.slug;
                  return (
                    <p
                      key={subId}
                      className="text-xs text-muted-foreground truncate"
                    >
                      · {sub.name}
                    </p>
                  );
                })}
                {(cat.subcategories || []).length > 3 && (
                  <p className="text-[11px] text-primary font-mono font-medium pt-1">
                    +{(cat.subcategories || []).length - 3} more
                  </p>
                )}
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)`,
                }}
              />
            </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
