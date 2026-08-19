"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useInView } from "framer-motion";
import {
  Download,
  Zap,
  Award,
  Globe,
  ArrowUpRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Send,
  Plus,
  Trash2,
  ShieldCheck,
  Loader2,
  Clock,
  Sparkles,
  Layers,
  Upload,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { publisherService } from "@/services/publisherService";
import {
  becomePublisherSchema,
  type BecomePublisherFormData,
} from "@/lib/validations/publisher";
import { toast } from "sonner";
import type { Page, Category } from "@/types/api";

interface PublisherPageProps {
  onNavigate?: (p: Page) => void;
  categories?: Category[];
}

export function PublisherPage({ onNavigate }: PublisherPageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { authUser, isAuthenticated, openAuthModal, openEmailVerifyModal } = useAuth();

  const [applicationSubmitted, setApplicationSubmitted] = useState<boolean>(false);

  const isEmailVerified = Boolean(
    authUser?.isEmailVerified || authUser?.isVerified
  );

  const isAlreadyPublisher =
    authUser?.role === "publisher" || authUser?.role === "admin";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BecomePublisherFormData>({
    resolver: zodResolver(becomePublisherSchema),
    defaultValues: {
      portfolioLinks: [{ value: "" }],
      websiteUrl: "",
      motivation: "",
      experience: "2-5",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "portfolioLinks",
  });

  const onSubmit = async (data: BecomePublisherFormData) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to apply for the Publisher program.");
      openAuthModal("login");
      return;
    }

    if (!isEmailVerified) {
      toast.error("Verified email required", {
        description: "Please verify your account email before submitting publisher application.",
      });
      openEmailVerifyModal();
      return;
    }

    try {
      await publisherService.apply({
        portfolioLinks: data.portfolioLinks.map((p) => p.value.trim()),
        websiteUrl: data.websiteUrl || undefined,
        motivation: data.motivation || undefined,
        experience: data.experience || undefined,
      });

      setApplicationSubmitted(true);
      reset();
      toast.success("Publisher application submitted for review!");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit application";
      toast.error(msg);
    }
  };

  const benefits = [
    {
      icon: Download,
      title: "Global Reach",
      desc: "Put your resources in front of 20,000+ active UX/UI designers and product teams worldwide.",
      color: "#aaff38",
    },
    {
      icon: Zap,
      title: "Direct Portfolio Growth",
      desc: "Every download links back directly to your verified creator profile, Dribbble, and portfolio.",
      color: "#aaff38",
    },
    {
      icon: Award,
      title: "Publisher Badge",
      desc: "Stand out in the Layerat community with an exclusive Verified Publisher badge on all design systems.",
      color: "#aaff38",
    },
    {
      icon: Globe,
      title: "Free Hosting & CDN",
      desc: "We handle global AWS S3 high-speed presigned downloads and image CDN caching at zero cost.",
      color: "#aaff38",
    },
  ];

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-sm";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-border">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-4">
            <Sparkles size={11} />
            <span>Layerat Creator Partner Program</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground max-w-3xl mx-auto leading-tight mb-4">
            Publish your design systems to thousands of designers
          </h1>

          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Share your UI kits, design systems, and Figma templates. Build your brand, gain global recognition, and get featured on Layerat.
          </p>

          {isAlreadyPublisher ? (
            <div className="inline-flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-mono font-bold">
                <CheckCircle2 size={16} />
                You are a Verified Publisher
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/publisher/products/new"
                  className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all inline-flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload New Product
                </Link>
                <Link
                  href="/publisher/dashboard"
                  className="px-6 py-3 rounded-2xl border border-border bg-card hover:bg-muted text-foreground font-bold text-sm transition-colors inline-flex items-center gap-2"
                >
                  <Layers size={16} />
                  My Published Products
                </Link>
              </div>
            </div>
          ) : (
            <a
              href="#apply-form"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all"
            >
              Apply as Creator
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </section>

      {/* ── Benefits Grid ── */}
      <section className="py-16 border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Why publish on Layerat?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Engineered to showcase your craft and amplify your design presence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl border border-border bg-card hover:border-primary/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-display font-bold text-foreground mb-1">
                    {b.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Application Form Section ── */}
      <section id="apply-form" className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                Publisher Application
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Tell us about your design background and share your portfolio links.
              </p>
            </div>

            {/* Email Verification Gate Callout */}
            {isAuthenticated && !isEmailVerified && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>
                    Email verification required before submitting application (
                    <strong className="font-mono">{authUser?.email}</strong>)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={openEmailVerifyModal}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-mono font-bold text-[11px] shrink-0 hover:bg-amber-600 transition-colors cursor-pointer"
                >
                  Verify Now
                </button>
              </div>
            )}

            {/* Status: Application Pending Review */}
            {applicationSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                  <Clock size={32} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono font-bold">
                  <span>Application Pending Review</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground">
                  Thank You for Applying!
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Our studio curation team reviews applications within 24-48 hours. Once approved, you'll gain access to the Publisher Product Studio.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Dynamic Portfolio Links Array */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block font-medium">
                      Portfolio Links (1 to 3 URLs) <span className="text-primary">*</span>
                    </label>
                    {fields.length < 3 && (
                      <button
                        type="button"
                        onClick={() => append({ value: "" })}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <Plus size={13} /> Add Another Link
                      </button>
                    )}
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          {...register(`portfolioLinks.${index}.value` as const)}
                          placeholder={`Link ${index + 1}: https://dribbble.com/yourname or figma.com/@handle`}
                          className={inputClass}
                        />
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-3 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                            title="Remove link"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      {errors.portfolioLinks?.[index]?.value && (
                        <p className="text-xs text-destructive mt-1 font-medium">
                          {errors.portfolioLinks[index]?.value?.message}
                        </p>
                      )}
                    </div>
                  ))}
                  {errors.portfolioLinks?.message && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {errors.portfolioLinks.message}
                    </p>
                  )}
                </div>

                {/* Website URL */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                    Personal Website / Portfolio (Optional)
                  </label>
                  <input
                    type="url"
                    {...register("websiteUrl")}
                    placeholder="https://yourdomain.com"
                    className={inputClass}
                  />
                  {errors.websiteUrl && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {errors.websiteUrl.message}
                    </p>
                  )}
                </div>

                {/* Experience Select */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                    UI/UX & Design Systems Experience
                  </label>
                  <select {...register("experience")} className={inputClass}>
                    <option value="1-2">1–2 Years (Junior/Mid)</option>
                    <option value="2-5">2–5 Years (Experienced)</option>
                    <option value="5+">5+ Years (Senior / Lead Designer)</option>
                    <option value="agency">Design Agency / Studio Team</option>
                  </select>
                </div>

                {/* Motivation / Message */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                    Why do you want to publish on Layerat? (Optional)
                  </label>
                  <textarea
                    rows={3}
                    {...register("motivation")}
                    placeholder="Tell us what kind of Figma design systems, dashboard kits, or mobile UI templates you plan to publish..."
                    className={`${inputClass} resize-none`}
                  />
                  {errors.motivation && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {errors.motivation.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Publisher Application
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PublisherPage;
