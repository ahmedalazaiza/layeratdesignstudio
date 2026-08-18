import React, { useState } from "react";
import { ProductsAdminPanel } from "./ProductsAdminPanel";
import { CategoriesAdminPanel } from "./CategoriesAdminPanel";
import { PublisherApplicationsPanel } from "./PublisherApplicationsPanel";
import { GiftSettingsPanel } from "./GiftSettingsPanel";

import type { Page, AuthUser, Category } from "../../types";

function AdminPage({
  authUser,
  onNavigate,
  categories,
}: {
  authUser: AuthUser | null;
  onNavigate: (p: Page) => void;
  categories: Category[];
}) {
  const [tab, setTab] = useState<
    "products" | "categories" | "publishers" | "gift"
  >("products");
  ("products");

  // حماية: مش أدمن → يرجع للـ home
  if (!authUser || authUser.role !== "admin") {
    return (
      <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Access denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You need admin access to view this page.
          </p>
          <button
            onClick={() => onNavigate("home")}
            className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage products, categories, and publisher applications
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: "products" as const, label: "Products" },
            { id: "categories" as const, label: "Categories" },
            { id: "publishers" as const, label: "Publisher Applications" },
            { id: "gift" as const, label: "Gift Popup" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content placeholders */}
        {tab === "products" && <ProductsAdminPanel categories={categories} />}
        {tab === "categories" && <CategoriesAdminPanel />}
        {tab === "publishers" && <PublisherApplicationsPanel />}
        {tab === "gift" && <GiftSettingsPanel />}
      </div>
    </main>
  );
}
export { AdminPage };