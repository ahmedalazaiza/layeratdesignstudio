import React, { useEffect, useState, useCallback, useMemo, Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { DataProvider, useData } from "../context/DataContext";
import { Navbar } from "../components/layout/Navbar";
import { AuthModal } from "../components/auth/AuthModal";
import { SetNewPasswordModal } from "../components/auth/SetNewPasswordModal";
import { GiftPopup } from "../components/auth/GiftPopup";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import {
  parseCurrentRoute,
  pushRoute,
  getRouteTitle,
  buildRouteUrl,
} from "../lib/router";
import type { Page, Product, Category } from "../types";

// Dynamic Code-Splitting for High Performance & Optimized LCP/CWV
const HomePage = lazy(() => import("../pages/HomePage").then((m) => ({ default: m.HomePage })));
const BrowsePage = lazy(() => import("../pages/BrowsePage").then((m) => ({ default: m.BrowsePage })));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
const FavoritesPage = lazy(() => import("../pages/FavoritesPage").then((m) => ({ default: m.FavoritesPage })));
const ProfilePage = lazy(() => import("../components/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const PublisherPage = lazy(() => import("../pages/PublisherPage").then((m) => ({ default: m.PublisherPage })));
const TeamPage = lazy(() => import("../pages/TeamPage").then((m) => ({ default: m.TeamPage })));
const AboutPage = lazy(() => import("../pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const TermsPage = lazy(() => import("../pages/TermsPage").then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import("../pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const AdminDashboardLayout = lazy(() =>
  import("../components/admin/AdminDashboardLayout").then((m) => ({
    default: m.AdminDashboardLayout,
  }))
);

export type ThemeMode = "light" | "dark" | "system";

/**
 * Loading Fallback for Suspense Page Transitions
 */
function PageSuspenseFallback() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-12">
      <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
      <span className="text-xs font-mono text-muted-foreground animate-pulse">
        Rendering view...
      </span>
    </div>
  );
}

/**
 * Main Application Routing & Content Shell
 */
function AppContent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const themeMode = ((mounted ? theme : "system") as ThemeMode) || "system";

  const handleThemeChange = (mode: ThemeMode) => setTheme(mode);
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const {
    authUser,
    wishlist,
    toggleWishlist,
    authModal,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    refreshUserProfile,
    showSetNewPasswordModal,
    setShowSetNewPasswordModal,
    signOut,
  } = useAuth();

  const { products, categories, loading: dataLoading, refreshAll } = useData();

  // Initial Route parsed from URL
  const initialRoute = useMemo(() => parseCurrentRoute(), []);

  // Navigation state
  const [page, setPage] = useState<Page>(initialRoute.page);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(initialRoute.categoryId || null);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>((initialRoute as any).subcategoryId || null);
  const [searchQuery, setSearchQuery] = useState<string>(initialRoute.searchQuery || "");

  // Initial full screen loading dismiss
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Sync route on popstate (browser back/forward)
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

  // Core navigation handler
  const handleNavigate = useCallback(
    (
      targetPage: Page,
      options?: {
        productId?: string;
        categoryId?: string;
        subcategoryId?: string;
        searchQuery?: string;
      }
    ) => {
      setPage(targetPage);

      if (options?.categoryId !== undefined) {
        setActiveCategoryId(options.categoryId);
      }
      if (options?.subcategoryId !== undefined) {
        setActiveSubcategoryId(options.subcategoryId);
      }
      if (options?.searchQuery !== undefined) {
        setSearchQuery(options.searchQuery);
      }

      if (targetPage === "product" && options?.productId) {
        const found = products.find(
          (p) => p.id === options.productId || p.slug === options.productId
        );
        if (found) {
          setSelectedProduct(found);
          pushRoute(
            { page: "product", productId: found.slug || found.id },
            getRouteTitle({ page: "product", productId: found.slug || found.id }, found)
          );
        }
      } else {
        if (targetPage !== "product") setSelectedProduct(null);
        pushRoute(
          {
            page: targetPage,
            categoryId: options?.categoryId,
            searchQuery: options?.searchQuery,
          },
          getRouteTitle({
            page: targetPage,
            categoryId: options?.categoryId,
            searchQuery: options?.searchQuery,
          })
        );
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [products]
  );

  const handleProductClick = useCallback(
    (p: Product) => {
      setSelectedProduct(p);
      setPage("product");
      pushRoute(
        { page: "product", productId: p.slug || p.id },
        getRouteTitle({ page: "product", productId: p.slug || p.id }, p)
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const handleCategoryClick = useCallback(
    (catId: string | null) => {
      setActiveCategoryId(catId);
      setActiveSubcategoryId(null);
      handleNavigate("browse", { categoryId: catId || undefined });
    },
    [handleNavigate]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      handleNavigate("browse", { searchQuery: query });
    },
    [handleNavigate]
  );

  // Favorite items for favorites page
  const favoriteProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Render Admin Layout if on admin route
  if (page === "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LoadingScreen
          isLoading={initialLoading}
          message="Loading Layerat Studio..."
        />
        <Toaster
          position="bottom-left"
          theme={isDark ? "dark" : "light"}
          closeButton
          richColors
        />
        <Suspense fallback={<PageSuspenseFallback />}>
          <AdminDashboardLayout
            authUser={authUser}
            onNavigate={handleNavigate}
            categories={categories}
            products={products}
            isDark={isDark}
            themeMode={themeMode}
            onThemeChange={handleThemeChange}
            onToggleTheme={toggleTheme}
            onLogout={signOut}
          />
        </Suspense>
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
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground font-sans flex flex-col">
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

      {/* Toast Notifications (Bottom-Left Luxury Styling) */}
      <Toaster
        position="bottom-left"
        theme={isDark ? "dark" : "light"}
        closeButton
        richColors
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
        onAuthOpen={openAuthModal}
        onLogout={signOut}
        onSearch={handleSearch}
        wishlistCount={wishlist.length}
        categories={categories}
        onCategoryClick={handleCategoryClick}
        activeCategoryId={activeCategoryId}
        onVerificationSuccess={refreshUserProfile}
      />

      {/* Routed Page Content */}
      <main className="flex-1 w-full flex flex-col">
        <Suspense fallback={<PageSuspenseFallback />}>
          <AnimatePresence mode="wait">
            {page === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HomePage
                  onNavigate={handleNavigate}
                  onProductClick={handleProductClick}
                  categories={categories}
                  products={products}
                  wishlist={wishlist}
                  onWishlistToggle={toggleWishlist}
                  onCategoryClick={handleCategoryClick}
                  authUser={authUser}
                  onSearch={handleSearch}
                  onAuthOpen={openAuthModal}
                />
              </motion.div>
            )}

            {page === "browse" && (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BrowsePage
                  onNavigate={handleNavigate}
                  onProductClick={handleProductClick}
                  categories={categories}
                  products={products}
                  wishlist={wishlist}
                  onToggleWishlist={toggleWishlist}
                  activeCategoryId={activeCategoryId}
                  activeSubcategoryId={activeSubcategoryId}
                  onCategoryChange={setActiveCategoryId}
                  onSubcategoryChange={setActiveSubcategoryId}
                  initialSearchQuery={searchQuery}
                  authUser={authUser}
                  onAuthOpen={openAuthModal}
                />
              </motion.div>
            )}

            {page === "product" && selectedProduct && (
              <motion.div
                key={`product-${selectedProduct.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ProductDetailPage
                  product={selectedProduct}
                  onNavigate={handleNavigate}
                  onProductClick={handleProductClick}
                  relatedProducts={products.filter((p) => p.id !== selectedProduct.id)}
                  wishlist={wishlist}
                  onToggleWishlist={toggleWishlist}
                  authUser={authUser}
                  categories={categories}
                  onAuthOpen={openAuthModal}
                />
              </motion.div>
            )}

            {page === "favorites" && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FavoritesPage
                  onNavigate={handleNavigate}
                  onProductClick={handleProductClick}
                  favoriteProducts={favoriteProducts}
                  onToggleWishlist={toggleWishlist}
                  categories={categories}
                  authUser={authUser}
                />
              </motion.div>
            )}

            {page === "profile" && authUser && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ProfilePage
                  authUser={authUser}
                  onUpdate={() => refreshUserProfile()}
                  onLogout={signOut}
                  onProductClick={handleProductClick}
                />
              </motion.div>
            )}

            {page === "publisher" && (
              <motion.div
                key="publisher"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PublisherPage
                  onNavigate={handleNavigate}
                  categories={categories}
                />
              </motion.div>
            )}

            {page === "team" && (
              <motion.div
                key="team"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TeamPage
                  onNavigate={handleNavigate}
                  categories={categories}
                />
              </motion.div>
            )}

            {page === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AboutPage
                  onNavigate={handleNavigate}
                  categories={categories}
                />
              </motion.div>
            )}

            {page === "terms" && (
              <motion.div
                key="terms"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TermsPage
                  onNavigate={handleNavigate}
                  categories={categories}
                />
              </motion.div>
            )}

            {page === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PrivacyPage
                  onNavigate={handleNavigate}
                  categories={categories}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Global Auth Modal */}
      {authModal.isOpen && (
        <AuthModal
          mode={authModal.mode}
          onClose={closeAuthModal}
          onSuccess={() => {
            closeAuthModal();
            refreshUserProfile();
          }}
          onSwitchMode={setAuthModalMode}
          onNavigate={handleNavigate}
        />
      )}

      {/* Set New Password Modal (Recovery Flow) */}
      {showSetNewPasswordModal && (
        <SetNewPasswordModal
          onClose={() => setShowSetNewPasswordModal(false)}
          onSuccess={() => {
            setShowSetNewPasswordModal(false);
            openAuthModal("login");
          }}
        />
      )}

      {/* Community Gift Popup */}
      <GiftPopup
        authUser={authUser}
        onSuccess={() => refreshUserProfile()}
        scrollReady={true}
      />
    </div>
  );
}

/**
 * Root Application Entry with Context Providers
 */
export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;