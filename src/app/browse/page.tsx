"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { BrowsePage as BrowseView } from "@/views/BrowsePage";

export default function BrowseRoute() {
  const router = useRouter();

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading Figma kits & design systems...
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
