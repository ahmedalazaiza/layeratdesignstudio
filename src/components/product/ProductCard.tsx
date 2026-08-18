import React, { useState } from "react";
import { Heart, Download, Star, ArrowUpRight, Shield } from "lucide-react";
import type { Product, AuthUser, Category } from "../../types";

export function ProductCard({
  product,
  onProductClick,
  authUser,
  onWishlistToggle,
  onAuthOpen,
  categories,
  wishlist,
  isWishlisted,
}: {
  product: Product;
  onProductClick: (p: Product) => void;
  authUser: AuthUser | null;
  onWishlistToggle: (productId: string) => void;
  onAuthOpen: (mode: "login" | "register" | "forgot_password") => void;
  categories: Category[];
  wishlist?: string[];
  isWishlisted?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const isInWishlist =
    isWishlisted !== undefined
      ? isWishlisted
      : wishlist !== undefined
      ? wishlist.includes(product.id)
      : Boolean(authUser?.wishlist?.includes(product.id));

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authUser) {
      onAuthOpen("login");
      return;
    }
    onWishlistToggle(product.id);
  };

  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onProductClick(product)}
      className="group relative rounded-3xl overflow-hidden border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent dark:from-black/70 dark:via-black/20 pointer-events-none" />

        {/* Free badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm">
            Free
          </span>
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md z-10 ${
            isInWishlist
              ? "bg-black/70 text-primary border border-primary/40 scale-105"
              : "bg-black/50 text-white/90 hover:text-white hover:bg-black/70 hover:scale-105"
          }`}
        >
          <Heart
            size={14}
            className={isInWishlist ? "fill-primary text-primary" : "text-white/90"}
          />
        </button>

        {/* Glow overlay */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(170,255,56,0.12) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          {category && (
            <span
              className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full"
              style={{
                background: `${category.color}15`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}
          <div className="flex items-center gap-1">
            <ArrowUpRight
              size={15}
              className={`text-primary transition-all duration-300 ${
                hovered ? "translate-x-0.5 -translate-y-0.5 opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>

        <h3 className="font-display font-bold text-foreground text-base leading-snug group-hover:text-primary transition-colors line-clamp-1 mb-1">
          {product.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {product.shortDescription}
        </p>

        {/* Specs footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            {product.rating > 0 && (
              <>
                <Star size={12} className="text-primary fill-primary" />
                <span className="font-semibold text-foreground">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-muted-foreground/50">·</span>
              </>
            )}
            <span className="flex items-center gap-1 font-mono">
              <Download size={11} />
              {(product.downloads || 0) > 999
                ? `${((product.downloads || 0) / 1000).toFixed(1)}k`
                : product.downloads || 0}
            </span>
          </div>

          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            {product.formats?.[0] || product.specifications?.format?.[0] || "Figma"}
          </span>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/40">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover bottom line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 transition-opacity duration-500 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, transparent, #aaff38, transparent)",
        }}
      />
    </div>
  );
}