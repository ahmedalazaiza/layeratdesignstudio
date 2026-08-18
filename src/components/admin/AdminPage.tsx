import React from "react";
import { AdminDashboardLayout } from "./AdminDashboardLayout";
import type { Page, AuthUser, Category, Product } from "../../types";

export function AdminPage({
  authUser,
  onNavigate,
  categories,
  products = [],
  isDark = true,
  onToggleTheme = () => {},
  onLogout = () => {},
}: {
  authUser: AuthUser | null;
  onNavigate: (p: Page) => void;
  categories: Category[];
  products?: Product[];
  isDark?: boolean;
  onToggleTheme?: () => void;
  onLogout?: () => void;
}) {
  return (
    <AdminDashboardLayout
      authUser={authUser}
      onNavigate={onNavigate}
      categories={categories}
      products={products}
      isDark={isDark}
      onToggleTheme={onToggleTheme}
      onLogout={onLogout}
    />
  );
}

export { AdminDashboardLayout };