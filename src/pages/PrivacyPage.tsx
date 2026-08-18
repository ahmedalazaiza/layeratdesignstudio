import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  UserCheck,
  ArrowLeft,
  KeyRound,
  FileCheck,
} from "lucide-react";
import { Footer } from "../components/layout/Footer";
import type { Page, Category } from "../types";

export function PrivacyPage({
  onNavigate,
  categories,
}: {
  onNavigate: (page: Page) => void;
  categories: Category[];
}) {
  const sections = [
    {
      id: "overview",
      title: "1. Overview & Our Privacy Commitment",
      icon: ShieldCheck,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Layerat Design Studio ("Layerat", "we", "our", or "us") is dedicated to protecting the privacy and personal data of designers, creators, and visitors who use our platform.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We believe in complete transparency. We do not sell your personal information, run intrusive third-party ads, or track you across the web. We only collect the minimal data required to provide one-click Figma asset downloads and manage creator accounts.
          </p>
        </>
      ),
    },
    {
      id: "collection",
      title: "2. Information We Collect",
      icon: Database,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you interact with Layerat, we collect information in the following ways:
          </p>
          <ul className="text-sm text-muted-foreground space-y-3 list-disc list-inside mb-4">
            <li>
              <strong className="text-foreground">Account Information:</strong> When you register an account, we collect your name, email address, password hash, and optional profile details (avatar image, bio, portfolio link).
            </li>
            <li>
              <strong className="text-foreground">Activity & Download Telemetry:</strong> We record which free Figma resources you download or save to your wishlist so you can re-access them in your profile.
            </li>
            <li>
              <strong className="text-foreground">Creator Application Data:</strong> If you apply to become a publisher, we collect your design portfolio URL, experience summary, and preferred categories.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "security",
      title: "3. How We Store & Secure Your Data",
      icon: Lock,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            All user data and authentication sessions are securely handled by Supabase, utilizing industry-standard encryption (AES-256 at rest and TLS 1.3 in transit) and Row-Level Security (RLS) policies.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Passwords are never stored in plain text. They are hashed using robust cryptographic functions (bcrypt) so that even our internal team cannot see your raw password.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "4. Local Storage & Preferences",
      icon: KeyRound,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use browser Local Storage solely for essential user experience functions:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Saving your preferred visual theme (Light, Dark, or System Auto).</li>
            <li>Persisting your active authentication session between visits.</li>
            <li>Caching your saved bookmarks for instantaneous offline retrieval.</li>
          </ul>
        </>
      ),
    },
    {
      id: "rights",
      title: "5. Your Rights & Data Control",
      icon: UserCheck,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You retain full ownership and control over your personal data:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside mb-4">
            <li><strong className="text-foreground">Access & Edit:</strong> You can edit your name, avatar, bio, and website at any time from your Account Settings.</li>
            <li><strong className="text-foreground">Password Reset:</strong> You can request a secure password recovery link anytime.</li>
            <li><strong className="text-foreground">Account Deletion:</strong> You may request complete erasure of your account and associated records by emailing us.</li>
          </ul>
        </>
      ),
    },
    {
      id: "contact",
      title: "6. Contact Our Privacy Team",
      icon: FileCheck,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us at{" "}
            <a
              href="mailto:privacy@layerat.com"
              className="text-primary font-mono font-medium hover:underline"
            >
              privacy@layerat.com
            </a>
            .
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <section className="pt-28 pb-16 border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => onNavigate("home")}
            className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono mb-4">
            <Lock size={13} />
            <span>Data Protection & Privacy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-foreground tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Last Updated: August 2026 • We respect and protect designer privacy
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="flex-1 py-14">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:border-border/80 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="text-sm leading-relaxed pl-13">{section.content}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} categories={categories} />
    </div>
  );
}
