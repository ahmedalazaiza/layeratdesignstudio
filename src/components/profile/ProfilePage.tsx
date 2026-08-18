import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  CheckCircle,
  Star,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { AuthUser, Product } from "../../types";

function ProfilePage({
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
    bio: authUser.bio ?? "",
    website: authUser.website ?? "",
  });
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [pwStatus, setPwStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [pwErrorMsg, setPwErrorMsg] = useState("");
  const [libraryProducts, setLibraryProducts] = useState<Product[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

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
            setLibraryProducts(products || []);
          }
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
            setWishlistProducts(products || []);
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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      await new Promise((r) => setTimeout(r, 900));
      onUpdate({
        name: profileForm.name,
        bio: profileForm.bio,
        website: profileForm.website,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
    }
  };

  const handleSendPasswordReset = async () => {
    setPwErrorMsg("");
    setPwStatus("sending");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authUser.email, {
        redirectTo: `${window.location.origin}/?type=recovery`,
      });

      if (error) throw error;

      setPwStatus("sent");
    } catch (err: any) {
      console.error("Reset password error:", err);
      setPwStatus("error");
      setPwErrorMsg(err?.message || "Failed to send reset email.");
    }
  };

  const inputClass =
    "w-full px-5 py-3.5 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";
  
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
    { id: "library", label: "Library", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-20 lg:pt-24"
    >
      <div className="max-w-5xl mx-auto px-4 lg:px-10 py-10 lg:py-14">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-border">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-2xl font-display font-black text-primary-foreground shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-extrabold text-foreground">
              {authUser.name}
            </h1>
            <p className="text-muted-foreground text-sm">{authUser.email}</p>
            {authUser.bio && (
              <p className="text-sm text-foreground mt-1">{authUser.bio}</p>
            )}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon size={15} />
              {label}
              {id === "library" && (
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-mono">
                  {libraryProducts.length}
                </span>
              )}
              {id === "wishlist" && wishlistProducts.length > 0 && (
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-mono">
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
              <form onSubmit={handleProfileSave} className="max-w-lg space-y-5">
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
                    type="email"
                    disabled
                    className={`${inputClass} opacity-50 cursor-not-allowed`}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Email changes require verification. Contact support.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, bio: e.target.value }))
                    }
                    rows={3}
                    placeholder="Tell the community about yourself..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                    Website
                  </label>
                  <input
                    value={profileForm.website}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, website: e.target.value }))
                    }
                    type="url"
                    placeholder="https://yoursite.com"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saveStatus === "saving"}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.2)] disabled:opacity-60 transition-all duration-300"
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
                  <p className="text-sm">Loading your library...</p>
                </div>
              ) : libraryProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Package size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-foreground mb-1">
                    Your library is empty
                  </p>
                  <p className="text-sm">
                    Download free resources or purchase premium kits to find
                    them here.
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
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {p.shortDescription}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                            Downloaded
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
                  <p className="text-sm">Loading your wishlist...</p>
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Heart size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-foreground mb-1">
                    Nothing saved yet
                  </p>
                  <p className="text-sm">
                    Tap the heart icon on any resource to save it here.
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
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.isFree ? "Free" : `$${p.discountPrice ?? p.price}`}
                        </p>
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={
                                i < Math.round(p.rating)
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
              <div className="max-w-lg space-y-8">
                {/* Change password */}
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground mb-2">
                    Change Password
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    We’ll send a secure link to your email. Click it to set a new password.
                  </p>

                  {pwStatus === "error" && (
                    <p className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-destructive/20 border border-red-200 dark:border-destructive/30 rounded-xl px-4 py-3 mb-4">
                      {pwErrorMsg}
                    </p>
                  )}

                  {pwStatus === "sent" ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground">
                      <p className="font-medium mb-1">Check your email</p>
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
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all duration-300"
                    >
                      {pwStatus === "sending" ? (
                        <>
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Sending...
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
                    Notifications
                  </h3>
                  {[
                    {
                      label: "New resources in saved categories",
                      sub: "Get notified when new items are added",
                    },
                    {
                      label: "Promotions & discounts",
                      sub: "Sales, limited offers, and bundles",
                    },
                    {
                      label: "Purchase confirmations",
                      sub: "Email receipt after every purchase",
                    },
                  ].map(({ label, sub }) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 py-4 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sub}
                        </p>
                      </div>
                      <button className="w-11 h-6 bg-primary rounded-full relative transition-colors shrink-0">
                        <span className="absolute right-1 top-1 w-4 h-4 bg-primary-foreground rounded-full" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Danger zone */}
                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-display font-bold text-destructive mb-2">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Deleting your account is permanent and cannot be undone.
                  </p>
                  <button className="px-5 py-2.5 rounded-xl border border-destructive/30 text-destructive-foreground bg-destructive/10 text-sm font-medium hover:bg-destructive/20 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export { ProfilePage };