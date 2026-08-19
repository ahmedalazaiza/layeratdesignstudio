import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  CheckCircle,
  Star,
  Download,
  Camera,
  Upload,
  Link2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import type { AuthUser, Product } from "../../types";

export function ProfilePage({
  authUser,
  onUpdate,
  onLogout,
  onProductClick,
}: {
  authUser: AuthUser;
  onUpdate: (updated: Partial<AuthUser>) => void;
  onLogout: () => void;
  onProductClick: (p: Product) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "account" | "library" | "wishlist" | "settings"
  >("account");
  const [profileForm, setProfileForm] = useState({
    name: authUser.name,
    email: authUser.email,
    avatar: authUser.avatar ?? "",
    bio: authUser.bio ?? "",
    website: authUser.website ?? "",
  });
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [pwStatus, setPwStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [pwErrorMsg, setPwErrorMsg] = useState("");
  const [libraryProducts, setLibraryProducts] = useState<Product[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Helper mapper for Supabase product records
  const mapSupabaseProduct = (p: any): Product => {
    const formatsArr = Array.isArray(p.formats) ? p.formats : ["Figma"];
    const tagsArr = Array.isArray(p.tags) ? p.tags : [];
    const gallery = p.product_images
      ? p.product_images
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((img: any) => img.image_url)
      : [p.thumbnail_url].filter(Boolean);

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      shortDescription: p.short_description || "",
      fullDescription: p.full_description || "",
      price: 0,
      isFree: true,
      currency: "USD",
      thumbnail:
        p.thumbnail_url ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
      galleryImages: gallery,
      figmaPreviewUrl: p.figma_preview_url || undefined,
      categoryId: p.category_id || "ui-kits",
      subcategoryId: p.subcategory_id || undefined,
      tags: tagsArr,
      fileSize: p.file_size || "45 MB",
      formats: formatsArr,
      screensCount: p.screens_count || 0,
      componentsCount: p.components_count || 0,
      version: p.version || "v1.0.0",
      supportsVariables: p.supports_variables ?? true,
      supportsAutoLayout: p.supports_auto_layout ?? true,
      supportsLightDark: p.supports_light_dark ?? true,
      licenseType: p.license_type || "commercial",
      downloadsCount: p.downloads_count || 0,
      viewsCount: p.views_count || 0,
      rating: 5.0,
      reviewsCount: 0,
      downloadFileUrl: p.download_file_url || "",
      downloads: p.downloads_count || 0,
      views: p.views_count || 0,
      featured: p.is_featured || false,
      trending: false,
      isNew: false,
      createdAt: p.created_at || new Date().toISOString(),
      updatedAt: p.updated_at || new Date().toISOString(),
      specifications: {
        fileSize: p.file_size || "45 MB",
        format: formatsArr,
        screens: p.screens_count || 0,
        components: p.components_count || 0,
        version: p.version || "v1.0.0",
        compatibility: ["Figma"],
        supportsVariables: p.supports_variables ?? true,
        supportsAutoLayout: p.supports_auto_layout ?? true,
        supportsLightDark: p.supports_light_dark ?? true,
      },
      license: {
        type: "commercial",
        allowCommercial: true,
        allowUnlimitedProjects: true,
        attributionRequired: false,
      },
    };
  };

  // Fetch downloaded products from Supabase
  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setLibraryLoading(true);
        const { data: downloads, error: downloadsError } = await supabase
          .from("downloads")
          .select("product_id")
          .eq("user_id", authUser.id);

        if (downloadsError) {
          console.error("Error fetching downloads:", downloadsError);
          setLibraryLoading(false);
          return;
        }

        if (downloads && downloads.length > 0) {
          const productIds = downloads.map((d) => d.product_id);
          const { data: products, error: productsError } = await supabase
            .from("products")
            .select("*")
            .in("id", productIds);

          if (productsError) {
            console.error("Error fetching products:", productsError);
          } else {
            setLibraryProducts((products || []).map(mapSupabaseProduct));
          }
        } else {
          setLibraryProducts([]);
        }
        setLibraryLoading(false);
      } catch (err) {
        console.error("Error fetching library:", err);
        setLibraryLoading(false);
      }
    };

    fetchDownloads();
  }, [authUser.id]);

  // Fetch wishlist products from Supabase
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setWishlistLoading(true);
        const { data: wishlist, error: wishlistError } = await supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", authUser.id);

        if (wishlistError) {
          console.error("Error fetching wishlist:", wishlistError);
          setWishlistLoading(false);
          return;
        }

        if (wishlist && wishlist.length > 0) {
          const productIds = wishlist.map((w) => w.product_id);
          const { data: products, error: productsError } = await supabase
            .from("products")
            .select("*")
            .in("id", productIds);

          if (productsError) {
            console.error("Error fetching products:", productsError);
          } else {
            setWishlistProducts((products || []).map(mapSupabaseProduct));
          }
        } else {
          setWishlistProducts([]);
        }
        setWishlistLoading(false);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, [authUser.id]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProfileForm((f) => ({ ...f, avatar: base64 }));
      toast.success("Avatar loaded! Click 'Save Changes' to update your profile.");
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.name,
          avatar_url: profileForm.avatar,
          bio: profileForm.bio,
          website: profileForm.website,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authUser.id);

      if (error) throw error;

      onUpdate({
        name: profileForm.name,
        avatar: profileForm.avatar,
        bio: profileForm.bio,
        website: profileForm.website,
      });
      setSaveStatus("saved");
      toast.success("Profile saved successfully!");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err: any) {
      console.error(err);
      setSaveStatus("error");
      toast.error(err.message || "Failed to update profile.");
    }
  };

  const handleSendPasswordReset = async () => {
    setPwErrorMsg("");
    setPwStatus("sending");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        authUser.email,
        {
          redirectTo: `${window.location.origin}/?type=recovery`,
        }
      );

      if (error) throw error;

      setPwStatus("sent");
      toast.success("Password reset link sent to your email.");
    } catch (err: any) {
      console.error("Reset password error:", err);
      setPwStatus("error");
      setPwErrorMsg(err?.message || "Failed to send reset email.");
      toast.error(err?.message || "Failed to send reset email.");
    }
  };

  const inputClass =
    "w-full px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  const initials = authUser.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const tabs: {
    id: typeof activeTab;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "account", label: "Account", icon: User },
    { id: "library", label: "My Downloads", icon: Download },
    { id: "wishlist", label: "Saved Resources", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-20 lg:pt-24 pb-20"
    >
      <div className="max-w-5xl mx-auto px-4 lg:px-10 py-10 lg:py-14">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-border">
          {authUser.avatar ? (
            <img
              src={authUser.avatar}
              alt={authUser.name}
              className="w-20 h-20 rounded-3xl object-cover border-2 border-primary/40 shadow-lg shadow-primary/20 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-2xl font-display font-black text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-display font-extrabold text-foreground">
              {authUser.name}
            </h1>
            <p className="text-muted-foreground text-sm font-mono">{authUser.email}</p>
            {authUser.role === "admin" && (
              <span className="inline-block mt-2 text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                Studio Admin
              </span>
            )}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === id
                  ? "bg-primary/10 text-primary border border-primary/25 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
              }`}
            >
              <Icon size={15} />
              {label}
              {id === "library" && (
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono">
                  {libraryProducts.length}
                </span>
              )}
              {id === "wishlist" && wishlistProducts.length > 0 && (
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono">
                  {wishlistProducts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {/* Account tab */}
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={handleProfileSave} className="max-w-lg space-y-6 bg-card p-7 rounded-3xl border border-border">
                {/* Avatar Uploader */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      {profileForm.avatar ? (
                        <img
                          src={profileForm.avatar}
                          alt="Avatar preview"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/40 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center font-display font-black text-primary text-xl">
                          {initials}
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                        <Camera size={18} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFile}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-primary/40 bg-background text-xs font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                        <Upload size={13} />
                        <span>Upload Local Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFile}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="url"
                        value={profileForm.avatar}
                        onChange={(e) =>
                          setProfileForm((f) => ({ ...f, avatar: e.target.value }))
                        }
                        placeholder="Or paste image URL (https://...)"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary/60"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                    Full Name
                  </label>
                  <input
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                    Email
                  </label>
                  <input
                    value={profileForm.email}
                    disabled
                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                    Bio / Headline
                  </label>
                  <textarea
                    rows={2}
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, bio: e.target.value }))
                    }
                    placeholder="e.g. Lead Product Designer at Fintech Co."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                    Portfolio / Website
                  </label>
                  <input
                    type="url"
                    value={profileForm.website}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, website: e.target.value }))
                    }
                    placeholder="https://dribbble.com/yourhandle"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saveStatus === "saving"}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.2)] disabled:opacity-60 transition-all duration-300 cursor-pointer"
                >
                  {saveStatus === "saving" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{" "}
                      Saving...
                    </>
                  ) : saveStatus === "saved" ? (
                    <>
                      <CheckCircle size={15} /> Saved!
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* Library tab */}
          {activeTab === "library" && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {libraryLoading ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-mono">Loading your library...</p>
                </div>
              ) : libraryProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground bg-card rounded-3xl border border-border p-8">
                  <Package size={40} className="mx-auto mb-4 opacity-30 text-primary" />
                  <p className="font-semibold text-foreground mb-1 text-lg">
                    Your downloaded library is empty
                  </p>
                  <p className="text-sm max-w-sm mx-auto text-muted-foreground">
                    Explore our 100% free Figma kits, templates, and design systems to find and download them here.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {libraryProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onProductClick(p)}
                      className="group cursor-pointer flex gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-200"
                    >
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        loading="lazy"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {p.shortDescription}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                            Downloaded Free
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Wishlist tab */}
          {activeTab === "wishlist" && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {wishlistLoading ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-mono">Loading your saved items...</p>
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground bg-card rounded-3xl border border-border p-8">
                  <Heart size={40} className="mx-auto mb-4 opacity-30 text-primary" />
                  <p className="font-semibold text-foreground mb-1 text-lg">
                    Nothing saved yet
                  </p>
                  <p className="text-sm max-w-sm mx-auto text-muted-foreground">
                    Tap the heart icon on any design resource to save it for quick access.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onProductClick(p)}
                      className="group cursor-pointer flex gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-200"
                    >
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        loading="lazy"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-primary font-mono font-bold mt-0.5">
                          100% Free
                        </p>
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={
                                i < Math.round(p.rating || 0)
                                  ? "text-primary fill-primary"
                                  : "text-border"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Settings tab */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="max-w-lg space-y-8 bg-card p-7 rounded-3xl border border-border">
                {/* Change password */}
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground mb-2">
                    Security & Password
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    We’ll send a secure link to your email. Click it to set a new password.
                  </p>

                  {pwStatus === "error" && (
                    <p className="text-sm text-destructive-foreground bg-destructive/15 border border-destructive/20 rounded-xl px-4 py-3 mb-4">
                      {pwErrorMsg}
                    </p>
                  )}

                  {pwStatus === "sent" ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground">
                      <p className="font-medium mb-1 text-primary">Check your email</p>
                      <p className="text-muted-foreground">
                        We sent a password reset link to{" "}
                        <span className="font-medium text-foreground">{authUser.email}</span>.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendPasswordReset}
                      disabled={pwStatus === "sending"}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all duration-300 cursor-pointer"
                    >
                      {pwStatus === "sending" ? (
                        <>
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Sending link...
                        </>
                      ) : (
                        "Send reset link"
                      )}
                    </button>
                  )}
                </div>

                {/* Notifications */}
                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-display font-bold text-foreground mb-4">
                    Community Updates
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          New Free Resources
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Receive weekly emails about top new Figma kits and UI tools
                        </p>
                      </div>
                      <button className="w-11 h-6 bg-primary rounded-full relative transition-colors shrink-0">
                        <span className="absolute right-1 top-1 w-4 h-4 bg-primary-foreground rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}