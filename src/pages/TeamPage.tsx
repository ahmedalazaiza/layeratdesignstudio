import React, { useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { Award, Users, Globe, Zap, ExternalLink, ArrowUpRight } from "lucide-react";
import { Footer } from "../components/layout/Footer";
import type { Page, Category } from "../types";

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  color: string;
  avatarUrl?: string;
  links: { label: string; url: string }[];
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Yazeed Al-Harbi",
    role: "Co-Founder & Creative Director",
    bio: "10 years of UX expertise spanning enterprise SaaS, design systems, and mobile apps. Yazeed leads the design direction and quality curation for the platform.",
    initials: "YH",
    color: "#aaff38",
    links: [
      { label: "Portfolio", url: "#" },
      { label: "Figma", url: "#" },
    ],
  },
  {
    name: "Rima Saleh",
    role: "Head of Curation & Quality",
    bio: "Rima reviews community resource submissions and works with creators to raise the quality bar. Her background spans product design and agency work.",
    initials: "RS",
    color: "#60a5fa",
    links: [
      { label: "Dribbble", url: "#" },
      { label: "LinkedIn", url: "#" },
    ],
  },
  {
    name: "Khalid Nasser",
    role: "Design Systems Lead",
    bio: "Khalid architects design system resources. Deep expertise in Figma Variables, token architecture, and scalable component libraries.",
    initials: "KN",
    color: "#f59e0b",
    links: [{ label: "Figma Community", url: "#" }],
  },
  {
    name: "Nour Al-Masri",
    role: "UX Research & Community",
    bio: "Nour shapes our understanding of designer needs. She curates the free resources library and nurtures the creator community.",
    initials: "NA",
    color: "#c084fc",
    links: [
      { label: "LinkedIn", url: "#" },
      { label: "Website", url: "#" },
    ],
  },
  {
    name: "Tariq Ramadan",
    role: "Platform Engineer",
    bio: "Tariq builds the technical infrastructure powering Layerat — from the asset delivery system to the creator dashboard and API.",
    initials: "TR",
    color: "#34d399",
    links: [{ label: "GitHub", url: "#" }],
  },
  {
    name: "Lina Hassan",
    role: "Creator Relations",
    bio: "Lina is the bridge between our creator community and the studio. She helps publishers distribute their resources and reach more designers.",
    initials: "LH",
    color: "#f472b6",
    links: [{ label: "LinkedIn", url: "#" }],
  },
];

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

interface TeamPageProps {
  onNavigate: (p: Page) => void;
  categories: Category[];
}

export function TeamPage({ onNavigate, categories }: TeamPageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const [members] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem("ld_custom_team");
      if (saved) return JSON.parse(saved);
    } catch {}
    return TEAM_MEMBERS;
  });

  const values = [
    {
      icon: Award,
      label: "Craft First",
      desc: "We obsess over quality so our users don't have to second-guess what they download.",
    },
    {
      icon: Users,
      label: "Community Driven",
      desc: "Every decision is shaped by the designers who use the platform daily.",
    },
    {
      icon: Globe,
      label: "100% Free Access",
      desc: "Our resources are completely free for the global design community.",
    },
    {
      icon: Zap,
      label: "Ship Fast",
      desc: "We move quickly, iterate based on feedback, and support the next wave of creators.",
    },
  ];

  return (
    <motion.main
      key="team"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen pt-20"
    >
      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[130px] bg-[#aaff38]/5 dark:bg-[#aaff38]/6" />
        </div>
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            The People Behind Layerat
          </motion.div>
          <div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl font-display font-extrabold leading-[0.9] tracking-tight text-foreground"
            >
              Our Team
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            A dedicated team of UX/UI designers, builders, and community supporters on a mission to make world-class Figma resources freely accessible.
          </motion.p>
        </div>
      </section>

      {/* Team Grid */}
      <section ref={ref} className="pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member, i) => (
              <TiltCard
                key={member.name}
                className="group rounded-3xl border border-border bg-card hover:border-primary/40 p-7 relative overflow-hidden transition-all duration-300 shadow-md"
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-2xl object-cover mb-5 shadow-md border-2 border-border group-hover:border-primary/40 group-hover:scale-105 transition-all duration-300"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-display font-black mb-5 transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: `${member.color || "#aaff38"}20`,
                        color: member.color || "#aaff38",
                        border: `2px solid ${member.color || "#aaff38"}30`,
                      }}
                    >
                      {member.initials || (member.name ? member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "TM")}
                    </div>
                  )}

                  <h3 className="text-lg font-display font-bold text-foreground mb-0.5">
                    {member.name}
                  </h3>
                  <p className="text-xs font-mono text-primary mb-4">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {member.bio}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {member.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-all duration-200"
                      >
                        <ExternalLink size={11} />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-y border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">
              How We Work
            </span>
            <h2 className="mt-4 text-4xl font-display font-extrabold text-foreground">
              Our values
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-3xl border border-border bg-card hover:border-primary/30 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="text-base font-display font-bold text-foreground mb-2">
                  {label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-display font-extrabold text-foreground mb-4">
            Want to publish with us?
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            If you are passionate about design tooling and want to share your Figma creations with the community, we'd love to have you onboard.
          </p>
          <button
            onClick={() => onNavigate("publisher")}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-black font-extrabold text-sm sm:text-base hover:shadow-[0_0_40px_rgba(170,255,56,0.35)] transition-all duration-300 cursor-pointer shadow-md shadow-primary/20"
          >
            <span>Publish With Us</span>
            <ArrowUpRight
              size={18}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </button>
        </div>
      </section>

      <Footer onNavigate={onNavigate} categories={categories} />
    </motion.main>
  );
}
