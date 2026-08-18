import React, { useEffect, useState, useCallback, useMemo, Suspense, lazy } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { DataProvider, useData } from "../context/DataContext";
import { Navbar } from "../components/layout/Navbar";
import { ScrollToTop } from "../components/layout/ScrollToTop";
import { AuthModal } from "../components/auth/AuthModal";
import { SetNewPasswordModal } from "../components/auth/SetNewPasswordModal";
import { GiftPopup } from "../components/auth/GiftPopup";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { generateSEOMetadata, updateDOMHeadSEO } from "../lib/seo";
import { parseCurrentRoute } from "../lib/router";
import type { Page, Product } from "../types";

// Dynamic Lazy Code-Splitting for High Performance & Core Web Vitals
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
        Loading Studio View...
      </span>
    </div>
  );
}

/**
 * Automatic SEO Synchronizer on Route Change
 */
function RouteSEOTracker() {
  const location = useLocation();
  const { products } = useData();

  useEffect(() => {
    const currentRoute = parseCurrentRoute();
    const product =
      currentRoute.page === "product" && currentRoute.productId
        ? products.find(
            (p) => p.id === currentRoute.productId || p.slug === currentRoute.productId
          )
        : null;

    const meta = generateSEOMetadata(currentRoute, product);
    updateDOMHeadSEO(meta, product);
  }, [location.pathname, location.search, products]);

  return null;
}

/**
 * Browse Page Route Adapter (Reads & Updates URL Search Query Parameters)
 */
function BrowsePageRouteAdapter({
  onNavigate,
  onProductClick,
  wishlist,
  onToggleWishlist,
  authUser,
  onAuthOpen,
}: any) {
  const { categories, products } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const queryParam = searchParams.get("q") || "";

  const handleCategoryChange = (catId: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (catId) next.set("category", catId);
    else next.delete("category");
    next.delete("subcategory");
    setSearchParams(next, { replace: true });
  };

  const handleSubcategoryChange = (subcatId: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (subcatId) next.set("subcategory", subcatId);
    else next.delete("subcategory");
    setSearchParams(next, { replace: true });
  };

  return (
    <BrowsePage
      onNavigate={onNavigate}
      onProductClick={onProductClick}
      categories={categories}
      products={products}
      wishlist={wishlist}
      onToggleWishlist={onToggleWishlist}
      activeCategoryId={categoryParam}
      activeSubcategoryId={subcategoryParam}
      onCategoryChange={handleCategoryChange}
      onSubcategoryChange={handleSubcategoryChange}
      initialSearchQuery={queryParam}
      authUser={authUser}
      onAuthOpen={onAuthOpen}
    />
  );
}

/**
 * Product Detail Page Route Adapter (Extracts Slug / ID from React Router useParams)
 */
function ProductDetailRouteAdapter({
  onNavigate,
  onProductClick,
  wishlist,
  onToggleWishlist,
  authUser,
  onAuthOpen,
}: any) {
  const { slug } = useParams<{ slug: string }>();
  const { products, categories, loading } = useData();

  const product = useMemo(() => {
    if (!slug) return undefined;
    return products.find((p) => p.slug === slug || p.id === slug);
  }, [slug, products]);

  if (!product && loading) {
    return <PageSuspenseFallback />;
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Resource Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The requested Figma design resource or UI kit could not be found.
        </p>
        <button
          onClick={() => onNavigate("browse")}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer hover:opacity-90 transition-all shadow-lg"
        >
          Explore All Resources
        </button>
      </div>
    );
  }

  return (
    <ProductDetailPage
      product={product}
      authUser={authUser}
      onAuthOpen={onAuthOpen}
      wishlist={wishlist}
      onToggleWishlist={onToggleWishlist}
      categories={categories}
      onNavigate={onNavigate}
      onProductClick={onProductClick}
      relatedProducts={products.filter((p) => p.id !== product.id)}
    />
  );
}

/**
 * Main Application Navigation & Route Tree
 */
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const { products, categories } = useData();

  // Initial Fullscreen Loading Screen dismiss
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  // Compute current page enum from current pathname
  const currentPage: Page = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/browse") || path.startsWith("/explore")) return "browse";
    if (path.startsWith("/product/")) return "product";
    if (path.startsWith("/favorites") || path.startsWith("/library")) return "favorites";
    if (path.startsWith("/profile")) return "profile";
    if (path.startsWith("/publisher") || path.startsWith("/join")) return "publisher";
    if (path.startsWith("/team")) return "team";
    if (path.startsWith("/about")) return "about";
    if (path.startsWith("/terms")) return "terms";
    if (path.startsWith("/privacy")) return "privacy";
    if (path.startsWith("/dashboard") || path.startsWith("/admin")) return "admin";
    return "home";
  }, [location.pathname]);

  // Unified React Router Navigation Handler
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
      if (targetPage === "home") {
        navigate("/");
      } else if (targetPage === "product" && options?.productId) {
        navigate(`/product/${encodeURIComponent(options.productId)}`);
      } else if (targetPage === "browse") {
        const params = new URLSearchParams();
        if (options?.categoryId) params.set("category", options.categoryId);
        if (options?.subcategoryId) params.set("subcategory", options.subcategoryId);
        if (options?.searchQuery) params.set("q", options.searchQuery);
        const qs = params.toString();
        navigate(qs ? `/browse?${qs}` : "/browse");
      } else if (targetPage === "admin") {
        navigate("/dashboard");
      } else {
        navigate(`/${targetPage}`);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
  );

  const handleProductClick = useCallback(
    (p: Product) => {
      const slugOrId = p.slug || p.id;
      navigate(`/product/${encodeURIComponent(slugOrId)}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
  );

  const handleCategoryClick = useCallback(
    (catId: string | null) => {
      if (catId) {
        navigate(`/browse?category=${encodeURIComponent(catId)}`);
      } else {
        navigate("/browse");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim()) {
        navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
      } else {
        navigate("/browse");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
  );

  // Filtered favorite products list
  const favoriteProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Is current route admin / dashboard?
  const isAdminRoute = currentPage === "admin";

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

      {/* Automatically Reset Scroll to Top on Navigation */}
      <ScrollToTop />

      {/* Dynamic SEO Tags & Schema Synchronizer */}
      <RouteSEOTracker />

      {/* Toast Notifications Provider (Bottom-Left Luxury Styling) */}
      <Toaster
        position="bottom-left"
        theme={isDark ? "dark" : "light"}
        closeButton
        richColors
      />

      {/* Dynamic Announcement Bar from CMS */}
      {!isAdminRoute && announcement?.enabled && announcement.message && (
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

      {/* Global Navigation Bar (Hidden on Admin routes) */}
      {!isAdminRoute && (
        <Navbar
          isDark={isDark}
          themeMode={themeMode}
          onThemeChange={handleThemeChange}
          onToggle={toggleTheme}
          page={currentPage}
          onNavigate={handleNavigate}
          authUser={authUser}
          onAuthOpen={openAuthModal}
          onLogout={signOut}
          onSearch={handleSearch}
          wishlistCount={wishlist.length}
          categories={categories}
          onCategoryClick={handleCategoryClick}
          activeCategoryId={new URLSearchParams(location.search).get("category")}
          onVerificationSuccess={refreshUserProfile}
        />
      )}

      {/* Declarative React Router Routes */}
      <main className="flex-1 w-full flex flex-col">
        <Suspense fallback={<PageSuspenseFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Home Page */}
              <Route
                path="/"
                element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
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
                }
              />

              {/* Browse / Explore Resources */}
              <Route
                path="/browse"
                element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <BrowsePageRouteAdapter
                      onNavigate={handleNavigate}
                      onProductClick={handleProductClick}
                      wishlist={wishlist}
                      onToggleWishlist={toggleWishlist}
                      authUser={authUser}
                      onAuthOpen={openAuthModal}
                    />
                  </motion.div>
                }
              />
              <Route path="/explore" element={<Navigate to="/browse" replace />} />

              {/* Product Detail Page (Dynamic Slug / ID) */}
              <Route
                path="/product/:slug"
                element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ProductDetailRouteAdapter
                      onNavigate={handleNavigate}
                      onProductClick={handleProductClick}
                      wishlist={wishlist}
                      onToggleWishlist={toggleWishlist}
                      authUser={authUser}
                      onAuthOpen={openAuthModal}
                    />
                  </motion.div>
                }
              />

              {/* Favorites / Saved Library */}
              <Route
                path="/favorites"
                element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
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
                }
              />
              <Route path="/library" element={<Navigate to="/favorites" replace />} />
              <Route path="/saved" element={<Navigate to="/favorites" replace />} />

              {/* User Profile */}
              <Route
                path="/profile"
                element={
                  authUser ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ProfilePage
                        authUser={authUser}
                        onUpdate={() => refreshUserProfile()}
                        onLogout={signOut}
                        onProductClick={handleProductClick}
                      />
                    </motion.div>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="/account" element={<Navigate to="/profile" replace />} />

              {/* Publisher & Creator Program */}
              <Route
                path="/publisher"
                element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <PublisherPage
                      onNavigate={handleNavigate}
                      categories={categories}
                    />
                  </motion.div>
                }
              />
              <Route path="/join" element={<Navigate to="/publisher" replace />} />
              <Route path="/creator" element={<Navigate to="/publisher" replace />} />

              {/* Team Page */}
              <Route
                path="/team"
                element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TeamPage
                      onNavigate={handleNavigate}
                      categories={categories}
                    />
                  </motion.div>
                }
              />
              <Route path="/creators" element={<Navigate to="/team" replace />} />

              {/* About Studio */}
              <Route
                path="/about"
                element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <AboutPage
                      onNavigate={handleNavigate}
                      categories={categories}
                    />
                  </motion.div>
                }
              />
              <Route path="/story" element={<Navigate to="/about" replace />} />

              {/* Terms & Conditions */}
              <Route
                path="/terms"
                element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TermsPage
                      onNavigate={handleNavigate}
                      categories={categories}
                    />
                  </motion.div>
                }
              />
              <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
              <Route path="/license" element={<Navigate to="/terms" replace />} />

              {/* Privacy Policy */}
              <Route
                path="/privacy"
                element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <PrivacyPage
                      onNavigate={handleNavigate}
                      categories={categories}
                    />
                  </motion.div>
                }
              />
              <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />

              {/* Admin Console & Dashboard */}
              <Route
                path="/dashboard"
                element={
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
                }
              />
              <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

              {/* Fallback Catch-all -> Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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

      {/* Password Reset Modal (Recovery Flow) */}
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