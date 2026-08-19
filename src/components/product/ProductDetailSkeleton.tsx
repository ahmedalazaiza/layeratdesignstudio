import React from "react";

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-pulse">
      {/* Top Breadcrumb */}
      <div className="border-b border-border bg-card/40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="h-4 w-48 bg-muted rounded-md" />
          <div className="h-8 w-16 bg-muted rounded-xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Preview Stage */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="w-full aspect-[16/10] bg-muted rounded-3xl" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-24 h-16 bg-muted rounded-2xl shrink-0" />
              ))}
            </div>
            <div className="rounded-3xl border border-border bg-card p-8 space-y-4">
              <div className="h-6 w-40 bg-muted rounded-md" />
              <div className="h-4 w-full bg-muted rounded-md" />
              <div className="h-4 w-5/6 bg-muted rounded-md" />
              <div className="h-4 w-3/4 bg-muted rounded-md" />
            </div>
          </div>

          {/* Right Action Box */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-8 space-y-5">
              <div className="h-4 w-24 bg-muted rounded-md" />
              <div className="h-8 w-3/4 bg-muted rounded-xl" />
              <div className="h-4 w-32 bg-muted rounded-md" />
              <div className="h-16 w-full bg-muted rounded-2xl" />
              <div className="h-14 w-full bg-muted rounded-2xl" />
              <div className="h-24 w-full bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailSkeleton;
