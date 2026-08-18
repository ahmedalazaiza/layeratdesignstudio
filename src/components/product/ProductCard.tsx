import React, { useState } from "react";
import { Heart, Download, Star, ArrowUpRight, Shield } from "lucide-react";
import type { Product, AuthUser, Category } from "../../types";

function ProductCard({
    product,
    onProductClick,
    authUser,
    onWishlistToggle,
    onAuthOpen,
    categories,
  }: {
    product: Product;
    onProductClick: (p: Product) => void;
    authUser: AuthUser | null;
    onWishlistToggle: (productId: string) => void;
    onAuthOpen: (mode: "login" | "register" | "forgot_password") => void;
    categories: Category[];
  }) {
    const [hovered, setHovered] = useState(false);
  
    const isInWishlist = authUser?.wishlist.includes(product.id) ?? false;
  
    const handleWishlist = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!authUser) {
        onAuthOpen("login");
        return;
      }
      onWishlistToggle(product.id);
    };
  
    const displayPrice = product.isFree
      ? "Free"
      : product.discountPrice
      ? `$${product.discountPrice}`
      : `$${product.price}`;
  
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
  
          {/* Price badge */}
          <div className="absolute top-3 left-3">
            {product.isFree ? (
              <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                Free
              </span>
            ) : product.discountPrice ? (
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  ${product.discountPrice}
                </span>
                <span className="px-2 py-1 rounded-full bg-black/50 text-white text-xs line-through opacity-70">
                  ${product.price}
                </span>
              </div>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
                ${product.price}
              </span>
            )}
          </div>
  
          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
              isInWishlist
                ? "bg-[#1a4d22] text-white dark:bg-[#aaff38] dark:text-[#0F0039]"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
          >
            <Heart size={14} className={isInWishlist ? "fill-current" : ""} />
          </button>
  
          {/* Hover glow — pointer-events-none so it never blocks the heart button */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background:
                "linear-gradient(135deg, rgba(82,51,253,0.08) 0%, transparent 60%)",
            }}
          />
        </div>
  
        {/* Content */}
        <div className="p-5">
          {/* Category + arrow */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {categories
                .find((c) => c.id === product.categoryId)
                ?.subcategories.find((s) => s.id === product.subcategoryId)
                ?.name ??
                categories.find((c) => c.id === product.categoryId)?.name}
            </span>
            <ArrowUpRight
              size={16}
              className={`text-primary transition-all duration-300 ${
                hovered
                  ? "opacity-100 translate-x-0.5 -translate-y-0.5"
                  : "opacity-0"
              }`}
            />
          </div>
  
          <h3 className="text-base font-display font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {product.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
            {product.shortDescription}
          </p>
  
          {/* Stats row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star size={11} className="text-primary fill-primary" />
              <span className="font-mono font-medium text-foreground">
                {product.rating.toFixed(1)}
              </span>
              <span>({product.reviewsCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download size={11} />
              <span>
                {product.downloadsCount >= 1000
                  ? `${(product.downloadsCount / 1000).toFixed(1)}k`
                  : product.downloadsCount}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Shield size={11} />
              <span className="capitalize">{product.licenseType}</span>
            </div>
          </div>
  
          {/* Figma feature badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {product.supportsVariables && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Variables
              </span>
            )}
            {product.supportsAutoLayout && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Auto Layout
              </span>
            )}
            {product.supportsLightDark && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Light/Dark
              </span>
            )}
          </div>
        </div>
  
        {/* Bottom accent */}
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

  export { ProductCard };