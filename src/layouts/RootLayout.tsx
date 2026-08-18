import React from "react";
import { Toaster } from "sonner";
import { Navbar, type ThemeMode } from "../components/layout/Navbar";
import { AuthModal } from "../components/auth/AuthModal";
import { SetNewPasswordModal } from "../components/auth/SetNewPasswordModal";
import { GiftPopup } from "../components/auth/GiftPopup";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import type { Page } from "../types";

interface RootLayoutProps {
  children: React.ReactNode;
  page: Page;
  onNavigate: (page: Page, options?: { productId?: string; categoryId?: string; subcategoryId?: string; searchQuery?: string }) => void;
  isDark: boolean;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  onSearch: (q: string) => void;
  onCategoryClick: (catId: string, subcatId?: string | null) => void;
  activeCategoryId: string | null;
}

export function RootLayout({
  children,
  page,
  onNavigate,
  isDark,
  themeMode,
  onThemeChange,
  toggleTheme,
  onSearch,
  onCategoryClick,
  activeCategoryId,
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
    signOut,
  } = useAuth();

  const { categories } = useData();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Toast Notification Container (Bottom-Left Luxury Glassmorphism) */}
      <Toaster
        position="bottom-left"
        theme={isDark ? "dark" : "light"}
        closeButton
        richColors
      />

      {/* Global Navbar */}
      <Navbar
        page={page}
        onNavigate={onNavigate}
        isDark={isDark}
        onToggle={toggleTheme}
        themeMode={themeMode}
        onThemeChange={onThemeChange}
        authUser={authUser}
        onAuthOpen={openAuthModal}
        onLogout={signOut}
        onSearch={onSearch}
        wishlistCount={wishlist.length}
        categories={categories}
        onCategoryClick={onCategoryClick}
        activeCategoryId={activeCategoryId}
        onVerificationSuccess={refreshUserProfile}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 w-full flex flex-col">{children}</main>

      {/* Global Authentication Modal */}
      {authModal.isOpen && (
        <AuthModal
          mode={authModal.mode}
          onClose={closeAuthModal}
          onSuccess={() => {
            closeAuthModal();
            refreshUserProfile();
          }}
          onSwitchMode={setAuthModalMode}
          onNavigate={onNavigate}
        />
      )}

      {/* Password Reset Modal */}
      {showSetNewPasswordModal && (
        <SetNewPasswordModal
          onClose={() => setShowSetNewPasswordModal(false)}
          onSuccess={() => {
            setShowSetNewPasswordModal(false);
            openAuthModal("login");
          }}
        />
      )}

      {/* Guest Welcome & Gift Modal */}
      <GiftPopup
        authUser={authUser}
        onSuccess={() => refreshUserProfile()}
        scrollReady={true}
      />
    </div>
  );
}
