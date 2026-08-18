import React from "react";
import {
  ChevronLeft,
  Dribbble,
  Twitter,
  Linkedin,
  Github,
  Figma,
} from "lucide-react";
import { LayeratLogo } from "../brand/LayeratLogo";
import type { Page, Category } from "../../types";

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({
  onNavigate,
  categories,
  onCategoryClick,
}: {
  onNavigate: (p: Page) => void;
  categories: Category[];
  onCategoryClick?: (categoryId: string) => void;
}) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const footerData = (() => {
    try {
      const saved = localStorage.getItem("ld_custom_footer");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
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
  })();

  const socialLinks = [
    {
      label: "Figma Community",
      href: footerData.figmaUrl || "https://figma.com/@layerat",
      icon: Figma,
    },
    {
      label: "Dribbble",
      href: footerData.dribbbleUrl || "https://dribbble.com",
      icon: Dribbble,
    },
    {
      label: "Twitter / X",
      href: footerData.twitterUrl || "https://x.com",
      icon: Twitter,
    },
    {
      label: "LinkedIn",
      href: footerData.linkedinUrl || "https://linkedin.com",
      icon: Linkedin,
    },
    {
      label: "GitHub",
      href: footerData.githubUrl || "https://github.com",
      icon: Github,
    },
  ];

  return (
    <footer className="border-t border-border bg-card/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div
              className="mb-3 cursor-pointer inline-flex items-center hover:opacity-85 transition-opacity"
              onClick={() => {
                onNavigate("home");
                scrollToTop();
              }}
            >
              <LayeratLogo height={28} className="h-7 w-auto" />
            </div>
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
            <h4 className="text-sm font-display font-bold text-foreground mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      if (onCategoryClick) {
                        onCategoryClick(cat.id);
                      } else {
                        onNavigate("browse");
                      }
                      scrollToTop();
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-display font-bold text-foreground mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Browse All Resources", action: () => onNavigate("browse") },
                { label: "Free UI Kits", action: () => onNavigate("browse") },
                { label: "Design Systems", action: () => onNavigate("browse") },
                { label: "Wireframe Kits", action: () => onNavigate("browse") },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={() => {
                      action();
                      scrollToTop();
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left cursor-pointer"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-sm font-display font-bold text-foreground mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", page: "about" as Page },
                { label: "Our Team", page: "team" as Page },
                { label: "Become a Publisher", page: "publisher" as Page },
                { label: "Terms of Service", page: "terms" as Page },
                { label: "Privacy Policy", page: "privacy" as Page },
              ].map(({ label, page }) => (
                <li key={label}>
                  <button
                    onClick={() => {
                      onNavigate(page);
                      scrollToTop();
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left cursor-pointer"
                  >
                    {label}
                  </button>
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

export { Footer };