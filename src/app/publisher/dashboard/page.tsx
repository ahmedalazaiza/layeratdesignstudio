"use client";

import React, { Suspense } from "react";
import { PublisherProductsTable } from "@/components/publisher/PublisherProductsTable";
import { Sparkles, Upload } from "lucide-react";
import Link from "next/link";

export default function PublisherDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading Publisher Dashboard...
        </div>
      }
    >
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-2">
                <Sparkles size={11} />
                <span>Creator Studio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                Publisher Dashboard
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your published Figma resources, downloads analytics, and files.
              </p>
            </div>

            <Link
              href="/publisher/products/new"
              className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Upload size={15} />
              Publish New Product
            </Link>
          </div>

          <PublisherProductsTable />
        </div>
      </div>
    </Suspense>
  );
}
