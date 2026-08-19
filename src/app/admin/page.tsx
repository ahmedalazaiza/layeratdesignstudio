"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { AdminDashboardLayout } from "@/components/admin/AdminDashboardLayout";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { useAuth } from "@/hooks/useAuth";
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "@/data/fallbackData";
import type { Category, Product, Page } from "@/types/api";

function AdminContent() {
  const router = useRouter();
  const { authUser, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data: categories = FALLBACK_CATEGORIES } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getProducts({ limit: 100 }),
    staleTime: 60 * 1000,
  });

  const products = productsData?.products || FALLBACK_PRODUCTS;

  const handleNavigate = (page: Page) => {
    if (page === "home") router.push("/");
    else router.push(`/${page}`);
  };

  return (
    <AdminDashboardLayout
      authUser={authUser as any}
      onNavigate={handleNavigate}
      categories={categories}
      products={products}
      isDark={isDark}
      onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
      onLogout={logout}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-muted-foreground font-mono text-xs">
          Loading Layerat Admin Console...
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
