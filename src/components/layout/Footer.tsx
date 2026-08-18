import React from "react";
import { ChevronLeft } from "lucide-react";
import type { Page, Category } from "../../types";

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({
    onNavigate,
    categories,
  }: {
    onNavigate: (p: Page) => void;
    categories: Category[];
  }) {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  
    return (
      <footer className="border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div
                className="text-4xl text-foreground leading-none mb-2"
                style={{ fontFamily: "'Cookie', cursive" }}
              >
                Layerat<span style={{ color: "#aaff38" }}>.</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Premium Figma resources built by designers, for designers. Elevate
                your workflow.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-mono text-primary">
                  500+ resources available
                </span>
              </div>
            </div>
  
            {/* Categories */}
            <div>
              <h4 className="text-sm font-display font-bold text-foreground mb-4">
                Categories
              </h4>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => onNavigate("browse")}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
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
              <ul className="space-y-2">
                {[
                  { label: "Browse All", action: () => onNavigate("browse") },
                  { label: "Free Resources", action: () => onNavigate("browse") },
                  { label: "New Arrivals", action: () => onNavigate("browse") },
                  { label: "Top Rated", action: () => onNavigate("browse") },
                ].map(({ label, action }) => (
                  <li key={label}>
                    <button
                      onClick={action}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
  
            {/* Company */}
            <div>
              <h4 className="text-sm font-display font-bold text-foreground mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "About Us", page: "about" as Page },
                  { label: "Our Team", page: "team" as Page },
                  { label: "Become a Publisher", page: "publisher" as Page },
                ].map(({ label, page }) => (
                  <li key={label}>
                    <button
                      onClick={() => {
                        onNavigate(page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                    >
                      {label}
                    </button>
                  </li>
                ))}
                {["Terms of Service", "Privacy Policy"].map((item) => (
                  <li key={item}>
                    <button className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
  
          {/* Bottom row */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Layerat Design Studio. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-muted-foreground">
                Crafted with care for the design community
              </p>
              <button
                onClick={scrollToTop}
                className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 group"
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