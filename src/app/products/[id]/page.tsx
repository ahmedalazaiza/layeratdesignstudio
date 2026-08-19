"use client";

import React, { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductDetailPage as ProductDetailView } from "@/views/ProductDetailPage";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from "@/data/fallbackData";
import type { Product, Category } from "@/types/api";

function ProductsIdContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const fallbackProduct =
    FALLBACK_PRODUCTS.find((p) => p.id === id || p.slug === id || p._id === id) ||
    FALLBACK_PRODUCTS[0];

  const { data: product = fallbackProduct } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const live = await productService.getProductById(id);
      return live || fallbackProduct;
    },
    initialData: fallbackProduct,
    staleTime: 60 * 1000,
  });

  const { data: categories = FALLBACK_CATEGORIES } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <ProductDetailView
      product={product}
      onBack={() => router.back()}
      onNavigate={(p) => router.push(`/${p === "home" ? "" : p}`)}
      onProductClick={(p) => router.push(`/products/${p.id || p.slug || p._id}`)}
      categories={categories}
      relatedProducts={FALLBACK_PRODUCTS.filter((p) => (p.id || p._id) !== (product.id || product._id))}
    />
  );
}

export default function ProductsIdRoute() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading product details...
        </div>
      }
    >
      <ProductsIdContent />
    </Suspense>
  );
}
