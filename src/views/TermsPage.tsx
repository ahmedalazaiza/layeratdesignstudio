import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Scale,
  Sparkles,
} from "lucide-react";
import { Footer } from "../components/layout/Footer";
import type { Page, Category } from "../types";

export function TermsPage({
  onNavigate,
  categories,
}: {
  onNavigate: (page: Page) => void;
  categories: Category[];
}) {
  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            By accessing or using Layerat Design Studio (the "Platform"), creating an account, or downloading any Figma design kits, UI components, or templates, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not access or use our services.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Layerat reserves the right to update or modify these Terms at any time. We will indicate the date of the latest update at the top of this document. Continued use of the Platform after such changes constitutes acceptance of the new terms.
          </p>
        </>
      ),
    },
    {
      id: "license",
      title: "2. 100% Free Resources & Commercial License",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            All Figma design files, UI kits, design systems, icons, and templates distributed on Layerat are provided free of charge under our permissive Studio Community License.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 my-5">
            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                <CheckCircle2 size={16} /> What You Can Do
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                <li>Use in unlimited personal and commercial client projects.</li>
                <li>Modify, customize, and combine assets to fit your application.</li>
                <li>Embed designs into web, mobile apps, SaaS, and marketing sites.</li>
                <li>No mandatory backlink or attribution required (though appreciated).</li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm mb-2">
                <AlertCircle size={16} /> What You Cannot Do
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                <li>Re-sell, redistribute, or sub-license our raw Figma files as your own stock.</li>
                <li>Claim original authorship of unmodified Layerat UI kits.</li>
                <li>Extract assets to build competing design resource marketplaces.</li>
                <li>Use assets in harmful, unlawful, or defamatory content.</li>
              </ul>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "accounts",
      title: "3. User Accounts & Security",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you register an account on Layerat, you agree to provide accurate and complete information. You are responsible for safeguarding your login credentials and for all activities that occur under your account.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Layerat uses modern, enterprise-grade authentication through Supabase. If you suspect unauthorized access to your account, you must notify us immediately or reset your password via the account settings.
          </p>
        </>
      ),
    },
    {
      id: "publishers",
      title: "4. Creator & Publisher Submissions",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Publishers who submit design resources to Layerat warrant that they own all necessary rights, licenses, and intellectual property to the submitted assets. By submitting assets, creators grant Layerat a non-exclusive, worldwide license to distribute the assets to community members.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Layerat reserves the right to review, reject, or remove any community submission that fails our design quality standards or infringes upon third-party intellectual property.
          </p>
        </>
      ),
    },
    {
      id: "disclaimer",
      title: "5. Disclaimer of Warranties & Liability",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            All resources, design kits, and services on Layerat are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            In no event shall Layerat Design Studio, its founders, or contributors be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our downloadable assets.
          </p>
        </>
      ),
    },
    {
      id: "contact",
      title: "6. Contact Information",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions regarding these Terms of Service or need special licensing permissions, please contact our legal and support team at{" "}
            <a
              href="mailto:support@layerat.com"
              className="text-primary font-mono font-medium hover:underline"
            >
              support@layerat.com
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
            <Scale size={13} />
            <span>Legal & Studio Policy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-foreground tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Last Updated: August 2026 • Applies to all users and community creators
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="flex-1 py-14">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          {/* Quick Summary Alert */}
          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex items-start gap-4">
            <Sparkles size={24} className="text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">
                Summary for Designers
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Everything on Layerat is 100% free for your personal and commercial client work. Build awesome products, ship faster, and enjoy world-class Figma systems. Just don't re-sell our raw files as your own!
              </p>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-10">
            {sections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:border-border/80 transition-colors"
              >
                <h2 className="text-xl font-display font-bold text-foreground mb-4">
                  {section.title}
                </h2>
                <div className="text-sm leading-relaxed">{section.content}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} categories={categories} />
    </div>
  );
}
