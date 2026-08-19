"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  Sparkles,
  Download,
  Star,
  Layers,
  Layout,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Shield,
  Zap,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LayeratLogo } from "@/components/brand/LayeratLogo";

const FEATURED_KITS = [
  {
    id: "zenith-saas-kit",
    title: "Zenith — Modern SaaS Dashboard UI Kit",
    category: "Web & SaaS UI",
    downloads: 1420,
    rating: 4.9,
    screens: 48,
    tags: ["Auto Layout 5.0", "Variables", "Dark Mode"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    description: "Complete analytics, billing, user tables, and settings flows crafted with atomic design principles.",
  },
  {
    id: "pulse-mobile-flow",
    title: "Pulse — iOS 18 FinTech & Banking App",
    category: "Mobile UI",
    downloads: 980,
    rating: 5.0,
    screens: 64,
    tags: ["iOS 18", "Components", "Free"],
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    description: "Pixel-perfect mobile banking screens with card transactions, crypto wallet, and biometric authentication.",
  },
  {
    id: "strata-design-system",
    title: "Strata — Enterprise Design System 2.0",
    category: "Design Systems",
    downloads: 2150,
    rating: 4.95,
    screens: 120,
    tags: ["Tokens", "Variables", "Multi-brand"],
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    description: "Robust color scales, typography ramps, responsive layout grids, and 200+ accessible primitives.",
  },
];

const CATEGORIES = [
  {
    name: "Mobile UI Kits",
    slug: "mobile-ui",
    icon: Smartphone,
    count: "45+ Kits",
    color: "from-emerald-500/20 to-teal-500/5",
    accent: "#10b981",
  },
  {
    name: "Web & SaaS UI",
    slug: "web-saas-ui",
    icon: Layout,
    count: "60+ Kits",
    color: "from-blue-500/20 to-indigo-500/5",
    accent: "#3b82f6",
  },
  {
    name: "Design Systems",
    slug: "design-systems",
    icon: Layers,
    count: "25+ Systems",
    color: "from-purple-500/20 to-pink-500/5",
    accent: "#a855f7",
  },
  {
    name: "Wireframe Blueprints",
    slug: "wireframe-kits",
    icon: Palette,
    count: "30+ Kits",
    color: "from-amber-500/20 to-yellow-500/5",
    accent: "#f59e0b",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full overflow-hidden py-16 sm:py-24 lg:py-32 flex flex-col items-center">
        {/* Ambient Glowing Background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* Top Launch Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-bold"
          >
            <Sparkles size={14} />
            <span>100% Free Community Edition · 500+ Figma Assets</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]"
          >
            The Premium{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Figma Resource
            </span>{" "}
            Studio.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            High-caliber UI kits, mobile application flows, responsive design
            systems, and vector icons crafted with Auto Layout 5.0 and Figma
            Variables.
          </motion.p>

          {/* Hero Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto w-full pt-2"
          >
            <form
              onSubmit={handleSearch}
              className="relative flex items-center rounded-full bg-card/90 border border-border/80 p-1.5 shadow-2xl shadow-black/10 focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/15 transition-all"
            >
              <Search
                size={20}
                className="text-muted-foreground ml-4 shrink-0"
              />
              <input
                type="text"
                placeholder="Search SaaS dashboard, mobile kit, design tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                className="rounded-full px-6 text-xs font-bold shrink-0"
              >
                Search Kits
              </Button>
            </form>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-muted-foreground font-mono">Popular:</span>
              {["SaaS Dashboard", "iOS 18 Kit", "Design Tokens", "Wireframes"].map(
                (chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() =>
                      router.push(`/browse?search=${encodeURIComponent(chip)}`)
                    }
                    className="px-3 py-1 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border text-muted-foreground font-medium transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                )
              )}
            </div>
          </motion.div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-10 border-t border-border/50">
            {[
              { label: "Free Resources", value: "500+" },
              { label: "Community Downloads", value: "48K+" },
              { label: "Figma Variables Ready", value: "100%" },
              { label: "License", value: "Commercial Free" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories Section ─── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              Explore Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
              Curated by Design Category
            </h2>
          </div>
          <Link
            href="/browse"
            className="text-xs font-bold font-mono text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/browse?category=${cat.slug}`}
                className="group relative p-6 rounded-3xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${cat.accent}20`,
                    color: cat.accent,
                  }}
                >
                  <Icon size={24} />
                </div>

                <div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono mt-1 block">
                    {cat.count}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore Kit</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Featured Resources Section ─── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              Trending Releases
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
              Featured Figma Resources
            </h2>
          </div>
          <Link
            href="/browse"
            className="text-xs font-bold font-mono text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Browse All Resources</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_KITS.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-2xl group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className="bg-primary/90 backdrop-blur-md text-primary-foreground font-bold font-mono text-[11px]">
                      FREE
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>{item.category}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={13} className="fill-amber-500" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-border/50 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                  <Download size={13} />
                  <span>{item.downloads} downloads</span>
                </div>
                <Link
                  href={`/browse?product=${item.id}`}
                  className="inline-flex items-center gap-1 font-bold text-primary hover:underline cursor-pointer"
                >
                  <span>Preview Kit</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Studio Advantages Grid ─── */}
      <section className="w-full bg-card/40 border-y border-border py-20 my-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              The Layerat Standard
            </span>
            <h2 className="text-3xl font-extrabold text-foreground">
              Engineered for Serious Designers & Developers
            </h2>
            <p className="text-sm text-muted-foreground">
              Every kit in our repository is vetted for production standards,
              clean layer naming, and full responsiveness.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Auto Layout 5.0 Everything",
                description:
                  "Zero static frames. Every component adapts dynamically with min/max constraints and responsive wrap behaviors.",
              },
              {
                icon: Palette,
                title: "Native Figma Variables",
                description:
                  "Seamless light and dark mode switching with organized semantic color tokens, spacing aliases, and radii.",
              },
              {
                icon: Shield,
                title: "100% Free Commercial License",
                description:
                  "Use for client deliverables, personal projects, or commercial SaaS applications without restrictive paywalls.",
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl border border-border bg-card space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
