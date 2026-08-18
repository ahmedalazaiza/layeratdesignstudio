import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowUpRight, Users, Star, Download, Sparkles } from "lucide-react";
import type { Page } from "../../types";

interface HeroProps {
  onSearch: (q: string) => void;
  onNavigate: (p: Page) => void;
  onAuthOpen: (mode: "login" | "register" | "forgot_password") => void;
}

export function Hero({ onSearch, onNavigate, onAuthOpen }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const [cmsContent] = useState(() => {
    try {
      const saved = localStorage.getItem("ld_custom_home");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      heroTag: "100% Free Community Launch · 500+ Assets",
      headlinePart1: "The Design",
      headlinePart2: "Resource",
      headlinePart3: "Studio.",
      subheading:
        "Premium Figma UI kits, templates, design systems, and components — completely free for creators, startups, and designers.",
      primaryCtaText: "Browse Free Kits",
      secondaryCtaText: "Join for Free",
      quickCategories: [
        "UI Kits",
        "Landing Pages",
        "Wireframes",
        "Icons",
        "Design Systems",
      ],
      heroPreviewImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=640&fit=crop&auto=format",
    };
  });

  const handleSearch = () => {
    if (searchQuery.trim()) onSearch(searchQuery.trim());
  };

  const quickCategories = cmsContent.quickCategories || [
    "UI Kits",
    "Landing Pages",
    "Wireframes",
    "Icons",
    "Design Systems",
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full blur-[140px] bg-[#aaff38]/5 dark:bg-[#aaff38]/6" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-[#60a5fa]/4 dark:bg-[#60a5fa]/5" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] rounded-full blur-[100px] bg-[#aaff38]/3" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center">
          <div>
            {/* 100% Free Launch Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono font-medium mb-8"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>{cmsContent.heroTag}</span>
            </motion.div>

            {/* Headline */}
            {[
              cmsContent.headlinePart1 || "The Design",
              cmsContent.headlinePart2 || "Resource",
              cmsContent.headlinePart3 || "Studio.",
            ].map((word, i) => (
              <div key={word} className="overflow-hidden">
                <motion.h1
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.1 * i,
                  }}
                  className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold leading-[0.95] tracking-tight mb-1 ${
                    i === 1 ? "text-primary" : "text-foreground"
                  }`}
                >
                  {word}
                </motion.h1>
              </div>
            ))}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-muted-foreground text-base sm:text-lg max-w-lg leading-relaxed mt-6 mb-8"
            >
              {cmsContent.subheading}
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="relative max-w-lg"
            >
              <div className="flex items-center bg-card border border-border rounded-2xl shadow-xl hover:border-primary/40 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 p-1">
                <Search
                  size={18}
                  className="ml-4 text-muted-foreground shrink-0"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search UI kits, templates, icons..."
                  className="flex-1 px-3 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none text-base min-w-0"
                />
                <button
                  onClick={handleSearch}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </div>

              {/* Quick category pills (Wrapped cleanly) */}
              <div className="flex flex-wrap gap-2 mt-3">
                {quickCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSearchQuery(cat);
                      onSearch(cat);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-200 cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              <button
                onClick={() => onNavigate("browse")}
                className="group flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base hover:shadow-[0_0_40px_rgba(170,255,56,0.35)] transition-all duration-300 cursor-pointer"
              >
                <Sparkles size={18} className="text-primary-foreground" />
                <span>{cmsContent.primaryCtaText || "Browse Free Kits"}</span>
                <ArrowUpRight
                  size={18}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </button>
              <button
                onClick={() => onAuthOpen("register")}
                className="group flex items-center gap-3 px-8 py-4 rounded-full border border-border bg-card text-foreground font-semibold text-base hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
              >
                <span>{cmsContent.secondaryCtaText || "Join for Free"}</span>
                <Users size={16} />
              </button>
            </motion.div>
          </div>

          {/* Right: Floating product preview cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Main preview card */}
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-3xl bg-gradient-to-br from-primary/20 via-card to-muted border border-primary/20 overflow-hidden relative shadow-2xl">
                <img
                  src={
                    cmsContent.heroPreviewImage ||
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=640&fit=crop&auto=format"
                  }
                  alt="Featured resource preview"
                  className="w-full h-full object-cover opacity-70 hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[11px] font-mono font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 inline-block mb-1.5">
                    100% FREE
                  </span>
                  <p className="text-base font-display font-bold text-foreground">
                    Orbit SaaS UI Kit
                  </p>
                </div>
              </div>

              {/* Floating stat badges */}
              <div className="absolute -top-6 -left-8 bg-card/90 backdrop-blur-md border border-border rounded-2xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <Star size={13} className="text-primary fill-primary" />
                  <span className="text-sm font-mono font-semibold text-foreground">
                    4.9 Rating
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Community verified
                </p>
              </div>

              <div className="absolute -bottom-6 -right-8 bg-card/90 backdrop-blur-md border border-border rounded-2xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <Download size={13} className="text-primary" />
                  <span className="text-sm font-mono font-semibold text-foreground">
                    50K+
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Free downloads
                </p>
              </div>

              <div className="absolute top-1/2 -right-14 -translate-y-1/2 bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-xl">
                <div className="text-sm font-mono font-bold">500+</div>
                <div className="text-xs opacity-85 font-medium">Free Assets</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-muted-foreground/40 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-primary" />
          </motion.div>
          <span className="text-xs text-muted-foreground font-mono">
            scroll
          </span>
        </motion.div>
      </div>
    </section>
  );
}
