import React from "react";

export default function PublisherDashboardLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-muted rounded-md" />
            <div className="h-8 w-64 bg-muted rounded-xl" />
          </div>
          <div className="h-10 w-44 bg-muted rounded-2xl" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <div className="h-10 w-72 bg-muted rounded-2xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 w-full bg-muted/60 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
