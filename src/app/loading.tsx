import React from "react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-pulse">
      {/* Hero Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="h-6 w-32 bg-muted rounded-full mx-auto mb-4" />
        <div className="h-12 w-3/4 max-w-xl bg-muted rounded-2xl mx-auto mb-4" />
        <div className="h-4 w-1/2 max-w-md bg-muted rounded-xl mx-auto mb-8" />
        
        {/* Category Pills Skeleton */}
        <div className="flex items-center justify-center gap-2 overflow-hidden mb-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 w-24 bg-muted rounded-full shrink-0" />
          ))}
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-3xl border border-border bg-card p-4 space-y-3">
              <div className="w-full aspect-[16/10] bg-muted rounded-2xl" />
              <div className="h-4 w-3/4 bg-muted rounded-md" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-3 w-16 bg-muted rounded-md" />
                <div className="h-4 w-12 bg-muted rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
