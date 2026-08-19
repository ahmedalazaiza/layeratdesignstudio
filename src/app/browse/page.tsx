"use client";

import React, { Suspense } from "react";
import { BrowsePage as BrowseView } from "@/views/BrowsePage";

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground font-mono">Loading Figma kits...</div>}>
      <BrowseView
        onProductClick={() => {}}
        onAuthOpen={() => {}}
        initialFilters={{
          query: "",
          categoryId: null,
          subcategoryId: null,
          isFree: null,
          sortBy: "newest",
        }}
        categories={[]}
      />
    </Suspense>
  );
}
