import React, { useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  Package,
  Download,
  Users,
  Clock,
  Award,
  Globe,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { Footer } from "../components/layout/Footer";
import type { Page, Category } from "../types";

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
        {value}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </motion.div>
  );
}

function TiltCard({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x, y });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => {
        setTilt({ x: 0, y: 0 });
        setActive(false);
      }}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: active
          ? "transform 0.1s ease, box-shadow 0.5s ease, border-color 0.5s ease"
          : "transform 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease",
      }}
    >
      {children}
    </div>
  );
}

interface AboutPageProps {
  onNavigate: (p: Page) => void;
  categories: Category[];
}

export function AboutPage({ onNavigate, categories }: AboutPageProps) {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const storyRef = useRef<HTMLDivElement>(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-80px" });

  const [aboutData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("ld_custom_about");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const stats: StatDef[] = [
    {
      value: 500,
      suffix: "+",
      label: aboutData?.stats?.[0]?.label || "Free Resources",
      icon: Package,
      delay: 0,
    },
    {
      value: 50,
      suffix: "K+",
      label: aboutData?.stats?.[1]?.label || "Downloads",
      icon: Download,
      delay: 1,
    },
    {
      value: 12,
      suffix: "K+",
      label: aboutData?.stats?.[2]?.label || "Designers",
      icon: Users,
      delay: 2,
    },
    {
      value: 4,
      suffix: " Yrs",
      label: aboutData?.stats?.[3]?.label || "Community Built",
      icon: Clock,
      delay: 3,
    },
  ];

  const milestones = [
    {
      year: "2021",
      title: "The Idea",
      desc: "Frustrated by scattered, low-quality Figma resources, our founders decided to build the marketplace they always wished existed.",
    },
    {
      year: "2022",
      title: "First Resources",
      desc: "Launched with 50 hand-crafted resources across UI Kits and design systems. Our community grew to 1,000 designers in the first 3 months.",
    },
    {
      year: "2023",
      title: "Publisher Program",
      desc: "Opened the platform to external creators, giving talented designers a home to share their work with a global audience.",
    },
    {
      year: "2024+",
      title: "100% Free Community Launch",
      desc: "Committed to delivering all design systems, kits, and resources completely free for the design community.",
    },
  ];

  const principles = [
    {
      icon: Award,
      color: "#aaff38",
      title: "Quality Over Quantity",
      desc: "Every resource is reviewed by our team before it goes live. We would rather have 100 exceptional resources than 10,000 mediocre ones. Quality is non-negotiable.",
    },
    {
      icon: Users,
      color: "#60a5fa",
      title: "Designer-First",
      desc: "Every feature, every policy, every decision starts with one question: is this good for the designers using our platform? We are designers building for designers.",
    },
    {
      icon: Globe,
      color: "#f59e0b",
      title: "Open Community",
      desc: "All our design resources are 100% free. Great design tools should be accessible regardless of budget or geography.",
    },
    {
      icon: Shield,
      color: "#c084fc",
      title: "Trust & Transparency",
      desc: "Clear licensing, honest file descriptions, and clean Figma files with Auto Layout and Variables. We build trust by being transparent.",
    },
  ];

  return (
    <motion.main
      key="about"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen pt-20"
    >
      {/* Hero */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[140px] bg-[#aaff38]/5 dark:bg-[#aaff38]/6" />
        </div>
        <div className="max-w-5xl mx-auto px-6 lg:px-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Our Story
          </motion.div>

          {["About", "Layerat."].map((word, i) => (
            <div key={word} className="overflow-hidden">
              <motion.h1
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.1 * i,
                }}
                className={`text-6xl md:text-8xl font-display font-extrabold leading-[0.9] tracking-tight ${
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
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            We are a design-first studio on a mission to give every UX/UI
            designer access to top-tier Figma resources — without compromise, and 100% free.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((s) => (
              <StatItem key={s.label} {...s} inView={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section ref={storyRef} className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">
                Our Mission
              </span>
              <h2 className="mt-4 text-4xl lg:text-5xl font-display font-extrabold text-foreground leading-tight">
                Great design tools should be accessible to everyone
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Layerat was born from a simple frustration: great Figma
                resources were scattered, inconsistently quality-checked, and
                hard to trust. We set out to build the destination every UX/UI
                designer deserves — a curated, community-driven studio
                where you can find tools that actually ship.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We partner with talented designers worldwide — from independent
                freelancers to agency teams — to bring you resources that
                reflect real-world design challenges and modern Figma best
                practices.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate("browse")}
                  className="group flex items-center gap-3 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all duration-300 cursor-pointer"
                >
                  Browse Free Kits{" "}
                  <ArrowUpRight
                    size={15}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </button>
                <button
                  onClick={() => onNavigate("team")}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-full border border-border text-foreground font-semibold text-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                >
                  Meet the Team
                </button>
              </div>
            </motion.div>

            {/* Milestones */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative pl-8"
            >
              <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, x: 20 }}
                    animate={storyInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="relative"
                  >
                    <div className="absolute -left-10 top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-card" />
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {m.year}
                    </span>
                    <h3 className="text-lg font-display font-bold text-foreground mt-2 mb-1">
                      {m.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {m.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-24 border-y border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">
              What We Stand For
            </span>
            <h2 className="mt-4 text-4xl font-display font-extrabold text-foreground">
              Our principles
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {principles.map(({ icon: Icon, color, title, desc }, i) => (
              <TiltCard
                key={title}
                className="group rounded-3xl border border-border bg-card hover:border-primary/40 p-8 relative overflow-hidden transition-all duration-300 shadow-md"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex gap-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: `${color}18`,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-foreground mb-3">
                        {title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-display font-extrabold text-foreground mb-4">
            Ready to explore?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Browse 500+ free Figma resources — or join as a creator and share
            your work with the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            <button
              onClick={() => onNavigate("browse")}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-black font-extrabold text-sm sm:text-base hover:shadow-[0_0_40px_rgba(170,255,56,0.35)] transition-all duration-300 cursor-pointer shadow-md shadow-primary/20"
            >
              <span>Browse Free Resources</span>
              <ArrowUpRight
                size={18}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </button>
            <button
              onClick={() => onNavigate("publisher")}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-border bg-card text-foreground font-semibold text-sm sm:text-base hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
            >
              Become a Publisher
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} categories={categories} />
    </motion.main>
  );
}
