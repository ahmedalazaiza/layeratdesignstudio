"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  Heart,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Layout,
  Settings,
  Package,
  ArrowRight,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { UnverifiedEmailBanner } from "./UnverifiedEmailBanner";
import { LayeratLogo } from "../brand/LayeratLogo";
import { CategoryMegaMenu } from "./CategoryMegaMenu";
import { NotificationCenter } from "./NotificationCenter";
import type { Page, User, Category } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";

export type ThemeMode = "light" | "dark" | "system";

function useScrollY(enabled: boolean = true) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setScrollY(0);
      return;
    }

    let ticking = false;
    const getScroll = () =>
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(getScroll());
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

export interface NavbarProps {
  isDark?: boolean;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
  onToggle?: () => void;
  page?: Page;
  onNavigate?: (p: Page) => void;
  authUser?: User | null;
  onAuthOpen?: (mode: "login" | "register" | "forgot_password") => void;
  onLogout?: () => void;
  onSearch?: (q: string) => void;
  wishlistCount?: number;
  categories?: Category[];
  onCategoryClick?: (categoryId: string, subcategoryId?: string | null) => void;
  activeCategoryId?: string | null;
  onVerificationSuccess?: () => void;
}

export function Navbar({
  isDark: propIsDark,
  themeMode = "system",
  onThemeChange,
  onToggle,
  page,
  onNavigate,
  authUser: propAuthUser,
  onAuthOpen: propOnAuthOpen,
  onLogout: propOnLogout,
  onSearch,
  wishlistCount: propWishlistCount,
  categories = [],
  onCategoryClick,
  activeCategoryId = null,
  onVerificationSuccess,
}: NavbarProps) {
  const auth = useAuth();
  const authUser = propAuthUser !== undefined ? propAuthUser : auth.authUser;
  const onAuthOpen = propOnAuthOpen || auth.openAuthModal;
  const onLogout = propOnLogout || auth.logout;
  const wishlistCount =
    propWishlistCount !== undefined ? propWishlistCount : auth.wishlist.length;

  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const scrollY = useScrollY(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guestThemeOpen, setGuestThemeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [activeMegaMenuId, setActiveMegaMenuId] = useState<string | null>(null);
  const [mobileExpandedCats, setMobileExpandedCats] = useState<string[]>([]);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === "dark" || Boolean(propIsDark);
  const isSolid =
    scrollY > 5 ||
    pathname !== "/" ||
    menuOpen ||
    searchOpen ||
    activeMegaMenuId !== null;

  const handleMouseEnterCategory = (catId: string) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setActiveMegaMenuId(catId);
  };

  const handleMouseLeaveCategory = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenuId(null);
    }, 160);
  };

  const isAdmin =
    authUser &&
    (authUser.role === "admin" ||
      authUser.email?.toLowerCase().trim() === "ahmedazy.uxui@gmail.com");

  const handleSearch = () => {
    if (searchVal.trim()) {
      if (onSearch) {
        onSearch(searchVal.trim());
      } else {
        router.push(`/browse?search=${encodeURIComponent(searchVal.trim())}`);
      }
      setSearchOpen(false);
      setSearchVal("");
      setMenuOpen(false);
      setActiveMegaMenuId(null);
    }
  };

  // Close profile dropdown & mega menu on outside click or ESC key
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
        setActiveMegaMenuId(null);
      }
    };

    if (profileOpen || searchOpen || menuOpen || activeMegaMenuId) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen, searchOpen, menuOpen, activeMegaMenuId]);

  // Initials fallback for user avatar
  const initials = authUser
    ? (authUser.displayName || authUser.userName || "User")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const isHomeActive = pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-auto">
      {/* Unverified Email Top Banner */}
      <UnverifiedEmailBanner
        authUser={authUser}
        onVerificationSuccess={onVerificationSuccess}
      />

      <nav
        className={`w-full transition-all duration-300 ${
          isSolid
            ? "bg-background/95 backdrop-blur-xl border-b border-border/80 shadow-md shadow-black/5"
            : "bg-background/40 backdrop-blur-md border-b border-border/20"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Logo & Category Mega Menus */}
          <div className="flex items-center gap-4 lg:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
            >
              <LayeratLogo height={32} className="h-8 w-auto" />
            </Link>

            {/* Desktop Navigation Links & Mega Menus */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isHomeActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                Home
              </Link>

              {/* Categories Navigation with Dropdowns */}
              {categories.slice(0, 4).map((cat) => {
                const catId = cat._id || cat.id || cat.slug;
                const isActive = activeCategoryId === catId;
                const isMegaOpen = activeMegaMenuId === catId;

                return (
                  <div
                    key={catId}
                    className="relative"
                    onMouseEnter={() => handleMouseEnterCategory(catId)}
                    onMouseLeave={handleMouseLeaveCategory}
                  >
                    <Link
                      href={`/browse?category=${encodeURIComponent(cat.slug || catId)}`}
                      onClick={() => {
                        if (onCategoryClick) onCategoryClick(catId, null);
                        setActiveMegaMenuId(null);
                      }}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive || isMegaOpen
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          isMegaOpen ? "rotate-180 text-primary" : "opacity-60"
                        }`}
                      />
                    </Link>

                    {/* Mega Menu Dropdown */}
                    <div className="absolute top-full left-0 pt-2 z-50">
                      <CategoryMegaMenu
                        category={cat}
                        isOpen={isMegaOpen}
                        onClose={() => setActiveMegaMenuId(null)}
                        onMouseEnter={() => handleMouseEnterCategory(catId)}
                        onMouseLeave={handleMouseLeaveCategory}
                        onSelectCategory={(cId, subId) => {
                          if (onCategoryClick) {
                            onCategoryClick(cId, subId);
                          } else {
                            const url = subId
                              ? `/browse?category=${encodeURIComponent(cId)}&subcategory=${encodeURIComponent(subId)}`
                              : `/browse?category=${encodeURIComponent(cId)}`;
                            router.push(url);
                          }
                          setActiveMegaMenuId(null);
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <Link
                href="/browse"
                className={`px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  pathname === "/browse" && !activeCategoryId
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                Browse All
              </Link>
            </div>
          </div>

          {/* Right Actions: Search, Wishlist, NotificationCenter, Theme, Auth Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input Bar (Desktop) */}
            <div className="hidden md:flex items-center relative w-44 lg:w-60">
              <input
                type="text"
                placeholder="Search UI kits, icons..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full h-9 pl-9 pr-8 text-xs bg-muted/60 hover:bg-muted/80 focus:bg-background border border-border/70 rounded-full outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
              />
              <Search
                size={14}
                className="absolute left-3 text-muted-foreground pointer-events-none"
              />
              {searchVal && (
                <button
                  onClick={() => setSearchVal("")}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <Search size={16} />
            </button>

            {/* Notification Center */}
            <NotificationCenter
              onNavigate={(p) => {
                if (onNavigate) onNavigate(p);
                else router.push(`/${p === "home" ? "" : p}`);
              }}
              isDark={isDark}
            />

            {/* Favorites / Wishlist */}
            <Link
              href="/favorites"
              aria-label="Favorites"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all relative"
            >
              <Heart size={16} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle Dropdown */}
            <div className="relative">
              <button
                onClick={() => setGuestThemeOpen(!guestThemeOpen)}
                aria-label="Toggle theme"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                {theme === "dark" ? (
                  <Moon size={16} />
                ) : theme === "light" ? (
                  <Sun size={16} />
                ) : (
                  <Laptop size={16} />
                )}
              </button>

              <AnimatePresence>
                {guestThemeOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 mt-2 w-32 p-1 rounded-2xl bg-card border border-border shadow-xl z-50 text-xs font-medium"
                  >
                    {[
                      { mode: "light", label: "Light", icon: Sun },
                      { mode: "dark", label: "Dark", icon: Moon },
                      { mode: "system", label: "System", icon: Laptop },
                    ].map(({ mode, label, icon: Icon }) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setTheme(mode);
                          if (onThemeChange) onThemeChange(mode as ThemeMode);
                          setGuestThemeOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${
                          theme === mode
                            ? "bg-primary text-primary-foreground font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon size={14} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile / Auth Action Buttons */}
            {authUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-full border border-border bg-card hover:border-primary/50 transition-all cursor-pointer"
                >
                  {authUser.avatar ? (
                    <img
                      src={authUser.avatar}
                      alt={authUser.displayName || authUser.userName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                      {initials || <UserIcon size={14} />}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-bold text-foreground max-w-[90px] truncate">
                    {authUser.displayName || authUser.userName}
                  </span>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-card border border-border shadow-2xl z-50 text-xs"
                    >
                      <div className="p-2 border-b border-border mb-1">
                        <p className="font-bold text-foreground truncate">
                          {authUser.displayName || authUser.userName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {authUser.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                          {authUser.role.toUpperCase()}
                        </span>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <UserIcon size={14} />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/favorites"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Heart size={14} />
                        <span>Saved Kits</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-primary font-bold hover:bg-primary/10 transition-colors"
                        >
                          <ShieldCheck size={14} />
                          <span>Admin Studio</span>
                        </Link>
                      )}

                      <div className="pt-1 mt-1 border-t border-border">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            if (onLogout) onLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAuthOpen?.("login")}
                  className="px-3.5 py-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onAuthOpen?.("register")}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                >
                  <span>Join Free</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open mobile menu"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card text-foreground"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden px-4 pb-3 pt-1 border-t border-border/40 bg-card"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search 100+ free Figma kits..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full h-10 pl-10 pr-10 text-xs bg-muted/60 border border-border rounded-full outline-none focus:border-primary text-foreground"
                  autoFocus
                />
                <Search
                  size={15}
                  className="absolute left-3.5 top-3 text-muted-foreground"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2.5 top-2 px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-bold"
                >
                  Search
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Slide-down Sidebar */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-card/98 backdrop-blur-2xl px-6 py-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-foreground hover:bg-muted"
                >
                  Home
                </Link>
                <Link
                  href="/browse"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-foreground hover:bg-muted"
                >
                  Browse All Kits
                </Link>
              </div>

              {/* Categories Accordion */}
              <div className="pt-2 border-t border-border">
                <p className="px-4 text-[11px] font-mono font-bold uppercase text-muted-foreground mb-2">
                  Categories
                </p>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const catId = cat._id || cat.id || cat.slug;
                    return (
                      <Link
                        key={catId}
                        href={`/browse?category=${encodeURIComponent(cat.slug || catId)}`}
                        onClick={() => {
                          if (onCategoryClick) onCategoryClick(catId, null);
                          setMenuOpen(false);
                        }}
                        className="flex items-center justify-between px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <span>{cat.name}</span>
                        <ArrowRight size={12} className="opacity-40" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Auth Button */}
              {!authUser && (
                <div className="pt-4 border-t border-border flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onAuthOpen?.("login");
                    }}
                    className="w-full py-2.5 rounded-full border border-border font-bold text-xs text-foreground text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onAuthOpen?.("register");
                    }}
                    className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-xs text-center"
                  >
                    Join Free Community
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

export default Navbar;