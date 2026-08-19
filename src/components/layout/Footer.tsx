"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Dribbble,
  Twitter,
  Linkedin,
  Github,
  Figma,
} from "lucide-react";
import { LayeratLogo } from "../brand/LayeratLogo";
import type { Category } from "@/types/api";

interface FooterProps {
  categories?: Category[];
  onCategoryClick?: (categoryId: string) => void;
  onNavigate?: (p: any) => void;
}

export function Footer({
  categories = [],
  onCategoryClick,
  onNavigate,
}: FooterProps) {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const footerData = {
    tagline:
      "Premium Figma resources built by designers, for designers. Elevate your creative workflow with 100% free kits.",
    badgeText: "100% Free Community Edition",
    figmaUrl: "https://figma.com/@layerat",
    dribbbleUrl: "https://dribbble.com",
    twitterUrl: "https://x.com",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com",
    contactEmail: "support@layerat.com",
    copyrightText: "Layerat Design Studio. All rights reserved.",
  };

  const socialLinks = [
    {
      label: "Figma Community",
      href: footerData.figmaUrl,
      icon: Figma,
    },
    {
      label: "Dribbble",
      href: footerData.dribbbleUrl,
      icon: Dribbble,
    },
    {
      label: "Twitter / X",
      href: footerData.twitterUrl,
      icon: Twitter,
    },
    {
      label: "LinkedIn",
      href: footerData.linkedinUrl,
      icon: Linkedin,
    },
    {
      label: "GitHub",
      href: footerData.githubUrl,
      icon: Github,
    },
  ];

  return (
    <footer className="border-t border-border bg-card/40 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-14 max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              onClick={scrollToTop}
              className="mb-3 inline-flex items-center hover:opacity-85 transition-opacity"
            >
              <LayeratLogo height={28} className="h-7 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {footerData.tagline}
            </p>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary font-bold">
                {footerData.badgeText}
              </span>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((cat) => {
                const catId = cat._id || cat.id || "";
                const catSlug = cat.slug || catId;
                return (
                  <li key={catId || cat.name}>
                    <Link
                      href={`/browse?category=${encodeURIComponent(catSlug)}`}
                      onClick={() => {
                        if (onCategoryClick && catId) onCategoryClick(catId);
                      }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors text-left block"
                    >
                      {cat.name}
                    </Link>
                  </li>
                );
              })}
              {categories.length === 0 && (
                <>
                  <li>
                    <Link
                      href="/browse?category=ui-kits"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                    >
                      UI Kits
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/browse?category=design-systems"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                    >
                      Design Systems
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/browse?category=wireframes"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                    >
                      Wireframe Kits
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/browse?category=icons"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                    >
                      Icons & Illustrations
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Browse All Resources", to: "/browse" },
                { label: "Free UI Kits", to: "/browse?category=ui-kits" },
                { label: "Design Systems", to: "/browse?category=design-systems" },
                { label: "Wireframe Kits", to: "/browse?category=wireframes" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    href={to}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", to: "/about" },
                { label: "Our Team", to: "/team" },
                { label: "Become a Publisher", to: "/publisher" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Privacy Policy", to: "/privacy" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    href={to}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left font-mono">
            © {new Date().getFullYear()} Layerat Design Studio. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground">
              Crafted with care for the global design community
            </p>
            <button
              onClick={scrollToTop}
              title="Back to top"
              aria-label="Scroll back to top"
              className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 group cursor-pointer"
            >
              <ChevronLeft
                size={15}
                className="rotate-90 text-muted-foreground group-hover:text-primary transition-colors"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;