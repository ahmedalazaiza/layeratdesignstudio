import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  Info,
  Share2,
  Bell,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Sparkles,
  Save,
  Globe,
  Camera,
  Upload,
  Palette,
  RefreshCw,
  Sun,
  Moon,
  Shield,
  Layers,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import {
  DEFAULT_BRAND_LOGOS,
  type BrandLogosConfig,
  LayeratLogo,
  LayeratIconSvg,
} from "../brand/LayeratLogo";

export const DEFAULT_HOME_CONTENT = {
  heroTag: "100% Free Community Launch · 500+ Assets",
  headlinePart1: "The Design",
  headlinePart2: "Resource",
  headlinePart3: "Studio.",
  subheading:
    "Curated Figma design systems, mobile kits, and production-ready UI components built to elevate your product workflow.",
  primaryCtaText: "Browse Free Kits",
  secondaryCtaText: "Join for Free",
  quickCategories: [
    "UI Kits",
    "Landing Pages",
    "Wireframes",
    "Icons",
    "Design Systems",
  ],
  heroPreviewImage:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=640&fit=crop&auto=format",
  statsResources: 500,
  statsDownloads: 50,
  statsDesigners: 12,
  statsSatisfaction: 99,
};

export const DEFAULT_FOOTER_CONTENT = {
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

export const DEFAULT_ANNOUNCEMENT_CONTENT = {
  enabled: false,
  message: "🚀 50+ New Figma Kits and iOS 18 Design Systems added this week!",
  linkText: "Explore Now",
  linkUrl: "browse",
};

export const DEFAULT_TEAM_MEMBERS = [
  {
    id: "tm1",
    name: "Ahmed Al-Azaiza",
    role: "Founder & Lead UX/UI Designer",
    bio: "Passionate UX/UI designer dedicated to crafting world-class Figma design systems and accessible UI kits for the global design community.",
    initials: "AA",
    color: "#aaff38",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    links: [
      { label: "Portfolio", url: "https://dribbble.com" },
      { label: "Figma", url: "https://figma.com" },
    ],
  },
  {
    id: "tm2",
    name: "Yazeed Al-Harbi",
    role: "Co-Founder & Creative Director",
    bio: "10 years of UX expertise spanning enterprise SaaS, design systems, and mobile apps. Leads curation and design bar.",
    initials: "YH",
    color: "#60a5fa",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    links: [
      { label: "Portfolio", url: "#" },
      { label: "Figma", url: "#" },
    ],
  },
  {
    id: "tm3",
    name: "Rima Saleh",
    role: "Head of Curation & Quality",
    bio: "Reviews community submissions and works with creators to maintain top-tier component quality and tokens.",
    initials: "RS",
    color: "#f59e0b",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    links: [
      { label: "Dribbble", url: "#" },
      { label: "LinkedIn", url: "#" },
    ],
  },
  {
    id: "tm4",
    name: "Khalid Nasser",
    role: "Design Systems Lead",
    bio: "Architects scalable component systems with deep expertise in Figma Variables and Auto Layout 5.0 tokens.",
    initials: "KN",
    color: "#c084fc",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    links: [{ label: "Figma Community", url: "#" }],
  },
];

export const DEFAULT_ABOUT_CONTENT = {
  heroTag: "Crafted for Designers, by Designers",
  heroHeading: "Empowering every creator with world-class design systems.",
  storyTitle: "Our Story & Vision",
  storyParagraph1:
    "Layerat was born from a simple belief: high-grade design systems, tokens, and UI kits should be accessible to all designers, startups, and product builders without prohibitive paywalls.",
  storyParagraph2:
    "Every resource in our studio is meticulously architected using Figma Variables, full Auto Layout 5.0 responsiveness, and atomic tokens for fast production workflows.",
  missionHeading: "Built for speed, consistency, and scale.",
  stats: [
    { label: "Curated Resources", value: "500+" },
    { label: "Active Designers", value: "12,000+" },
    { label: "Free Downloads", value: "85,000+" },
    { label: "Community Rating", value: "4.9/5" },
  ],
  faqs: [
    {
      q: "Are all resources really 100% free for commercial use?",
      a: "Yes! Every single file in Layerat Design Studio is 100% free to download and use in personal, client, and commercial projects with no attribution required.",
    },
    {
      q: "What design software is supported?",
      a: "Our primary focus is Figma. All kits take full advantage of native Figma features including Variables, Component Properties, and Auto Layout 5.0.",
    },
    {
      q: "Can I contribute my own UI kits?",
      a: "Absolutely! You can apply through our Publisher page to join our curated network of creator partners.",
    },
  ],
};

type CMSSection = "brand" | "home" | "footer" | "team" | "about" | "announcement";

export function SiteContentAdminPanel() {
  const [activeSection, setActiveSection] = useState<CMSSection>("brand");

  // Brand Logos state
  const [brandLogos, setBrandLogos] = useState<BrandLogosConfig>(() => {
    try {
      const saved = localStorage.getItem("ld_brand_logos");
      if (saved) return { ...DEFAULT_BRAND_LOGOS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_BRAND_LOGOS;
  });

  // Home state
  const [homeData, setHomeData] = useState<typeof DEFAULT_HOME_CONTENT>(() => {
    const saved = localStorage.getItem("ld_custom_home");
    return saved ? JSON.parse(saved) : DEFAULT_HOME_CONTENT;
  });

  // Footer state
  const [footerData, setFooterData] = useState<typeof DEFAULT_FOOTER_CONTENT>(
    () => {
      const saved = localStorage.getItem("ld_custom_footer");
      return saved ? JSON.parse(saved) : DEFAULT_FOOTER_CONTENT;
    }
  );

  // Announcement state
  const [announcementData, setAnnouncementData] = useState<
    typeof DEFAULT_ANNOUNCEMENT_CONTENT
  >(() => {
    const saved = localStorage.getItem("ld_custom_announcement");
    return saved ? JSON.parse(saved) : DEFAULT_ANNOUNCEMENT_CONTENT;
  });

  // Team state
  const [teamMembers, setTeamMembers] = useState<any[]>(() => {
    const saved = localStorage.getItem("ld_custom_team");
    return saved ? JSON.parse(saved) : DEFAULT_TEAM_MEMBERS;
  });
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [newMemberModal, setNewMemberModal] = useState(false);

  // About page state
  const [aboutData, setAboutData] = useState<typeof DEFAULT_ABOUT_CONTENT>(
    () => {
      const saved = localStorage.getItem("ld_custom_about");
      return saved ? JSON.parse(saved) : DEFAULT_ABOUT_CONTENT;
    }
  );

  // Sync CMS with Supabase database on load
  useEffect(() => {
    const loadCmsFromSupabase = async () => {
      try {
        const { data } = await supabase.from("site_content").select("*");
        if (data && data.length > 0) {
          data.forEach((row: any) => {
            if (row.id === "brand_logos" && row.data) {
              setBrandLogos(row.data);
              localStorage.setItem("ld_brand_logos", JSON.stringify(row.data));
              window.dispatchEvent(new Event("layerat_brand_updated"));
            }
            if (row.id === "home" && row.data) {
              setHomeData(row.data);
              localStorage.setItem("ld_custom_home", JSON.stringify(row.data));
            }
            if (row.id === "footer" && row.data) {
              setFooterData(row.data);
              localStorage.setItem("ld_custom_footer", JSON.stringify(row.data));
            }
            if (row.id === "team" && row.data) {
              setTeamMembers(row.data);
              localStorage.setItem("ld_custom_team", JSON.stringify(row.data));
            }
            if (row.id === "about" && row.data) {
              setAboutData(row.data);
              localStorage.setItem("ld_custom_about", JSON.stringify(row.data));
            }
            if (row.id === "announcement" && row.data) {
              setAnnouncementData(row.data);
              localStorage.setItem(
                "ld_custom_announcement",
                JSON.stringify(row.data)
              );
            }
          });
        }
      } catch (err) {
        console.log("Using cached CMS content:", err);
      }
    };

    loadCmsFromSupabase();
  }, []);

  // Save Brand Logos
  const handleSaveBrandLogos = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ld_brand_logos", JSON.stringify(brandLogos));
    window.dispatchEvent(new Event("layerat_brand_updated"));
    try {
      await supabase.from("site_content").upsert({
        id: "brand_logos",
        data: brandLogos,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error persisting brand logos CMS:", err);
    }
    toast.success("Brand & Logo assets saved live across the entire studio!");
  };

  // Reset Brand Logos
  const handleResetBrandLogos = async () => {
    const confirm = window.confirm("Reset all logos to official default vector SVGs?");
    if (!confirm) return;

    setBrandLogos(DEFAULT_BRAND_LOGOS);
    localStorage.setItem("ld_brand_logos", JSON.stringify(DEFAULT_BRAND_LOGOS));
    window.dispatchEvent(new Event("layerat_brand_updated"));
    try {
      await supabase.from("site_content").upsert({
        id: "brand_logos",
        data: DEFAULT_BRAND_LOGOS,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error resetting brand logos CMS:", err);
    }
    toast.success("Logos reset to default vector SVGs!");
  };

  // Upload Logo File Helper
  const handleLogoFileUpload = (
    field: keyof BrandLogosConfig,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBrandLogos((prev) => ({
          ...prev,
          [field]: reader.result,
        }));
        toast.success(`Logo loaded! Click Save to apply changes.`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Home
  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ld_custom_home", JSON.stringify(homeData));
    try {
      await supabase.from("site_content").upsert({
        id: "home",
        data: homeData,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error persisting home CMS:", err);
    }
    toast.success("Home & Hero page content saved live!");
  };

  // Save Footer
  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ld_custom_footer", JSON.stringify(footerData));
    try {
      await supabase.from("site_content").upsert({
        id: "footer",
        data: footerData,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error persisting footer CMS:", err);
    }
    toast.success("Footer & Social Media settings saved live!");
  };

  // Save Announcement
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      "ld_custom_announcement",
      JSON.stringify(announcementData)
    );
    try {
      await supabase.from("site_content").upsert({
        id: "announcement",
        data: announcementData,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error persisting announcement CMS:", err);
    }
    toast.success("Announcement banner updated live!");
  };

  // Save Team
  const handleSaveTeam = async (members: any[]) => {
    setTeamMembers(members);
    localStorage.setItem("ld_custom_team", JSON.stringify(members));
    try {
      await supabase.from("site_content").upsert({
        id: "team",
        data: members,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error persisting team CMS:", err);
    }
    toast.success("Team members updated successfully!");
  };

  const handleTeamAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setEditingMember((m: any) => ({ ...m, avatarUrl: base64 }));
      toast.success("Team photo loaded!");
    };
    reader.readAsDataURL(file);
  };

  // Add / Edit Member
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember.name.trim()) return;

    if (editingMember.id) {
      const updated = teamMembers.map((m) =>
        m.id === editingMember.id ? editingMember : m
      );
      handleSaveTeam(updated);
    } else {
      const created = [
        ...teamMembers,
        {
          ...editingMember,
          id: `tm_${Date.now()}`,
          initials: editingMember.name
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
        },
      ];
      handleSaveTeam(created);
    }

    setEditingMember(null);
    setNewMemberModal(false);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm("Remove this team member?")) {
      const filtered = teamMembers.filter((m) => m.id !== id);
      handleSaveTeam(filtered);
    }
  };

  // Save About
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ld_custom_about", JSON.stringify(aboutData));
    try {
      await supabase.from("site_content").upsert({
        id: "about",
        data: aboutData,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error persisting about CMS:", err);
    }
    toast.success("About Us page content saved!");
  };

  const handleAddFaq = () => {
    setAboutData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { q: "New Question?", a: "Answer here..." }],
    }));
  };

  const handleRemoveFaq = (idx: number) => {
    setAboutData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== idx),
    }));
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

  const cmsTabs = [
    { id: "brand" as CMSSection, label: "Brand & Logos", icon: Palette },
    { id: "home" as CMSSection, label: "Home & Hero", icon: Home },
    { id: "footer" as CMSSection, label: "Footer & Social", icon: Share2 },
    { id: "team" as CMSSection, label: "Our Team", icon: Users },
    { id: "about" as CMSSection, label: "About & FAQs", icon: Info },
    { id: "announcement" as CMSSection, label: "Top Banner", icon: Bell },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-2">
            <Sparkles size={12} /> Live Content Studio
          </div>
          <h2 className="text-2xl font-display font-extrabold text-foreground">
            Site Content & Visual CMS
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Customize brand logos, headlines, team profiles, and footer links across the entire marketplace
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-secondary/50 border border-border">
          {cmsTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === id
                  ? "bg-card text-primary shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION: BRAND & LOGO ASSETS CMS ───────────────────────────── */}
      {activeSection === "brand" && (
        <form onSubmit={handleSaveBrandLogos} className="space-y-6">
          {/* Header Summary & Reset */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
                <Palette size={18} className="text-primary" /> Brand Identity & Logo Assets
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Manage full SVG logos, favicon icons, and brand typography across Dark and Light themes
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetBrandLogos}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border hover:border-destructive/40 bg-background text-xs font-mono font-bold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <RefreshCw size={13} /> Reset to Default SVGs
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:shadow-[0_0_20px_rgba(170,255,56,0.3)] transition-all cursor-pointer"
              >
                <Save size={14} /> Save Brand Assets
              </button>
            </div>
          </div>

          {/* Live Previews: Dark & Light Mode Simulators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dark Mode Simulator */}
            <div className="rounded-3xl border border-border bg-[#0d120f] p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
                <span className="flex items-center gap-2 text-white font-bold">
                  <Moon size={14} className="text-primary" /> Dark Mode Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                  Live Simulator
                </span>
              </div>

              {/* Full Logo Preview */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center gap-2 min-h-[90px]">
                <span className="text-[10px] font-mono text-white/50 mb-1">Full Logo (Dark Theme)</span>
                <LayeratLogo isDark={true} height={34} />
              </div>

              {/* Icon Mark Preview */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Icon Mark</span>
                  <span className="text-[10px] text-white/50 font-mono">Mobile / Favicon / Loading</span>
                </div>
                <LayeratLogo isDark={true} iconOnly={true} height={32} />
              </div>
            </div>

            {/* Light Mode Simulator */}
            <div className="rounded-3xl border border-border bg-[#f8fafc] text-slate-900 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-mono">
                <span className="flex items-center gap-2 text-slate-900 font-bold">
                  <Sun size={14} className="text-amber-500" /> Light Mode Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                  Live Simulator
                </span>
              </div>

              {/* Full Logo Preview */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-2 min-h-[90px] shadow-sm">
                <span className="text-[10px] font-mono text-slate-400 mb-1">Full Logo (Light Theme)</span>
                <LayeratLogo isDark={false} height={34} />
              </div>

              {/* Icon Mark Preview */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Icon Mark</span>
                  <span className="text-[10px] text-slate-400 font-mono">Mobile / Favicon / Light Theme</span>
                </div>
                <LayeratLogo isDark={false} iconOnly={true} height={32} />
              </div>
            </div>
          </div>

          {/* Logo File Uploaders & Custom URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dark Mode Full Logo */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h4 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                  <Moon size={15} className="text-primary" /> Full Logo (Dark Backgrounds)
                </h4>
                <span className="text-[10px] font-mono text-muted-foreground">SVG / PNG</span>
              </div>

              <div className="space-y-3">
                <label className="block p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-background/50 text-center cursor-pointer transition-colors">
                  <Upload size={20} className="mx-auto text-primary mb-1.5" />
                  <span className="text-xs font-bold text-foreground block">Upload Custom Dark Logo</span>
                  <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                    Click to select .svg or .png file
                  </span>
                  <input
                    type="file"
                    accept=".svg,.png,.webp,.jpg"
                    className="hidden"
                    onChange={(e) => handleLogoFileUpload("logoDarkUrl", e)}
                  />
                </label>

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                    Or Paste Custom Image/SVG URL:
                  </label>
                  <input
                    type="text"
                    value={brandLogos.logoDarkUrl || ""}
                    onChange={(e) =>
                      setBrandLogos((prev) => ({ ...prev, logoDarkUrl: e.target.value }))
                    }
                    placeholder="https://... or /brand/logo-dark-mode.png"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Light Mode Full Logo */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h4 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                  <Sun size={15} className="text-amber-400" /> Full Logo (Light Backgrounds)
                </h4>
                <span className="text-[10px] font-mono text-muted-foreground">SVG / PNG</span>
              </div>

              <div className="space-y-3">
                <label className="block p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-background/50 text-center cursor-pointer transition-colors">
                  <Upload size={20} className="mx-auto text-amber-400 mb-1.5" />
                  <span className="text-xs font-bold text-foreground block">Upload Custom Light Logo</span>
                  <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                    Click to select .svg or .png file
                  </span>
                  <input
                    type="file"
                    accept=".svg,.png,.webp,.jpg"
                    className="hidden"
                    onChange={(e) => handleLogoFileUpload("logoLightUrl", e)}
                  />
                </label>

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                    Or Paste Custom Image/SVG URL:
                  </label>
                  <input
                    type="text"
                    value={brandLogos.logoLightUrl || ""}
                    onChange={(e) =>
                      setBrandLogos((prev) => ({ ...prev, logoLightUrl: e.target.value }))
                    }
                    placeholder="https://... or /brand/logo-light-mode.png"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Dark Mode Icon Mark */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h4 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                  <Layers size={15} className="text-primary" /> Icon Mark (Dark Theme)
                </h4>
                <span className="text-[10px] font-mono text-muted-foreground">3 Layers / Favicon</span>
              </div>

              <div className="space-y-3">
                <label className="block p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-background/50 text-center cursor-pointer transition-colors">
                  <Upload size={20} className="mx-auto text-primary mb-1.5" />
                  <span className="text-xs font-bold text-foreground block">Upload Custom Dark Icon</span>
                  <input
                    type="file"
                    accept=".svg,.png,.webp,.jpg"
                    className="hidden"
                    onChange={(e) => handleLogoFileUpload("iconDarkUrl", e)}
                  />
                </label>

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                    Or Paste Custom Icon URL:
                  </label>
                  <input
                    type="text"
                    value={brandLogos.iconDarkUrl || ""}
                    onChange={(e) =>
                      setBrandLogos((prev) => ({ ...prev, iconDarkUrl: e.target.value }))
                    }
                    placeholder="https://... or /brand/icon-dark-mode.png"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Light Mode Icon Mark */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h4 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                  <Layers size={15} className="text-emerald-500" /> Icon Mark (Light Theme)
                </h4>
                <span className="text-[10px] font-mono text-muted-foreground">3 Layers / Favicon</span>
              </div>

              <div className="space-y-3">
                <label className="block p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-background/50 text-center cursor-pointer transition-colors">
                  <Upload size={20} className="mx-auto text-emerald-500 mb-1.5" />
                  <span className="text-xs font-bold text-foreground block">Upload Custom Light Icon</span>
                  <input
                    type="file"
                    accept=".svg,.png,.webp,.jpg"
                    className="hidden"
                    onChange={(e) => handleLogoFileUpload("iconLightUrl", e)}
                  />
                </label>

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                    Or Paste Custom Icon URL:
                  </label>
                  <input
                    type="text"
                    value={brandLogos.iconLightUrl || ""}
                    onChange={(e) =>
                      setBrandLogos((prev) => ({ ...prev, iconLightUrl: e.target.value }))
                    }
                    placeholder="https://... or /brand/icon-light-mode.png"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_25px_rgba(170,255,56,0.3)] transition-all cursor-pointer"
            >
              <Save size={16} /> Save Brand & Logo Settings
            </button>
          </div>
        </form>
      )}

      {/* ── SECTION: HOME & HERO CMS ─────────────────────────────────────── */}
      {activeSection === "home" && (
        <form onSubmit={handleSaveHome} className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h3 className="font-display font-bold text-foreground text-lg flex items-center gap-2 pb-3 border-b border-border">
              <Home size={18} className="text-primary" /> Hero Header & CTA Content
            </h3>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-2 font-bold">
                  Top Launch Badge Text
                </label>
                <input
                  type="text"
                  value={homeData.heroTag}
                  onChange={(e) =>
                    setHomeData({ ...homeData, heroTag: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-2 font-bold">
                  Primary CTA Button Label
                </label>
                <input
                  type="text"
                  value={homeData.primaryCtaText}
                  onChange={(e) =>
                    setHomeData({ ...homeData, primaryCtaText: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  Headline Line 1
                </label>
                <input
                  type="text"
                  value={homeData.headlinePart1}
                  onChange={(e) =>
                    setHomeData({ ...homeData, headlinePart1: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  Headline Line 2
                </label>
                <input
                  type="text"
                  value={homeData.headlinePart2}
                  onChange={(e) =>
                    setHomeData({ ...homeData, headlinePart2: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  Headline Line 3
                </label>
                <input
                  type="text"
                  value={homeData.headlinePart3}
                  onChange={(e) =>
                    setHomeData({ ...homeData, headlinePart3: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2 font-bold">
                Hero Subheading Paragraph
              </label>
              <textarea
                rows={2}
                value={homeData.subheading}
                onChange={(e) =>
                  setHomeData({ ...homeData, subheading: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2 font-bold">
                Featured Hero Preview Image (URL)
              </label>
              <input
                type="url"
                value={homeData.heroPreviewImage}
                onChange={(e) =>
                  setHomeData({
                    ...homeData,
                    heroPreviewImage: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            {/* Homepage Statistics Counters */}
            <div className="pt-4 border-t border-border/60">
              <label className="text-xs font-mono text-primary block mb-3 font-bold uppercase tracking-wider">
                📊 Homepage Statistics Counters (Social Proof)
              </label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Free Resources Count
                  </label>
                  <input
                    type="number"
                    value={homeData.statsResources ?? 500}
                    onChange={(e) =>
                      setHomeData({
                        ...homeData,
                        statsResources: Number(e.target.value) || 0,
                      })
                    }
                    className={inputClass}
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Displays as: {homeData.statsResources ?? 500}+</span>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Downloads (in K)
                  </label>
                  <input
                    type="number"
                    value={homeData.statsDownloads ?? 50}
                    onChange={(e) =>
                      setHomeData({
                        ...homeData,
                        statsDownloads: Number(e.target.value) || 0,
                      })
                    }
                    className={inputClass}
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Displays as: {homeData.statsDownloads ?? 50}K+</span>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Active Designers (in K)
                  </label>
                  <input
                    type="number"
                    value={homeData.statsDesigners ?? 12}
                    onChange={(e) =>
                      setHomeData({
                        ...homeData,
                        statsDesigners: Number(e.target.value) || 0,
                      })
                    }
                    className={inputClass}
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Displays as: {homeData.statsDesigners ?? 12}K+</span>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Satisfaction Rate (%)
                  </label>
                  <input
                    type="number"
                    value={homeData.statsSatisfaction ?? 99}
                    onChange={(e) =>
                      setHomeData({
                        ...homeData,
                        statsSatisfaction: Number(e.target.value) || 0,
                      })
                    }
                    className={inputClass}
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Displays as: {homeData.statsSatisfaction ?? 99}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_25px_rgba(170,255,56,0.25)] transition-all cursor-pointer"
            >
              <Save size={16} /> Save Home Page Content
            </button>
          </div>
        </form>
      )}

      {/* ── SECTION: FOOTER & SOCIAL LINKS ───────────────────────────────── */}
      {activeSection === "footer" && (
        <form onSubmit={handleSaveFooter} className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h3 className="font-display font-bold text-foreground text-lg flex items-center gap-2 pb-3 border-b border-border">
              <Share2 size={18} className="text-primary" /> Footer Branding & Social Media Links
            </h3>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-2 font-bold">
                  Footer Description Tagline
                </label>
                <textarea
                  rows={2}
                  value={footerData.tagline}
                  onChange={(e) =>
                    setFooterData({ ...footerData, tagline: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-2 font-bold">
                  Community Badge Text
                </label>
                <input
                  type="text"
                  value={footerData.badgeText}
                  onChange={(e) =>
                    setFooterData({ ...footerData, badgeText: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-4">
                Social Profile URLs
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    Figma Community URL
                  </label>
                  <input
                    type="url"
                    value={footerData.figmaUrl}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        figmaUrl: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    Dribbble URL
                  </label>
                  <input
                    type="url"
                    value={footerData.dribbbleUrl}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        dribbbleUrl: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    Twitter / X URL
                  </label>
                  <input
                    type="url"
                    value={footerData.twitterUrl}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        twitterUrl: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={footerData.linkedinUrl}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        linkedinUrl: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={footerData.githubUrl}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        githubUrl: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    Support Contact Email
                  </label>
                  <input
                    type="email"
                    value={footerData.contactEmail}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        contactEmail: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_25px_rgba(170,255,56,0.25)] transition-all cursor-pointer"
            >
              <Save size={16} /> Save Footer & Social Settings
            </button>
          </div>
        </form>
      )}

      {/* ── SECTION: OUR TEAM CMS ────────────────────────────────────────── */}
      {activeSection === "team" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-foreground text-lg">
                Team Members Directory ({teamMembers.length})
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Changes reflect in real-time on the /team page
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMember({
                  name: "",
                  role: "",
                  bio: "",
                  color: "#aaff38",
                  avatarUrl: "",
                  links: [{ label: "Portfolio", url: "" }],
                });
                setNewMemberModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus size={14} /> Add Team Member
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-border"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-extrabold text-foreground shadow-sm"
                        style={{
                          backgroundColor: member.color || "#aaff38",
                          color: "#080c09",
                        }}
                      >
                        {member.initials || member.name[0]}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setNewMemberModal(true);
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-foreground text-base">
                    {member.name}
                  </h4>
                  <p className="text-xs text-primary font-mono font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {member.bio}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>{member.links?.length || 0} social links</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: member.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Modal for Add / Edit Team Member */}
          {newMemberModal && editingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-7 shadow-2xl">
                <h3 className="text-lg font-display font-bold text-foreground mb-4">
                  {editingMember.id ? "Edit Team Member" : "Add Team Member"}
                </h3>

                <form onSubmit={handleSaveMember} className="space-y-4">
                  {/* Photo / Avatar Uploader */}
                  <div>
                    <label className="text-xs font-mono text-muted-foreground block mb-2">
                      Profile Photo / Avatar (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      {editingMember.avatarUrl ? (
                        <img
                          src={editingMember.avatarUrl}
                          alt="Avatar preview"
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/40 shadow-sm"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-sm shadow-sm"
                          style={{
                            backgroundColor: editingMember.color || "#aaff38",
                            color: "#080c09",
                          }}
                        >
                          {editingMember.name
                            ? editingMember.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "TM"}
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border hover:border-primary/40 bg-background text-xs font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                          <Upload size={12} />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleTeamAvatarFile}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="url"
                          value={editingMember.avatarUrl || ""}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              avatarUrl: e.target.value,
                            })
                          }
                          placeholder="Or paste photo URL (https://...)"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary/60"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-muted-foreground block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.name}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          name: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="e.g. Ahmed Al-Azaiza"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-muted-foreground block mb-1">
                      Role / Position
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.role}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          role: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="e.g. Creative Director & UI Architect"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-muted-foreground block mb-1">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={editingMember.bio}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          bio: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Short professional biography..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-muted-foreground block mb-1">
                      Accent Color (Hex)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={editingMember.color || "#aaff38"}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            color: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={editingMember.color || "#aaff38"}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            color: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(null);
                        setNewMemberModal(false);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 cursor-pointer"
                    >
                      Save Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION: ABOUT US & FAQS CMS ─────────────────────────────────── */}
      {activeSection === "about" && (
        <form onSubmit={handleSaveAbout} className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-foreground text-lg pb-3 border-b border-border flex items-center gap-2">
              <Info size={18} className="text-primary" /> Story & Mission Statement
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  Hero Tagline
                </label>
                <input
                  type="text"
                  value={aboutData.heroTag}
                  onChange={(e) =>
                    setAboutData({ ...aboutData, heroTag: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  Hero Heading
                </label>
                <input
                  type="text"
                  value={aboutData.heroHeading}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      heroHeading: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">
                Story Paragraph 1
              </label>
              <textarea
                rows={3}
                value={aboutData.storyParagraph1}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    storyParagraph1: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">
                Story Paragraph 2
              </label>
              <textarea
                rows={3}
                value={aboutData.storyParagraph2}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    storyParagraph2: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Stats Milestones */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-foreground text-lg pb-3 border-b border-border">
              Platform Stats Milestones
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aboutData.stats.map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl border border-border/60 bg-background/50">
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    {stat.label}
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const updated = [...aboutData.stats];
                      updated[i].value = e.target.value;
                      setAboutData({ ...aboutData, stats: updated });
                    }}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Manager */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" /> Frequently Asked Questions ({aboutData.faqs.length})
              </h3>
              <button
                type="button"
                onClick={handleAddFaq}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:border-primary/40 text-xs font-bold text-primary transition-colors cursor-pointer"
              >
                <Plus size={13} /> Add FAQ
              </button>
            </div>

            <div className="space-y-4">
              {aboutData.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-border/70 bg-background/50 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={faq.q}
                      placeholder="Question..."
                      onChange={(e) => {
                        const updated = [...aboutData.faqs];
                        updated[i].q = e.target.value;
                        setAboutData({ ...aboutData, faqs: updated });
                      }}
                      className={`${inputClass} font-bold`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(i)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={faq.a}
                    placeholder="Answer..."
                    onChange={(e) => {
                      const updated = [...aboutData.faqs];
                      updated[i].a = e.target.value;
                      setAboutData({ ...aboutData, faqs: updated });
                    }}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_25px_rgba(170,255,56,0.25)] transition-all cursor-pointer"
            >
              <Save size={16} /> Save About Us & FAQs
            </button>
          </div>
        </form>
      )}

      {/* ── SECTION: TOP ANNOUNCEMENT BANNER ─────────────────────────────── */}
      {activeSection === "announcement" && (
        <form onSubmit={handleSaveAnnouncement} className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
                <Bell size={18} className="text-primary" /> Top Announcement Banner Bar
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementData.enabled}
                  onChange={(e) =>
                    setAnnouncementData({
                      ...announcementData,
                      enabled: e.target.checked,
                    })
                  }
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs font-bold text-foreground font-mono">
                  {announcementData.enabled ? "Banner Active" : "Banner Disabled"}
                </span>
              </label>
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2 font-bold">
                Announcement Message Text
              </label>
              <input
                type="text"
                value={announcementData.message}
                onChange={(e) =>
                  setAnnouncementData({
                    ...announcementData,
                    message: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="e.g. 🚀 50+ New Figma Kits added this week!"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  Button / Link Text
                </label>
                <input
                  type="text"
                  value={announcementData.linkText}
                  onChange={(e) =>
                    setAnnouncementData({
                      ...announcementData,
                      linkText: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="e.g. Explore Now"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  Link Target (e.g. browse or URL)
                </label>
                <input
                  type="text"
                  value={announcementData.linkUrl}
                  onChange={(e) =>
                    setAnnouncementData({
                      ...announcementData,
                      linkUrl: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_25px_rgba(170,255,56,0.25)] transition-all cursor-pointer"
            >
              <Save size={16} /> Save Announcement Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
