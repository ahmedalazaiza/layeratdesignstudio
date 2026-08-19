"use client";

import React, { Suspense } from "react";
import { FavoritesPage as FavoritesView } from "@/views/FavoritesPage";

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground font-mono">Loading saved kits...</div>}>
      <FavoritesView
        onNavigate={() => {}}
        onProductClick={() => {}}
        categories={[]}
      />
    </Suspense>
  );
}
