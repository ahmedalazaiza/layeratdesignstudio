"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ProfilePage as ProfileView } from "@/components/profile/ProfilePage";

export default function ProfileRoute() {
  const router = useRouter();

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading profile...
        </div>
      }
    >
      <ProfileView
        onProductClick={(p) => router.push(`/product/${p.slug || p.id || p._id}`)}
        onNavigate={(p) => router.push(`/${p === "home" ? "" : p}`)}
      />
    </Suspense>
  );
}
