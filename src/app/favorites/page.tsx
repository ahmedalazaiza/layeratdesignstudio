"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FavoritesPage as FavoritesView } from "@/views/FavoritesPage";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { useAuth } from "@/hooks/useAuth";
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from "@/data/fallbackData";
import type { Product, Category } from "@/types/api";

function FavoritesContent() {
  const router = useRouter();
  const { authUser, wishlist, toggleWishlist } = useAuth();

  const { data: allProducts = FALLBACK_PRODUCTS } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await productService.getProducts();
      return res.products;
    },
    staleTime: 60 * 1000,
  });

  const { data: categories = FALLBACK_CATEGORIES } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const favoritedProducts = allProducts.filter((p) =>
    wishlist.includes(p.id || p._id || "")
  );

  return (
    <FavoritesView
      authUser={authUser}
      products={allProducts}
      favoriteProducts={favoritedProducts}
      onNavigate={(p) => router.push(`/${p === "home" ? "" : p}`)}
      onProductClick={(p) => router.push(`/product/${p.slug || p.id || p._id}`)}
      onWishlistToggle={toggleWishlist}
      categories={categories}
    />
  );
}

export default function FavoritesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading saved resources...
        </div>
      }
    >
      <FavoritesContent />
    </Suspense>
  );
}
