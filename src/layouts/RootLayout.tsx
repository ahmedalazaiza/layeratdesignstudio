import React from "react";
import { Toaster } from "sonner";
import { Navbar } from "../components/layout/Navbar";
import { AuthModal } from "../components/auth/AuthModal";
import { SetNewPasswordModal } from "../components/auth/SetNewPasswordModal";
import { GiftPopup } from "../components/auth/GiftPopup";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import type { Page } from "../types";

interface RootLayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page, options?: { productId?: string; categoryId?: string; subcategoryId?: string; searchQuery?: string }) => void;
  isDark: boolean;
  themeMode: "light" | "dark" | "system";
  onThemeChange: (mode: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
  initialSearchQuery?: string;
  onCategorySelect?: (catId: string | null) => void;
  onSubcategorySelect?: (subcatId: string | null) => void;
}

export function RootLayout({
  children,
  currentPage,
  onNavigate,
  isDark,
  themeMode,
  onThemeChange,
  toggleTheme,
  initialSearchQuery = "",
  onCategorySelect,
  onSubcategorySelect,
}: RootLayoutProps) {
  const {
    authUser,
    wishlist,
    authModal,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    refreshUserProfile,
    showSetNewPasswordModal,
    setShowSetNewPasswordModal,
  } = useAuth();

  const { categories, products } = useData();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Toast Notification Container (Bottom-Left Luxury Glassmorphism) */}
      <Toaster
        position="bottom-left"
        theme={isDark ? "dark" : "light"}
        closeButton
        richColors
        toastOptions={{
          className:
            "font-sans border border-border/60 backdrop-blur-xl shadow-2xl rounded-2xl p-4 text-sm font-medium text-foreground bg-card/90",
          style: {
            fontFamily: "inherit",
          },
        }}
      />

      {/* Global Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isDark={isDark}
        toggleTheme={toggleTheme}
        themeMode={themeMode}
        onThemeChange={onThemeChange}
        authUser={authUser}
        onAuthOpen={(mode) => openAuthModal(mode)}
        wishlistCount={wishlist.length}
        categories={categories}
        products={products}
        initialSearchQuery={initialSearchQuery}
        onCategorySelect={onCategorySelect}
        onSubcategorySelect={onSubcategorySelect}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 w-full flex flex-col">{children}</main>

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onSwitchMode={setAuthModalMode}
        onAuthSuccess={refreshUserProfile}
      />

      {/* Password Reset Modal */}
      <SetNewPasswordModal
        isOpen={showSetNewPasswordModal}
        onClose={() => setShowSetNewPasswordModal(false)}
        onSuccess={() => {
          setShowSetNewPasswordModal(false);
          openAuthModal("login");
        }}
      />

      {/* Guest Welcome & Gift Modal */}
      <GiftPopup
        isLoggedIn={Boolean(authUser)}
        onOpenAuthModal={(mode) => openAuthModal(mode)}
      />
    </div>
  );
}
