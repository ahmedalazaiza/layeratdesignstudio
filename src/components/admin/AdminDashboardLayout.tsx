import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Layers,
  FileCheck,
  Users,
  Edit3,
  Gift,
  TrendingUp,
  ExternalLink,
  Sun,
  Moon,
  Laptop,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Star,
} from "lucide-react";
import { OverviewAdminPanel } from "./OverviewAdminPanel";
import { AnalyticsAdminPanel } from "./AnalyticsAdminPanel";
import { ProductsAdminPanel } from "./ProductsAdminPanel";
import { CategoriesAdminPanel } from "./CategoriesAdminPanel";
import { PublisherApplicationsPanel } from "./PublisherApplicationsPanel";
import { UsersAdminPanel } from "./UsersAdminPanel";
import { ReviewsAdminPanel } from "./ReviewsAdminPanel";
import { SiteContentAdminPanel } from "./SiteContentAdminPanel";
import { GiftSettingsPanel } from "./GiftSettingsPanel";
import { TagsAdminPanel } from "./TagsAdminPanel";
import { LayeratLogo, LayeratIconSvg } from "../brand/LayeratLogo";
import { Hash } from "lucide-react";
import type { Page, AuthUser, Category, Product } from "../../types";

export type AdminTab =
  | "overview"
  | "analytics"
  | "products"
  | "reviews"
  | "categories"
  | "tags"
  | "publishers"
  | "users"
  | "cms"
  | "gift";

interface AdminDashboardLayoutProps {
  authUser: AuthUser | null;
  onNavigate: (p: Page) => void;
  categories: Category[];
  products: Product[];
  isDark: boolean;
  themeMode?: "light" | "dark" | "system";
  onThemeChange?: (mode: "light" | "dark" | "system") => void;
  onToggleTheme?: () => void;
  onLogout: () => void;
}

export function AdminDashboardLayout({
  authUser,
  onNavigate,
  categories,
  products,
  isDark,
  themeMode = "system",
  onThemeChange,
  onToggleTheme,
  onLogout,
}: AdminDashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [collapsed, setCollapsed] = useState(false);

  // Security access check
  const isAdmin =
    authUser &&
    (authUser.role === "admin" ||
      authUser.email?.toLowerCase().trim() === "ahmedazy.uxui@gmail.com");

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="text-center bg-card p-10 rounded-3xl border border-border max-w-md shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Administrator Access Required
          </h1>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            You must be logged in as an administrator to access the Layerat Studio management console.
          </p>
          <button
            onClick={() => onNavigate("home")}
            className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all cursor-pointer"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "analytics", label: "Marketing & Leads", icon: TrendingUp },
    { id: "products", label: "Free Resources", icon: Package },
    { id: "reviews", label: "Product Reviews", icon: Star },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "tags", label: "Tags & Keywords", icon: Hash },
    { id: "publishers", label: "Publisher Requests", icon: FileCheck },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "cms", label: "Site Pages CMS", icon: Edit3 },
    { id: "gift", label: "Gift Modal Engine", icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary selection:text-primary-foreground font-sans">
      {/* ── TOP HEADER / ADMIN BAR ───────────────────────────────────────── */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between">
        {/* Left: Brand + Breadcrumbs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("home")}
              className="hover:opacity-85 transition-opacity cursor-pointer flex items-center"
              title="Return to Website"
            >
              <LayeratLogo isDark={isDark} height={24} className="h-6 w-auto" />
            </button>
            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 hidden sm:inline-block">
              Admin
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground border-l border-border pl-4 ml-2">
            <span>Console</span>
            <span>/</span>
            <span className="text-foreground font-bold font-mono capitalize">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Switch to Live Site */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border hover:border-primary/40 bg-background/50 text-xs font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">View Live Website</span>
          </button>

          {/* Theme Mode Segmented Selector */}
          <div className="flex items-center bg-background/60 p-0.5 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => onThemeChange?.("light")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                themeMode === "light"
                  ? "bg-card text-foreground shadow-sm font-bold border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Light Mode"
            >
              <Sun size={13} />
            </button>
            <button
              type="button"
              onClick={() => onThemeChange?.("dark")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                themeMode === "dark"
                  ? "bg-card text-foreground shadow-sm font-bold border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Dark Mode"
            >
              <Moon size={13} />
            </button>
            <button
              type="button"
              onClick={() => onThemeChange?.("system")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                themeMode === "system"
                  ? "bg-card text-foreground shadow-sm font-bold border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Match System Theme"
            >
              <Laptop size={13} />
            </button>
          </div>

          {/* Admin Identity */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-border">
            {authUser?.avatar ? (
              <img
                src={authUser.avatar}
                alt={authUser.name}
                className="w-8 h-8 rounded-xl object-cover border border-primary/30 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-display font-bold text-primary shrink-0">
                {(authUser?.name || "Admin")[0].toUpperCase()}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
                {authUser?.name || "Ahmed Al-Azaiza"}
              </p>
              <p className="text-[10px] font-mono text-primary font-bold">
                Studio Admin
              </p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={onLogout}
            title="Sign out of Admin Console"
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── MAIN DASHBOARD BODY (SIDEBAR + CONTENT) ─────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`border-r border-border bg-card/50 transition-all duration-300 flex flex-col shrink-0 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer text-left relative ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}

                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="admin-active-pill"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Collapse Toggle */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              {!collapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>
        </aside>

        {/* Dynamic Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && (
                <OverviewAdminPanel
                  products={products}
                  categories={categories}
                  onNavigateTab={(tab) => setActiveTab(tab as AdminTab)}
                />
              )}

              {activeTab === "analytics" && (
                <AnalyticsAdminPanel
                  products={products}
                  categories={categories}
                />
              )}

              {activeTab === "products" && (
                <ProductsAdminPanel categories={categories} />
              )}

              {activeTab === "reviews" && (
                <ReviewsAdminPanel
                  products={products}
                  currentAuthUser={authUser}
                />
              )}

              {activeTab === "categories" && (
                <CategoriesAdminPanel categories={categories} />
              )}

              {activeTab === "tags" && <TagsAdminPanel />}

              {activeTab === "publishers" && <PublisherApplicationsPanel />}

              {activeTab === "users" && (
                <UsersAdminPanel currentAuthUser={authUser} />
              )}

              {activeTab === "cms" && <SiteContentAdminPanel />}

              {activeTab === "gift" && <GiftSettingsPanel />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
