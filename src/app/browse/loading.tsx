import React from "react";

export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="border-b border-border bg-card/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-muted rounded-xl mb-2" />
          <div className="h-4 w-96 max-w-full bg-muted rounded-lg" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="h-6 w-32 bg-muted rounded-lg mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-full bg-muted rounded-2xl" />
            ))}
          </div>

          {/* Grid Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Sort Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="h-10 w-72 bg-muted rounded-2xl" />
              <div className="h-10 w-36 bg-muted rounded-2xl" />
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
      </div>
    </div>
  );
}
