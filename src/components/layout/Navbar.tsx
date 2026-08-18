import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Layout,
  Settings,
  Package,
} from "lucide-react";
import { UnverifiedEmailBanner } from "./UnverifiedEmailBanner";
import { LayeratLogo } from "../brand/LayeratLogo";
import type { Page, AuthUser, Category } from "../../types";

export type ThemeMode = "light" | "dark" | "system";

function useScrollY(enabled: boolean = true) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setScrollY(0);
      return;
    }

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return scrollY;
}

interface NavbarProps {
  isDark: boolean;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
  onToggle?: () => void;
  page: Page;
  onNavigate: (p: Page) => void;
  authUser: AuthUser | null;
  onAuthOpen: (mode: "login" | "register" | "forgot_password") => void;
  onLogout: () => void;
  onSearch: (q: string) => void;
  wishlistCount: number;
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
  activeCategoryId: string | null;
  onVerificationSuccess?: () => void;
}

export function Navbar({
  isDark,
  themeMode = "system",
  onThemeChange,
  onToggle,
  page,
  onNavigate,
  authUser,
  onAuthOpen,
  onLogout,
  onSearch,
  wishlistCount,
  categories,
  onCategoryClick,
  activeCategoryId,
  onVerificationSuccess,
}: NavbarProps) {
  const scrollY = useScrollY(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guestThemeOpen, setGuestThemeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const solid = scrollY > 40 || menuOpen || searchOpen;

  const isAdmin =
    authUser &&
    (authUser.role === "admin" ||
      authUser.email?.toLowerCase().trim() === "ahmedazy.uxui@gmail.com");

  const handleSearch = () => {
    if (searchVal.trim()) {
      onSearch(searchVal.trim());
      setSearchOpen(false);
      setSearchVal("");
      setMenuOpen(false);
    }
  };

  // Close profile dropdown on outside click or ESC key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };

    if (profileOpen || searchOpen || menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen, searchOpen, menuOpen]);

  // Initials fallback for user avatar
  const initials = authUser
    ? authUser.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-auto">
      {/* Unverified Email Top Banner (Stacks above Navbar, never overlaps) */}
      <UnverifiedEmailBanner
        authUser={authUser}
        onVerificationSuccess={onVerificationSuccess}
      />

      <nav
        className={`w-full transition-all duration-300 border-b ${
          solid
            ? "bg-background/90 backdrop-blur-xl border-border shadow-sm"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-10 flex items-center justify-between h-16 lg:h-20 gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => {
            onNavigate("home");
            setMenuOpen(false);
          }}
          className="shrink-0 hover:opacity-85 transition-opacity cursor-pointer flex items-center"
          title="Layerat Design Studio"
        >
          <LayeratLogo isDark={isDark} height={28} className="h-6 sm:h-7.5 w-auto" />
        </button>

        {/* Desktop center nav */}
        <div className="hidden md:flex items-center gap-1.5 ml-6">
          <button
            onClick={() => onNavigate("home")}
            className={`text-sm transition-colors px-3 py-1.5 rounded-xl hover:bg-primary/10 relative group cursor-pointer ${
              page === "home"
                ? "text-primary font-bold bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Home
            <span
              className={`absolute -bottom-0.5 left-3 right-3 h-0.5 bg-primary transition-transform duration-300 ${
                page === "home"
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </button>

          <button
            onClick={() => onNavigate("browse")}
            className={`text-sm transition-colors px-3 py-1.5 rounded-xl hover:bg-primary/10 relative group cursor-pointer ${
              page === "browse" && !activeCategoryId
                ? "text-primary font-bold bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Free Resources
            <span
              className={`absolute -bottom-0.5 left-3 right-3 h-0.5 bg-primary transition-transform duration-300 ${
                page === "browse" && !activeCategoryId
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </button>

          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryClick(cat.id)}
                className={`text-sm transition-colors px-3 py-1.5 rounded-xl hover:bg-primary/10 relative group cursor-pointer ${
                  isActive
                    ? "text-primary font-bold bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
                <span
                  className={`absolute -bottom-0.5 left-3 right-3 h-0.5 bg-primary transition-transform duration-300 ${
                    isActive
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search toggle (desktop) */}
          <div className="hidden md:block relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center overflow-hidden"
                >
                  <div className="flex items-center border border-border rounded-xl bg-card overflow-hidden w-full shadow-md">
                    <Search
                      size={14}
                      className="ml-3 text-muted-foreground shrink-0"
                    />
                    <input
                      autoFocus
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search free resources..."
                      className="flex-1 px-3 py-2 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="mr-2 p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 cursor-pointer"
                >
                  <Search size={16} className="text-muted-foreground" />
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* Favorites */}
          <button
            onClick={() => onNavigate("favorites")}
            aria-label="Saved resources"
            className={`relative w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer ${
              page === "favorites"
                ? "border-primary/50 bg-primary/10"
                : "border-border bg-card hover:border-primary/50 hover:bg-primary/10"
            }`}
          >
            <Heart
              size={16}
              className={
                page === "favorites"
                  ? "text-primary fill-current"
                  : "text-muted-foreground"
              }
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </button>

          {/* Auth / User Profile */}
          {authUser ? (
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 transition-all duration-200 cursor-pointer"
              >
                {authUser.avatar ? (
                  <img
                    src={authUser.avatar}
                    alt={authUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-primary/30 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                    {initials}
                  </div>
                )}
                <span className="text-sm font-medium text-foreground max-w-[90px] truncate">
                  {authUser.name.split(" ")[0]}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-muted-foreground transition-transform ${
                    profileOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                      {authUser.avatar ? (
                        <img
                          src={authUser.avatar}
                          alt={authUser.name}
                          className="w-10 h-10 rounded-2xl object-cover border border-primary/30 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate">
                          {authUser.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate font-mono">
                          {authUser.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate("profile");
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors cursor-pointer"
                      >
                        <User size={15} />
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          onNavigate("profile");
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors cursor-pointer"
                      >
                        <Package size={15} />
                        My Library
                      </button>

                      <button
                        onClick={() => {
                          onNavigate("favorites");
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors cursor-pointer"
                      >
                        <Heart size={15} />
                        Saved Resources
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            onNavigate("admin");
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary font-semibold hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <Settings size={15} />
                          Admin Dashboard
                        </button>
                      )}
                    </div>

                    {/* Theme Mode Segmented Selector */}
                    <div className="px-3 py-2.5 border-t border-border bg-muted/20">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Appearance</span>
                        <span className="text-[10px] text-primary font-bold capitalize">
                          {themeMode}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 bg-background/80 p-1 rounded-xl border border-border">
                        <button
                          type="button"
                          onClick={() => onThemeChange?.("light")}
                          className={`flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            themeMode === "light"
                              ? "bg-card text-foreground font-bold shadow-sm border border-border"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title="Light Mode"
                        >
                          <Sun size={12} />
                          <span className="text-[11px]">Light</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onThemeChange?.("dark")}
                          className={`flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            themeMode === "dark"
                              ? "bg-card text-foreground font-bold shadow-sm border border-border"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title="Dark Mode"
                        >
                          <Moon size={12} />
                          <span className="text-[11px]">Dark</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onThemeChange?.("system")}
                          className={`flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            themeMode === "system"
                              ? "bg-card text-foreground font-bold shadow-sm border border-border"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title="Match Operating System Theme"
                        >
                          <Laptop size={12} />
                          <span className="text-[11px]">Auto</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-border pt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              {/* Guest Theme Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setGuestThemeOpen(!guestThemeOpen)}
                  aria-label="Theme mode"
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-card hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                >
                  {isDark ? (
                    <Sun size={15} className="text-primary" />
                  ) : (
                    <Moon size={15} className="text-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {guestThemeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-36 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl p-1.5 z-50 space-y-1"
                    >
                      <button
                        onClick={() => {
                          onThemeChange?.("light");
                          setGuestThemeOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          themeMode === "light"
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Sun size={13} /> Light
                      </button>
                      <button
                        onClick={() => {
                          onThemeChange?.("dark");
                          setGuestThemeOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          themeMode === "dark"
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Moon size={13} /> Dark
                      </button>
                      <button
                        onClick={() => {
                          onThemeChange?.("system");
                          setGuestThemeOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          themeMode === "system"
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Laptop size={13} /> System Auto
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => onAuthOpen("login")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full border border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => onAuthOpen("register")}
                className="text-sm font-bold px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-5 pb-6"
          >
            {/* Mobile search */}
            <div className="py-4 border-b border-border/50">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-card">
                <Search size={16} className="text-muted-foreground shrink-0" />
                <input
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search resources..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Home + Categories */}
            <button
              onClick={() => {
                onNavigate("home");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left py-3 text-base font-medium text-foreground border-b border-border/30 transition-colors"
            >
              <Layout size={16} className="text-primary" />
              Home
            </button>
            <button
              onClick={() => {
                onNavigate("browse");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left py-3 text-base font-medium text-foreground border-b border-border/30 transition-colors"
            >
              <Package size={16} className="text-primary" />
              All Free Resources
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoryClick(cat.id);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left py-3 text-base text-muted-foreground hover:text-foreground border-b border-border/30 last:border-0 transition-colors"
              >
                <cat.icon size={16} style={{ color: cat.color }} />
                {cat.name}
              </button>
            ))}

            {/* Mobile Theme Selector */}
            <div className="py-3 border-b border-border/30">
              <div className="text-xs font-mono text-muted-foreground mb-2 flex items-center justify-between">
                <span>Theme Mode</span>
                <span className="text-[11px] text-primary font-bold capitalize">
                  {themeMode}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 bg-card p-1.5 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => onThemeChange?.("light")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    themeMode === "light"
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun size={13} /> Light
                </button>
                <button
                  type="button"
                  onClick={() => onThemeChange?.("dark")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    themeMode === "dark"
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon size={13} /> Dark
                </button>
                <button
                  type="button"
                  onClick={() => onThemeChange?.("system")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    themeMode === "system"
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Laptop size={13} /> Auto
                </button>
              </div>
            </div>

            {/* Auth buttons */}
            {authUser ? (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    onNavigate("favorites");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-border text-foreground text-sm font-medium hover:border-primary/40 transition-colors"
                >
                  <Heart size={15} />
                  My Saved Resources
                  {wishlistCount > 0 && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onNavigate("profile");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-border text-foreground text-sm font-medium hover:border-primary/40 transition-colors"
                >
                  <User size={15} /> My Profile & Library
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      onNavigate("admin");
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-bold"
                  >
                    <Settings size={15} />
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full py-3 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    onAuthOpen("register");
                    setMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity text-sm shadow-sm"
                >
                  Get Started — Free
                </button>
                <button
                  onClick={() => {
                    onAuthOpen("login");
                    setMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-full border border-border text-foreground font-medium text-sm hover:border-primary/40 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  </header>
);
}