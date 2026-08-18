import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Package, Download, Users, Award } from "lucide-react";

function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
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
      className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-primary/5 transition-colors duration-300 group"
    >
      <Icon
        size={20}
        className="text-primary mb-3 group-hover:scale-110 transition-transform"
      />
      <div className="text-4xl lg:text-5xl font-display font-black text-foreground mb-1">
        {prefix}
        {count}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </motion.div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats: StatDef[] = [
    {
      value: 500,
      suffix: "+",
      label: "Free Design Resources",
      icon: Package,
      delay: 0,
    },
    {
      value: 50,
      suffix: "K+",
      label: "Community Downloads",
      icon: Download,
      delay: 1,
    },
    {
      value: 12,
      suffix: "K+",
      label: "Active Designers",
      icon: Users,
      delay: 2,
    },
    {
      value: 99,
      suffix: "%",
      label: "Satisfaction Rate",
      icon: Award,
      delay: 3,
    },
  ];

  return (
    <section ref={ref} className="py-20 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
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
