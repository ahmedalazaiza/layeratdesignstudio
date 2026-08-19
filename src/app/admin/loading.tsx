import React from "react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="h-16 border-b border-border bg-card/80 px-6 flex items-center justify-between">
        <div className="h-6 w-32 bg-muted rounded-md" />
        <div className="h-8 w-24 bg-muted rounded-xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl border border-border bg-card p-6" />
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <div className="h-8 w-48 bg-muted rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-muted/60 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
