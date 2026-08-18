import React, { useEffect, useState, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { supabase } from "../lib/supabase";
import { Navbar } from "../components/layout/Navbar";
import { HomePage } from "../pages/HomePage";
import { BrowsePage } from "../pages/BrowsePage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { ProfilePage } from "../components/profile/ProfilePage";
import { PublisherPage } from "../pages/PublisherPage";
import { TeamPage } from "../pages/TeamPage";
import { AboutPage } from "../pages/AboutPage";
import { TermsPage } from "../pages/TermsPage";
import { PrivacyPage } from "../pages/PrivacyPage";
import { AdminDashboardLayout } from "../components/admin/AdminDashboardLayout";
import { AuthModal } from "../components/auth/AuthModal";
import { SetNewPasswordModal } from "../components/auth/SetNewPasswordModal";
import { GiftPopup } from "../components/auth/GiftPopup";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import {
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  iconMap,
} from "../data/fallbackData";
import type { Page, AuthUser, Product, Category } from "../types";
import {
  parseCurrentRoute,
  pushRoute,
  getRouteTitle,
  buildRouteUrl,
} from "../lib/router";
import { Layers } from "lucide-react";

export type ThemeMode = "light" | "dark" | "system";

export function App() {
  // Theme State: "light" | "dark" | "system"
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = localStorage.getItem("layerat_theme_mode");
        if (saved === "light" || saved === "dark" || saved === "system") {
          return saved as ThemeMode;
        }
        const legacy = localStorage.getItem("layerat_theme");
        if (legacy === "dark") return "dark";
        if (legacy === "light") return "light";
      }
    } catch {}
    return "system";
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
    } catch {}
    return false;
  });

  // Listen to OS system theme changes
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.matchMedia) return;
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } catch {}
  }, []);

  // Compute resolved dark mode boolean
  const isDark = useMemo(() => {
    if (themeMode === "dark") return true;
    if (themeMode === "light") return false;
    return systemIsDark;
  }, [themeMode, systemIsDark]);

  // Apply dark class to document root & persist
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage?.setItem?.("layerat_theme_mode", themeMode);
    } catch {}
  }, [isDark, themeMode]);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const toggleTheme = () =>
    handleThemeChange(isDark ? "light" : "dark");

  // Initial Full Screen Loading State
  const [initialLoading, setInitialLoading] = useState(true);

  // Data State (Declared first so all effects can access safely)
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loadingData, setLoadingData] = useState(true);

  // Initial Route parsed from URL
  const initialRoute = useMemo(() => parseCurrentRoute(), []);

  // Navigation & Filter State
  const [page, setPage] = useState<Page>(initialRoute.page);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(initialRoute.categoryId || null);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>((initialRoute as any).subcategoryId || null);
  const [searchQuery, setSearchQuery] = useState<string>(initialRoute.searchQuery || "");

  // Listen to browser Back / Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const currentRoute = parseCurrentRoute();
      setPage(currentRoute.page);
      if (currentRoute.page === "product" && currentRoute.productId) {
        const found = products.find(
          (p) => p.id === currentRoute.productId || p.slug === currentRoute.productId
        );
        if (found) setSelectedProduct(found);
      } else if (currentRoute.page !== "product") {
        setSelectedProduct(null);
      }
      setActiveCategoryId(currentRoute.categoryId || null);
      setActiveSubcategoryId((currentRoute as any).subcategoryId || null);
      setSearchQuery(currentRoute.searchQuery || "");

      // Update document title
      document.title = getRouteTitle(
        currentRoute,
        currentRoute.page === "product"
          ? products.find((p) => p.id === currentRoute.productId || p.slug === currentRoute.productId)
          : null
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [products]);

  // Deep-link initial product matching once products are ready
  useEffect(() => {
    if (
      initialRoute.page === "product" &&
      initialRoute.productId &&
      products.length > 0 &&
      !selectedProduct
    ) {
      const found = products.find(
        (p) => p.id === initialRoute.productId || p.slug === initialRoute.productId
      );
      if (found) {
        setSelectedProduct(found);
        document.title = getRouteTitle(initialRoute, found);
      }
    }
  }, [initialRoute, products, selectedProduct]);

  // Set initial document title
  useEffect(() => {
    document.title = getRouteTitle(initialRoute, selectedProduct);
  }, [initialRoute, selectedProduct]);

  // Auth State
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "login" | "register" | "forgot_password";
  }>({ isOpen: false, mode: "login" });
  const [showSetNewPasswordModal, setShowSetNewPasswordModal] = useState(false);

  // Wishlist & User Activity State
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [scrollReadyForGift, setScrollReadyForGift] = useState(false);

  // Fetch Categories from Supabase
  const loadCategories = useCallback(async () => {
    try {
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      const { data: subData, error: subError } = await supabase
        .from("subcategories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!catError && catData && catData.length > 0) {
        const mapped: Category[] = catData.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: iconMap[c.icon] || Layers,
          color: c.color || "#aaff38",
          subcategories: !subError && subData
            ? subData
                .filter((s: any) => s.category_id === c.id)
                .map((s: any) => ({
                  id: s.id,
                  name: s.name,
                  slug: s.slug,
                }))
            : [],
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }, []);

  // Fetch Products from Supabase
  const loadProducts = useCallback(async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images ( image_url, sort_order )
        `)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: Product[] = data.map((p: any) => {
          const gallery = p.product_images
            ? p.product_images
                .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((img: any) => img.image_url)
            : [];

          const previewImgs = gallery.length > 0
            ? gallery
            : [p.thumbnail_url].filter(Boolean);

          const formatsArr = Array.isArray(p.formats) ? p.formats : ["Figma"];
          const tagsArr = Array.isArray(p.tags) ? p.tags : [];

          return {
            id: p.id,
            slug: p.slug,
            title: p.title,
            shortDescription: p.short_description || "",
            fullDescription: p.full_description || "",
            price: 0,
            isFree: true,
            currency: "USD",
            thumbnail:
              p.thumbnail_url ||
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=560&fit=crop&auto=format",
            galleryImages: previewImgs,
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
            downloadFileUrl: p.download_file_url || undefined,
            downloads: p.downloads_count || 0,
            views: p.views_count || 0,
            featured: p.is_featured ?? true,
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
        });
        setProducts(mapped);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  // Wishlist loader
  const loadWishlist = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", userId);

      if (!error && data) {
        const ids = data.map((w: any) => w.product_id);
        setWishlistProductIds(ids);
        setAuthUser((prev) => (prev ? { ...prev, wishlist: ids } : null));
      }
    } catch (err) {
      console.error("Error loading wishlist:", err);
    }
  }, []);

  // Supabase Auth Listener & Session Restoration
  useEffect(() => {
    // Check active session on load
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name, avatar_url, bio, website")
          .eq("id", session.user.id)
          .maybeSingle();

        const userEmail = (session.user.email || "").toLowerCase().trim();
        const isAdmin =
          userEmail === "ahmedazy.uxui@gmail.com" || profile?.role === "admin";
        const isVerified = Boolean(
          session.user.email_confirmed_at ||
          session.user.confirmed_at ||
          isAdmin
        );

        if (!profile) {
          const defaultName =
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User";
          await supabase
            .from("profiles")
            .upsert(
              {
                id: session.user.id,
                email: session.user.email,
                full_name: defaultName,
                avatar_url:
                  session.user.user_metadata?.avatar_url ||
                  session.user.user_metadata?.picture ||
                  null,
                role: isAdmin ? "admin" : "user",
                provider: session.user.app_metadata?.provider || "email",
              },
              { onConflict: "id" }
            )
            .catch(() => {});
        }

        setAuthUser({
          id: session.user.id,
          name:
            profile?.full_name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
          email: session.user.email || "",
          avatar:
            profile?.avatar_url ||
            session.user.user_metadata?.avatar_url ||
            undefined,
          bio: profile?.bio || undefined,
          website: profile?.website || undefined,
          role: isAdmin ? "admin" : "user",
          purchases: [],
          wishlist: [],
          createdAt: session.user.created_at || new Date().toISOString(),
          isVerified,
        });
        loadWishlist(session.user.id);
      }
    };

    restoreSession();

    // Check for password recovery hash/query params
    const url = new URL(window.location.href);
    if (
      url.searchParams.get("type") === "recovery" ||
      window.location.hash.includes("type=recovery")
    ) {
      setShowSetNewPasswordModal(true);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setShowSetNewPasswordModal(true);
        } else if (event === "SIGNED_IN" && session?.user) {
          let { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name, avatar_url, bio, website")
            .eq("id", session.user.id)
            .maybeSingle();

          const userEmail = (session.user.email || "").toLowerCase().trim();
          const isAdmin =
            userEmail === "ahmedazy.uxui@gmail.com" ||
            profile?.role === "admin";
          const isVerified = Boolean(
            session.user.email_confirmed_at ||
            session.user.confirmed_at ||
            isAdmin
          );

          if (!profile) {
            const defaultName =
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "User";
            await supabase
              .from("profiles")
              .upsert(
                {
                  id: session.user.id,
                  email: session.user.email,
                  full_name: defaultName,
                  avatar_url:
                    session.user.user_metadata?.avatar_url ||
                    session.user.user_metadata?.picture ||
                    null,
                  role: isAdmin ? "admin" : "user",
                  provider: session.user.app_metadata?.provider || "email",
                },
                { onConflict: "id" }
              )
              .catch(() => {});
          }

          setAuthUser({
            id: session.user.id,
            name:
              profile?.full_name ||
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "User",
            email: session.user.email || "",
            avatar:
              profile?.avatar_url ||
              session.user.user_metadata?.avatar_url ||
              undefined,
            bio: profile?.bio || undefined,
            website: profile?.website || undefined,
            role: isAdmin ? "admin" : "user",
            purchases: [],
            wishlist: [],
            createdAt: session.user.created_at || new Date().toISOString(),
            isVerified,
          });
          loadWishlist(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setAuthUser(null);
          setWishlistProductIds([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadWishlist]);

  // Wishlist toggle handler
  const handleToggleWishlist = async (productId: string) => {
    if (!authUser) {
      setAuthModal({ isOpen: true, mode: "login" });
      toast.info("Sign in to save items to your favorites!");
      return;
    }

    const isFav = wishlistProductIds.includes(productId);
    if (isFav) {
      const next = wishlistProductIds.filter((id) => id !== productId);
      setWishlistProductIds(next);
      setAuthUser((prev) => (prev ? { ...prev, wishlist: next } : null));
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", authUser.id)
        .eq("product_id", productId);
      toast.info("Removed from saved resources.");
    } else {
      const next = [...wishlistProductIds, productId];
      setWishlistProductIds(next);
      setAuthUser((prev) => (prev ? { ...prev, wishlist: next } : null));
      await supabase
        .from("wishlist")
        .insert({ user_id: authUser.id, product_id: productId });
      toast.success("Saved to your favorites!");
    }
  };

  // Sign out handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setWishlistProductIds([]);
    toast.success("Signed out successfully.");
    if (page === "profile" || page === "admin") {
      setPage("home");
      pushRoute({ page: "home" });
    }
  };

  // Navigation handlers
  const handleNavigate = (newPage: Page) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPage(newPage);
    if (newPage !== "product") {
      setSelectedProduct(null);
    }
    if (newPage !== "browse") {
      setActiveCategoryId(null);
      setActiveSubcategoryId(null);
    }
    pushRoute({ page: newPage });
  };

  const handleProductClick = (prod: Product) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedProduct(prod);
    setPage("product");
    pushRoute({ page: "product", productId: prod.id }, prod);
  };

  const handleCategoryClick = (catId: string, subcatId?: string | null) => {
    setActiveCategoryId(catId);
    setActiveSubcategoryId(subcatId || null);
    setSearchQuery("");
    setPage("browse");
    window.scrollTo({ top: 0, behavior: "smooth" });
    pushRoute({
      page: "browse",
      categoryId: catId,
      subcategoryId: subcatId || undefined,
    });
  };

  const handleSearch = async (q: string) => {
    const term = (q || "").trim();
    setSearchQuery(term);
    setActiveCategoryId(null);
    setPage("browse");
    window.scrollTo({ top: 0, behavior: "smooth" });
    pushRoute({ page: "browse", searchQuery: term });

    if (term.length >= 2) {
      try {
        await supabase.from("search_logs").insert({
          query: term,
          user_id: authUser?.id || null,
        });
      } catch (err) {
        console.warn("Search log notice:", err);
      }
    }
  };

  // Scroll sentinel for gift popup trigger
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350 && !scrollReadyForGift) {
        setScrollReadyForGift(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollReadyForGift]);

  // Dissolve initial loading once core data is ready OR after safety timeout
  useEffect(() => {
    // Guaranteed safety timeout: Never freeze on loading screen
    const maxTimer = setTimeout(() => {
      setInitialLoading(false);
    }, 400);

    if (!loadingData) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 150);
      return () => {
        clearTimeout(timer);
        clearTimeout(maxTimer);
      };
    }

    return () => clearTimeout(maxTimer);
  }, [loadingData]);

  // Saved resources list
  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlistProductIds.includes(p.id)),
    [products, wishlistProductIds]
  );

  // Standalone Admin Dashboard Layout
  if (page === "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground font-sans">
        <LoadingScreen
          isLoading={initialLoading}
          message="Loading Studio Dashboard..."
        />
        <Toaster
          position="bottom-left"
          theme={isDark ? "dark" : "light"}
          closeButton
          duration={3500}
        />
        <AdminDashboardLayout
          authUser={authUser}
          onNavigate={handleNavigate}
          categories={categories}
          products={products}
          isDark={isDark}
          themeMode={themeMode}
          onThemeChange={handleThemeChange}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // Dynamic CMS announcement banner
  const announcement = (() => {
    try {
      const saved = localStorage.getItem("ld_custom_announcement");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { enabled: false, message: "", linkText: "", linkUrl: "" };
  })();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground font-sans">
      <LoadingScreen
        isLoading={initialLoading}
        message="Loading free Figma resources..."
      />

      {/* Dynamic Announcement Bar from CMS */}
      {announcement?.enabled && announcement.message && (
        <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 relative z-50 shadow-sm">
          <span>{announcement.message}</span>
          {announcement.linkText && (
            <button
              onClick={() => {
                if (
                  announcement.linkUrl === "browse" ||
                  announcement.linkUrl === "about" ||
                  announcement.linkUrl === "team" ||
                  announcement.linkUrl === "publisher" ||
                  announcement.linkUrl === "terms" ||
                  announcement.linkUrl === "privacy" ||
                  announcement.linkUrl === "favorites" ||
                  announcement.linkUrl === "profile"
                ) {
                  handleNavigate(announcement.linkUrl as Page);
                } else if (announcement.linkUrl.startsWith("http")) {
                  window.open(announcement.linkUrl, "_blank");
                } else {
                  handleNavigate("browse");
                }
              }}
              className="underline font-mono ml-1 hover:opacity-80 cursor-pointer"
            >
              {announcement.linkText} →
            </button>
          )}
        </div>
      )}

      {/* Toast Notifications Provider (Bottom-Left Studio Notifications) */}
      <Toaster
        position="bottom-left"
        theme={isDark ? "dark" : "light"}
        closeButton
        duration={3500}
      />

      {/* Global Navigation Bar */}
      <Navbar
        isDark={isDark}
        themeMode={themeMode}
        onThemeChange={handleThemeChange}
        onToggle={toggleTheme}
        page={page}
        onNavigate={handleNavigate}
        authUser={authUser}
        onAuthOpen={(mode) => setAuthModal({ isOpen: true, mode })}
        onLogout={handleLogout}
        onSearch={handleSearch}
        wishlistCount={wishlistProductIds.length}
        categories={categories}
        onCategoryClick={handleCategoryClick}
        activeCategoryId={activeCategoryId}
        onVerificationSuccess={() => {
          setAuthUser((prev) => (prev ? { ...prev, isVerified: true } : null));
        }}
      />

      {/* Page Routing */}
      <main>
        <AnimatePresence mode="wait">
          {page === "home" && (
            <HomePage
              onNavigate={handleNavigate}
              onProductClick={handleProductClick}
              categories={categories}
              products={products}
              wishlist={wishlistProductIds}
              onWishlistToggle={handleToggleWishlist}
              onCategoryClick={handleCategoryClick}
              authUser={authUser}
              onSearch={handleSearch}
              onAuthOpen={(mode) => setAuthModal({ isOpen: true, mode })}
            />
          )}

          {page === "browse" && (
            <BrowsePage
              onNavigate={handleNavigate}
              onProductClick={handleProductClick}
              categories={categories}
              products={products}
              wishlist={wishlistProductIds}
              onToggleWishlist={handleToggleWishlist}
              activeCategoryId={activeCategoryId}
              activeSubcategoryId={activeSubcategoryId}
              onCategoryChange={setActiveCategoryId}
              onSubcategoryChange={setActiveSubcategoryId}
              initialSearchQuery={searchQuery}
              authUser={authUser}
              onAuthOpen={(mode) => setAuthModal({ isOpen: true, mode })}
            />
          )}

          {page === "product" && selectedProduct && (
            <ProductDetailPage
              product={selectedProduct}
              onNavigate={handleNavigate}
              onProductClick={handleProductClick}
              relatedProducts={products.filter((p) => p.id !== selectedProduct.id)}
              wishlist={wishlistProductIds}
              onToggleWishlist={handleToggleWishlist}
              authUser={authUser}
              categories={categories}
              onAuthOpen={(mode) => setAuthModal({ isOpen: true, mode })}
            />
          )}

          {page === "favorites" && (
            <FavoritesPage
              onNavigate={handleNavigate}
              onProductClick={handleProductClick}
              favoriteProducts={wishlistProducts}
              onToggleWishlist={handleToggleWishlist}
              categories={categories}
              authUser={authUser}
            />
          )}

          {page === "profile" && authUser && (
            <ProfilePage
              authUser={authUser}
              onUpdate={(updated) =>
                setAuthUser((prev) => (prev ? { ...prev, ...updated } : null))
              }
              onLogout={handleLogout}
              onProductClick={handleProductClick}
            />
          )}

          {page === "publisher" && (
            <PublisherPage
              onNavigate={handleNavigate}
              categories={categories}
            />
          )}

          {page === "team" && (
            <TeamPage
              onNavigate={handleNavigate}
              categories={categories}
            />
          )}

          {page === "about" && (
            <AboutPage
              onNavigate={handleNavigate}
              categories={categories}
            />
          )}

          {page === "terms" && (
            <TermsPage
              onNavigate={handleNavigate}
              categories={categories}
            />
          )}

          {page === "privacy" && (
            <PrivacyPage
              onNavigate={handleNavigate}
              categories={categories}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Auth Modal Overlay */}
      {authModal.isOpen && (
        <AuthModal
          mode={authModal.mode}
          onClose={() => setAuthModal({ isOpen: false, mode: "login" })}
          onSuccess={(user) => {
            setAuthUser(user);
            setAuthModal({ isOpen: false, mode: "login" });
            if (
              user.role === "admin" ||
              user.email.toLowerCase().trim() === "ahmedazy.uxui@gmail.com"
            ) {
              handleNavigate("admin");
            }
          }}
          onSwitchMode={(mode) => setAuthModal({ isOpen: true, mode })}
          onNavigate={handleNavigate}
        />
      )}

      {/* Set New Password Modal (Recovery Flow) */}
      {showSetNewPasswordModal && (
        <SetNewPasswordModal
          onClose={() => setShowSetNewPasswordModal(false)}
          onSuccess={() => setShowSetNewPasswordModal(false)}
        />
      )}

      {/* Community Gift Popup Sentinel */}
      <GiftPopup
        authUser={authUser}
        onSuccess={(user) => setAuthUser(user)}
        scrollReady={scrollReadyForGift}
      />
    </div>
  );
}

export default App;