import React from "react";

export default function PublisherLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="h-6 w-36 bg-muted rounded-full mx-auto mb-4" />
        <div className="h-10 w-2/3 bg-muted rounded-2xl mx-auto mb-4" />
        <div className="h-4 w-1/2 bg-muted rounded-xl mx-auto mb-10" />

        <div className="rounded-3xl border border-border bg-card p-8 space-y-6">
          <div className="h-6 w-48 bg-muted rounded-md" />
          <div className="h-12 w-full bg-muted rounded-2xl" />
          <div className="h-12 w-full bg-muted rounded-2xl" />
          <div className="h-24 w-full bg-muted rounded-2xl" />
          <div className="h-14 w-full bg-muted rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
