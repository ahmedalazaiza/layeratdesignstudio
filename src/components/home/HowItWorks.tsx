import React, { useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Download, Zap } from "lucide-react";

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

  const SLOW =
    "transform 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease";
  const FAST =
    "transform 0.1s ease, box-shadow 0.5s ease, border-color 0.5s ease";

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
        transition: active ? FAST : SLOW,
      }}
    >
      {children}
    </div>
  );
}

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      icon: Search,
      step: "01",
      title: "Browse & Discover",
      desc: "Explore 500+ curated Figma resources across UI kits, templates, wireframes, and icon packs — organized for fast discovery.",
    },
    {
      icon: Download,
      step: "02",
      title: "1-Click Free Download",
      desc: "Download any resource completely free. Keep track of all your saved assets inside your personal Library.",
    },
    {
      icon: Zap,
      step: "03",
      title: "Open in Figma & Ship",
      desc: "Open directly in Figma, take advantage of Variables & Auto Layout, and ship your client or startup projects faster.",
    },
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">
            How It Works
          </span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-display font-extrabold text-foreground">
            From browse to done in minutes
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ icon: Icon, step, title, desc }, i) => (
            <TiltCard
              key={step}
              className="group rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-[0_6px_32px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_0_60px_rgba(170,255,56,0.08)] relative overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="p-8"
              >
                <div className="absolute top-4 right-5 text-6xl font-display font-black text-foreground/5 select-none pointer-events-none">
                  {step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                  <Icon
                    size={20}
                    className="text-primary group-hover:text-primary-foreground transition-colors duration-300"
                  />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
