import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Download,
  Eye,
  Users,
  FileCheck,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Plus,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Product, Category } from "../../types";

interface OverviewAdminPanelProps {
  products: Product[];
  categories: Category[];
  onNavigateTab: (tab: string) => void;
}

export function OverviewAdminPanel({
  products,
  categories,
  onNavigateTab,
}: OverviewAdminPanelProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDownloads: 0,
    totalViews: 0,
    pendingPublishers: 0,
  });
  const [recentPublishers, setRecentPublishers] = useState<any[]>([]);
  const [recentDownloads, setRecentDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);

        // 1. Users count
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // 2. Downloads count
        const { count: downloadsCount } = await supabase
          .from("downloads")
          .select("*", { count: "exact", head: true });

        // 3. Views count
        const { count: viewsCount } = await supabase
          .from("product_views")
          .select("*", { count: "exact", head: true });

        // 4. Pending publishers count & list
        const { data: pubData, count: pubCount } = await supabase
          .from("publisher_applications")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(5);

        // 5. Recent downloads
        const { data: downData } = await supabase
          .from("downloads")
          .select("*, products(title, thumbnail_url, slug)")
          .order("downloaded_at", { ascending: false })
          .limit(5);

        // Sum product-level views/downloads if table count is 0 (fallback)
        const aggregatedDownloads = products.reduce(
          (sum, p) => sum + (p.downloadsCount || p.downloads || 0),
          0
        );
        const aggregatedViews = products.reduce(
          (sum, p) => sum + (p.viewsCount || p.views || 0),
          0
        );

        setStats({
          totalUsers: usersCount || 1,
          totalDownloads: downloadsCount || aggregatedDownloads,
          totalViews: viewsCount || aggregatedViews,
          pendingPublishers: pubCount || 0,
        });

        setRecentPublishers(pubData || []);
        setRecentDownloads(downData || []);
      } catch (err) {
        console.error("Error loading overview stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [products]);

  const kpis = [
    {
      label: "Free Resources",
      value: products.length,
      icon: Package,
      color: "#aaff38",
      subtext: "100% Free Community Edition",
      action: () => onNavigateTab("products"),
    },
    {
      label: "Total Downloads",
      value: stats.totalDownloads.toLocaleString(),
      icon: Download,
      color: "#60a5fa",
      subtext: "Across all design kits",
      action: () => onNavigateTab("products"),
    },
    {
      label: "Total Views",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: "#c084fc",
      subtext: "Global design impressions",
      action: () => onNavigateTab("products"),
    },
    {
      label: "Publisher Requests",
      value: stats.pendingPublishers,
      icon: FileCheck,
      color: "#f59e0b",
      subtext: `${stats.pendingPublishers} awaiting review`,
      action: () => onNavigateTab("publishers"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-3">
              <Sparkles size={12} /> Live Studio Dashboard
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-foreground">
              Studio Performance Overview
            </h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Monitor community resource growth, manage designer applications, and control all site content from a centralized command center.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("products")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_25px_rgba(170,255,56,0.25)] transition-all cursor-pointer"
            >
              <Plus size={16} /> Add Resource
            </button>
            <button
              onClick={() => onNavigateTab("publishers")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-background hover:border-primary/40 text-foreground font-medium text-sm transition-colors cursor-pointer"
            >
              <FileCheck size={16} /> Review Applicants
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={kpi.action}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                {kpi.label}
              </span>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: `${kpi.color}15`,
                  border: `1px solid ${kpi.color}30`,
                }}
              >
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
            </div>

            <div className="text-3xl font-display font-black text-foreground mb-1">
              {kpi.value}
            </div>

            <p className="text-xs text-muted-foreground flex items-center justify-between">
              <span>{kpi.subtext}</span>
              <ArrowUpRight
                size={14}
                className="opacity-0 group-hover:opacity-100 text-primary transition-opacity"
              />
            </p>
          </motion.div>
        ))}
      </div>

      {/* Bottom Grid: Recent Resources & Publisher Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Resources */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div>
              <h3 className="font-display font-bold text-foreground text-lg">
                Active Resources
              </h3>
              <p className="text-xs text-muted-foreground">
                Top curated design kits in the library
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("products")}
              className="text-xs text-primary font-mono font-bold hover:underline"
            >
              View all ({products.length})
            </button>
          </div>

          <div className="space-y-3">
            {products.slice(0, 5).map((prod) => (
              <div
                key={prod.id}
                className="flex items-center gap-4 p-3 rounded-2xl border border-border/50 bg-background/50 hover:border-border transition-colors"
              >
                <img
                  src={prod.thumbnail}
                  alt={prod.title}
                  className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">
                    {prod.title}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {prod.fileSize || "45 MB"} · {prod.formats?.[0] || "Figma"}
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-muted-foreground">
                  <span className="font-bold text-foreground block">
                    {(prod.downloadsCount || prod.downloads || 0).toLocaleString()}
                  </span>
                  downloads
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publisher Requests */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div>
              <h3 className="font-display font-bold text-foreground text-lg">
                Publisher Applications
              </h3>
              <p className="text-xs text-muted-foreground">
                Creators requesting to publish design resources
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("publishers")}
              className="text-xs text-primary font-mono font-bold hover:underline"
            >
              Manage ({stats.pendingPublishers})
            </button>
          </div>

          {recentPublishers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCheck size={36} className="mx-auto mb-3 opacity-30 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                No new applications
              </p>
              <p className="text-xs max-w-xs mx-auto mt-1">
                When designers submit through the Publisher page, their requests will appear here for one-click approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPublishers.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 bg-background/50"
                >
                  <div>
                    <p className="font-bold text-sm text-foreground">
                      {app.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {app.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.portfolio && (
                      <a
                        href={
                          app.portfolio.startsWith("http")
                            ? app.portfolio
                            : `https://${app.portfolio}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary transition-colors text-xs inline-flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Portfolio
                      </a>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {app.status || "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
