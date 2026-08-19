"use client";

import React, { Suspense } from "react";
import { PublisherProductStudio } from "@/components/publisher/PublisherProductStudio";

export default function NewProductUploadPage() {
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
