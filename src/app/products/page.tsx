"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { BrowsePage as BrowseView } from "@/views/BrowsePage";

export default function ProductsRoute() {
  const router = useRouter();

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading design catalog...
        </div>
      }
    >
      <BrowseView
        onProductClick={(p) => router.push(`/product/${p.slug || p.id || p._id}`)}
        onNavigate={(p) => router.push(`/${p === "home" ? "" : p}`)}
      />
    </Suspense>
  );
}
