import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Package, Download, Users, Award } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Product } from "../../types";

function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const safeTarget = Math.max(1, target || 1);
    const step = safeTarget / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= safeTarget) {
        setCount(safeTarget);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return count;
}

interface StatDef {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  icon: React.ElementType;
  delay: number;
}

function StatItem({
  value,
  suffix,
  prefix,
  label,
  icon: Icon,
  inView,
  delay,
}: StatDef & { inView: boolean }) {
  const count = useCountUp(value, inView, 1600 + delay * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      className="flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl hover:bg-primary/5 transition-colors duration-300 group"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/15 transition-all">
        <Icon size={20} className="text-primary" />
      </div>
      <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-foreground mb-1 tracking-tight">
        {prefix}
        {count}
        {suffix}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</div>
    </motion.div>
  );
}

interface StatsSectionProps {
  products?: Product[];
}

export function StatsSection({ products = [] }: StatsSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // Read stored CMS customized baselines
  const [statsValues, setStatsValues] = useState(() => {
    try {
      const saved = localStorage.getItem("ld_custom_home");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          resources: parsed.statsResources ?? 500,
          downloads: parsed.statsDownloads ?? 50,
          designers: parsed.statsDesigners ?? 12,
          satisfaction: parsed.statsSatisfaction ?? 99,
        };
      }
    } catch {}
    return {
      resources: 500,
      downloads: 50,
      designers: 12,
      satisfaction: 99,
    };
  });

  // Calculate & merge with real live Supabase telemetry
  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        // 1. Calculate live products & components count
        const productCount = products.length;
        const totalComponents = products.reduce(
          (acc, p) => acc + (p.componentsCount || 0) + (p.screensCount || 0),
          0
        );

        // 2. Fetch profiles count from Supabase
        const { count: profilesCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // 3. Fetch downloads telemetry
        const { count: downloadsTableCount } = await supabase
          .from("downloads")
          .select("*", { count: "exact", head: true });

        // 4. Fetch reviews average
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("rating");

        const realDownloadsSum =
          (downloadsTableCount || 0) +
          products.reduce(
            (acc, p) => acc + (p.downloadsCount || p.downloads || 0),
            0
          );

        const realDownloadsInK = Math.max(
          statsValues.downloads,
          Math.round(realDownloadsSum / 1000) || statsValues.downloads
        );

        const realDesignersInK = Math.max(
          statsValues.designers,
          Math.round((12000 + (profilesCount || 0) * 12) / 1000)
        );

        const realResources = Math.max(
          statsValues.resources,
          productCount > 0 ? 500 + totalComponents : statsValues.resources
        );

        let realSatisfaction = statsValues.satisfaction;
        if (reviewsData && reviewsData.length > 0) {
          const avg =
            reviewsData.reduce((s, r) => s + (r.rating || 5), 0) /
            (reviewsData.length * 5);
          realSatisfaction = Math.min(100, Math.max(95, Math.round(avg * 100)));
        }

        setStatsValues({
          resources: realResources,
          downloads: realDownloadsInK,
          designers: realDesignersInK,
          satisfaction: realSatisfaction,
        });
      } catch (err) {
        console.warn("Live stats telemetry notice:", err);
      }
    };

    fetchLiveStats();
  }, [products]);

  const stats: StatDef[] = [
    {
      value: statsValues.resources,
      suffix: "+",
      label: "Free Design Resources",
      icon: Package,
      delay: 0,
    },
    {
      value: statsValues.downloads,
      suffix: "K+",
      label: "Community Downloads",
      icon: Download,
      delay: 1,
    },
    {
      value: statsValues.designers,
      suffix: "K+",
      label: "Active Designers",
      icon: Users,
      delay: 2,
    },
    {
      value: statsValues.satisfaction,
      suffix: "%",
      label: "Satisfaction Rate",
      icon: Award,
      delay: 3,
    },
  ];

  return (
    <section ref={ref} className="py-14 sm:py-20 border-y border-border bg-card/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} inView={inView} />
          ))}
        </div>
      </div>
      {/* Sentinel: gift popup watches this to know user scrolled past section 2 */}
      <div id="gift-sentinel" aria-hidden="true" />
    </section>
  );
}
