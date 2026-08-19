import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Download,
  Zap,
  Award,
  Globe,
  ArrowUpRight,
  Check,
  CheckCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import { CustomSelect } from "../components/ui/CustomSelect";
import { Footer } from "../components/layout/Footer";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import type { Page, Category } from "../types";

interface PublisherPageProps {
  onNavigate: (p: Page) => void;
  categories: Category[];
}

export function PublisherPage({ onNavigate, categories }: PublisherPageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    portfolio: "",
    social: "",
    experience: "1-2",
    categories: [] as string[],
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const toggleCategory = (cat: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const { error } = await supabase.from("publisher_applications").insert({
        name: form.name,
        email: form.email,
        portfolio: form.portfolio || null,
        social: form.social || null,
        experience: form.experience || null,
        categories: form.categories,
        message: form.message || null,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          setStatus("error");
          setErrorMsg("You have already submitted an application with this email.");
          toast.error("Application already submitted with this email.");
          return;
        }
        throw error;
      }

      setStatus("success");
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      console.error("Publisher application error:", err);
      setStatus("error");
      setErrorMsg(err.message || "Failed to submit application.");
      toast.error("Failed to submit application.");
    }
  };

  const benefits = [
    {
      icon: Download,
      title: "Global Reach",
      desc: "Put your resources in front of 12,000+ active UX/UI designers worldwide. Your work ships without borders.",
      color: "#aaff38",
    },
    {
      icon: Zap,
      title: "Instant Publishing",
      desc: "Upload once, we handle delivery, hosting, and distribution. Focus on creating — we handle the rest.",
      color: "#60a5fa",
    },
    {
      icon: Award,
      title: "Community Recognition",
      desc: "Get featured, reviewed, and recommended by a community of professionals who actually use your work.",
      color: "#f59e0b",
    },
    {
      icon: Globe,
      title: "Your Dedicated Profile",
      desc: "A dedicated publisher profile showcasing all your resources and building your personal brand.",
      color: "#c084fc",
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Apply with Your Portfolio",
      desc: "Fill out the form below with links to your best Figma work. We look for quality, consistency, and a clear design voice.",
    },
    {
      n: "02",
      title: "We Review Within 48 Hours",
      desc: "Our curation team reviews every application personally. You'll hear back with feedback regardless of the outcome.",
    },
    {
      n: "03",
      title: "Start Publishing",
      desc: "Once approved, get access to upload your resources and share your craft with the community.",
    },
  ];

  const resourceCategories = [
    "UI Kits",
    "Landing Page Templates",
    "Design Systems",
    "Wireframe Kits",
    "Icon Packs",
    "Device Mockups",
    "UX Flow Diagrams",
    "3D Assets",
  ];

  const experienceOptions = [
    { value: "1-2", label: "1–2 years Figma experience" },
    { value: "3-4", label: "3–4 years Figma experience" },
    { value: "5+", label: "5+ years Figma experience" },
  ];

  const inputClass =
    "w-full px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base sm:text-sm";

  return (
    <motion.main
      key="publisher"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen pt-20"
    >
      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[140px] bg-[#aaff38]/5 dark:bg-[#aaff38]/6" />
        </div>

        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Now Accepting Publisher Applications
          </motion.div>

          {["Publish Your", "Designs.", "Reach Thousands."].map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.h1
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.1 * i,
                }}
                className={`text-5xl md:text-7xl lg:text-8xl font-display font-extrabold leading-[0.92] tracking-tight ${
                  i === 1 ? "text-primary" : "text-foreground"
                }`}
              >
                {line}
              </motion.h1>
            </div>
          ))}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Join Layerat as a creator and put your Figma resources — UI kits,
            templates, icon packs, and design systems — in front of a global
            community of designers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap gap-4 justify-center mt-10"
          >
            <a
              href="#apply"
              className="group flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base hover:shadow-[0_0_40px_rgba(170,255,56,0.3)] transition-all duration-300 cursor-pointer"
            >
              Apply Now
              <ArrowUpRight
                size={18}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </a>
            <button
              onClick={() => onNavigate("about")}
              className="flex items-center gap-3 px-8 py-4 rounded-full border border-border bg-card text-foreground font-semibold text-base hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
            >
              Learn About Us
            </button>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={ref} className="py-24 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">
              Why Publish with Us
            </span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-display font-extrabold text-foreground">
              Everything a creator needs
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-3xl border border-border bg-card hover:border-primary/40 p-7 relative overflow-hidden transition-all duration-300"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="text-base font-display font-bold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">
              The Process
            </span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-display font-extrabold text-foreground">
              How to join
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative"
              >
                <div className="text-7xl font-display font-black text-primary/10 leading-none mb-4 select-none">
                  {n}
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-24 lg:py-32 bg-muted/20 border-t border-border">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">
              Apply
            </span>
            <h2 className="mt-4 text-4xl font-display font-extrabold text-foreground">
              Start your application
            </h2>
            <p className="mt-4 text-muted-foreground">
              Takes about 3 minutes. We review every application personally.
            </p>
          </div>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-8 rounded-3xl border border-primary/20 bg-card shadow-xl"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={28} className="text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                Application Received!
              </h3>
              <p className="text-muted-foreground mb-2">
                Thanks for applying to become a Layerat publisher. We'll review
                your portfolio and get back to you within 48 hours.
              </p>
              <p className="text-sm text-muted-foreground">
                Confirmation sent to{" "}
                <span className="text-primary font-mono">{form.email}</span>
              </p>
              <button
                onClick={() => onNavigate("home")}
                className="mt-8 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Back to Marketplace
              </button>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 bg-card border border-border rounded-3xl p-8 shadow-xl"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Portfolio / Figma Community URL *
                </label>
                <input
                  name="portfolio"
                  value={form.portfolio}
                  onChange={handleChange}
                  required
                  type="text"
                  placeholder="https://www.figma.com/@yourprofile"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Dribbble / Behance / Website (Optional)
                </label>
                <input
                  name="social"
                  value={form.social}
                  onChange={handleChange}
                  type="text"
                  placeholder="https://dribbble.com/yourprofile"
                  className={inputClass}
                />
              </div>

              <div>
                <CustomSelect
                  label="Figma Experience Level *"
                  options={experienceOptions}
                  value={form.experience}
                  onChange={(v) => setForm((f) => ({ ...f, experience: v }))}
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-3">
                  What type of resources will you publish? *
                </label>
                <div className="flex flex-wrap gap-2">
                  {resourceCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
                        form.categories.includes(cat)
                          ? "bg-primary text-primary-foreground border-primary font-semibold"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background"
                      }`}
                    >
                      {form.categories.includes(cat) && (
                        <Check size={11} className="inline mr-1" />
                      )}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Tell Us About Your Design Work *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your design focus, tools, and the kind of templates or kits you want to publish..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 text-sm text-destructive-foreground bg-destructive/15 border border-destructive/20 rounded-xl px-4 py-3">
                  <AlertCircle size={15} />
                  {errorMsg || "Something went wrong. Please try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || form.categories.length === 0}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:shadow-[0_0_40px_rgba(170,255,56,0.35)] disabled:opacity-60 transition-all duration-300 cursor-pointer shadow-md shadow-primary/20"
              >
                {status === "loading" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{" "}
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit Publisher Application
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                By applying you agree to our community standards. Your portfolio will only be reviewed by the Layerat curation team.
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer onNavigate={onNavigate} categories={categories} />
    </motion.main>
  );
}
