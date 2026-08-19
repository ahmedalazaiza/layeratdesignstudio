"use client";

import React, { Suspense } from "react";
import { PublisherProductStudio } from "@/components/publisher/PublisherProductStudio";

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading Publisher Studio...
        </div>
      }
    >
      <PublisherProductStudio />
    </Suspense>
  );
}
