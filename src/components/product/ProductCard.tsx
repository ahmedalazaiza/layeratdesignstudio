"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Download, Star, ArrowUpRight, Sparkles, Layers } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Product, Category } from "@/types/api";

interface ProductCardProps {
  product: Product;
  onProductClick?: (p: Product) => void;
  authUser?: any;
  onWishlistToggle?: (productId: string) => void;
  onAuthOpen?: (mode: "login" | "register" | "forgot_password") => void;
  categories?: Category[];
  wishlist?: string[];
  isWishlisted?: boolean;
}

export function ProductCard({
  product,
  onProductClick,
  authUser: propAuthUser,
  onWishlistToggle: propOnWishlistToggle,
  onAuthOpen: propOnAuthOpen,
  categories = [],
  wishlist: propWishlist,
  isWishlisted: propIsWishlisted,
}: ProductCardProps) {
  const { authUser: contextUser, wishlist: contextWishlist, toggleWishlist, openAuthModal } = useAuth();
  const authUser = propAuthUser !== undefined ? propAuthUser : contextUser;
  const onWishlistToggle = propOnWishlistToggle || toggleWishlist;
  const onAuthOpen = propOnAuthOpen || openAuthModal;
  const wishlist = propWishlist !== undefined ? propWishlist : contextWishlist;

  const [hovered, setHovered] = useState(false);
  const productId = product._id || product.id || "";

  const isFavorited =
    propIsWishlisted !== undefined
      ? propIsWishlisted
      : wishlist.includes(productId) || Boolean(authUser?.wishlist?.includes(productId));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authUser) {
      onAuthOpen("login");
      return;
    }
    onWishlistToggle(productId);
  };

  const categoryObj =
    typeof product.category === "object"
      ? (product.category as Category)
      : categories.find(
          (c) => (c._id || c.id) === (product.categoryId || product.category)
        );

  const categoryName = categoryObj?.name || (typeof product.category === "string" ? product.category : "Figma Kit");
  const categoryColor = categoryObj?.color || "#aaff38";

  const isFree = product.isFree !== undefined ? product.isFree : (Number(product.price || 0) === 0);
  const downloadsCount = product.downloadsCount || product.downloads || 0;
  const ratingValue = product.rating || 5.0;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onProductClick?.(product)}
      className="group relative rounded-3xl overflow-hidden border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] cursor-pointer flex flex-col justify-between"
    >
      {/* Thumbnail Header */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-muted">
        <img
          src={product.thumbnail || product.previewImages?.[0] || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent dark:from-black/80 dark:via-black/20 pointer-events-none" />

        {/* Price Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isFree ? (
            <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold font-mono shadow-sm flex items-center gap-1">
              <Sparkles size={11} />
              Free
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-card/90 backdrop-blur-md text-foreground text-xs font-bold font-mono border border-border/80 shadow-sm">
              ${product.price}
            </span>
          )}
        </div>

        {/* Wishlist / Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md z-10 ${
            isFavorited
              ? "bg-black/80 text-primary border border-primary/50 scale-105"
              : "bg-black/50 text-white/90 hover:text-white hover:bg-black/75 hover:scale-105"
          }`}
        >
          <Heart
            size={14}
            className={isFavorited ? "fill-primary text-primary" : "text-white/90"}
          />
        </button>

        {/* Subtle Radial Glow on Hover */}
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

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full"
              style={{
                background: `${categoryColor}15`,
                color: categoryColor,
              }}
            >
              {categoryName}
            </span>

            <ArrowUpRight
              size={15}
              className={`text-primary transition-all duration-300 ${
                hovered ? "translate-x-0.5 -translate-y-0.5 opacity-100" : "opacity-0"
              }`}
            />
          </div>

          <h3 className="font-display font-bold text-foreground text-base leading-snug group-hover:text-primary transition-colors line-clamp-1 mb-1">
            {product.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {product.shortDescription || product.overview}
          </p>
        </div>

        {/* Specs & Downloads Footer */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <Star size={12} className="text-primary fill-primary" />
              <span className="font-semibold text-foreground font-mono">
                {ratingValue.toFixed(1)}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="flex items-center gap-1 font-mono">
                <Download size={11} />
                {downloadsCount > 999
                  ? `${(downloadsCount / 1000).toFixed(1)}k`
                  : downloadsCount}
              </span>
            </div>

            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
              {product.formats?.[0] || product.specifications?.format?.[0] || "Figma"}
            </span>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/40">
              {product.tags.slice(0, 3).map((tag, i) => {
                const tagName =
                  typeof tag === "string"
                    ? tag
                    : tag.name || tag.slug || (tag as any)._id || "";
                return (
                  <span
                    key={tagName || i}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-mono"
                  >
                    #{tagName}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Hover bottom neon line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 transition-opacity duration-500 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(90deg, transparent, #aaff38, transparent)",
        }}
      />
    </motion.div>
  );
}

export default ProductCard;