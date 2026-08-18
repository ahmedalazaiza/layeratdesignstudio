import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "../product/ProductCard";
import type { Product, AuthUser, Category, Page } from "../../types";

interface FeaturedProductsProps {
  products: Product[];
  onProductClick: (p: Product) => void;
  onNavigate: (p: Page) => void;
  authUser: AuthUser | null;
  onWishlistToggle: (id: string) => void;
  onAuthOpen: (mode: "login" | "register" | "forgot_password") => void;
  categories: Category[];
  wishlist?: string[];
}

export function FeaturedProducts({
  products,
  onProductClick,
  onNavigate,
  authUser,
  onWishlistToggle,
  onAuthOpen,
  categories,
  wishlist,
}: FeaturedProductsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const featured = products.slice(0, 6);

  return (
    <section id="featured" ref={ref} className="py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16"
        >
          <div>
            <span className="text-primary font-mono text-xs sm:text-sm font-medium tracking-widest uppercase">
              Top Free Picks
            </span>
            <h2 className="mt-2 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-foreground break-words">
              Featured Community Resources
            </h2>
          </div>
          <button
            onClick={() => onNavigate("browse")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group shrink-0 cursor-pointer"
          >
            View all resources
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <ProductCard
                product={product}
                onProductClick={onProductClick}
                authUser={authUser}
                onWishlistToggle={onWishlistToggle}
                onAuthOpen={onAuthOpen}
                categories={categories}
                wishlist={wishlist}
                isWishlisted={
                  wishlist
                    ? wishlist.includes(product.id)
                    : Boolean(authUser?.wishlist?.includes(product.id))
                }
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
