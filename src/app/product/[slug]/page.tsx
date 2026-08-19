"use client";

import React, { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductDetailPage as ProductDetailView } from "@/views/ProductDetailPage";
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from "@/data/fallbackData";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const product =
    FALLBACK_PRODUCTS.find((p) => p.slug === slug || p.id === slug) ||
    FALLBACK_PRODUCTS[0];

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading product details...
        </div>
      }
    >
      <ProductDetailView
        product={product}
        onBack={() => router.back()}
        onNavigate={(p) => router.push(`/${p === "home" ? "" : p}`)}
        categories={FALLBACK_CATEGORIES}
        relatedProducts={FALLBACK_PRODUCTS.filter((p) => p.id !== product.id)}
      />
    </Suspense>
  );
}
