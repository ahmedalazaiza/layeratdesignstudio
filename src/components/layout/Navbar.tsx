import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Package,
  Settings,
  Layout,
} from "lucide-react";
import type { Page, AuthUser, Category } from "../../types";

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


// ─── Navbar ───────────────────────────────────────────────────────────────────

interface NavbarProps {
    isDark: boolean;
    onToggle: () => void;
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
  }
  
  function Navbar({
    isDark,
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
  }: NavbarProps) {
    const scrollY = useScrollY(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const solid = scrollY > 40 || menuOpen || searchOpen;
  
    const handleSearch = () => {
      if (searchVal.trim()) {
        onSearch(searchVal.trim());
        setSearchOpen(false);
        setSearchVal("");
        setMenuOpen(false);
      }
    };
  
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
      <nav
    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
      solid
        ? "bg-background/90 backdrop-blur-xl border-border"
        : "bg-transparent border-transparent"
    }`}
  >
        <div className="max-w-7xl mx-auto px-4 lg:px-10 flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Logo */}
          <button
            onClick={() => {
              onNavigate("home");
              setMenuOpen(false);
            }}
            className="shrink-0 text-4xl text-foreground hover:opacity-80 transition-opacity leading-none"
            style={{ fontFamily: "'Cookie', cursive" }}
          >
            Layerat<span style={{ color: "#aaff38" }}>.</span>
          </button>
  
          {/* Desktop center nav */}
          <div className="hidden md:flex items-center gap-2 ml-8">
            <button
              onClick={() => onNavigate("home")}
              className={`text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5 relative group ${
                page === "home"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
              <span className="absolute -bottom-0.5 left-3 right-3 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
  
            {categories.map((cat) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryClick(cat.id)}
                  className={`text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5 relative group ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                  <span
                    className={`absolute -bottom-0.5 left-3 right-3 h-px bg-primary transition-transform duration-300 ${
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
                    transition={{ duration: 0.3 }}
                    className="flex items-center overflow-hidden"
                  >
                    <div className="flex items-center border border-border rounded-xl bg-card overflow-hidden w-full">
                      <Search
                        size={14}
                        className="ml-3 text-muted-foreground shrink-0"
                      />
                      <input
                        autoFocus
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Search resources..."
                        className="flex-1 px-3 py-2 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                      />
                      <button
                        onClick={() => setSearchOpen(false)}
                        className="mr-2 p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
                  >
                    <Search size={16} className="text-muted-foreground" />
                  </button>
                )}
              </AnimatePresence>
            </div>
  
            {/* Favorites */}
            <button
              onClick={() => onNavigate("favorites")}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
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
  
            {/* Theme toggle */}
            <button
              onClick={onToggle}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-card hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
            >
              {isDark ? (
                <Sun size={16} className="text-primary" />
              ) : (
                <Moon size={16} className="text-foreground" />
              )}
            </button>
  
            {/* Auth / User */}
            {authUser ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 transition-all duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[80px] truncate">
                    {authUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-muted-foreground transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
  
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {authUser.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {authUser.email}
                        </p>
                      </div>
                      {[
                        {
                          icon: User,
                          label: "Profile",
                          action: () => {
                            onNavigate("profile");
                            setProfileOpen(false);
                          },
                        },
                        {
                          icon: Package,
                          label: "My Library",
                          action: () => {
                            onNavigate("profile");
                            setProfileOpen(false);
                          },
                        },
                        {
                          icon: Settings,
                          label: "Settings",
                          action: () => {
                            onNavigate("profile");
                            setProfileOpen(false);
                          },
                        },
                      ].map(({ icon: Icon, label, action }) => (
                        <button
                          key={label}
                          onClick={action}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                      <div className="border-t border-border">
                        <button
                          onClick={() => {
                            onLogout();
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => onAuthOpen("login")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full border border-border hover:border-primary/30 hover:bg-primary/5"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onAuthOpen("register")}
                  className="text-sm font-semibold px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get Started
                </button>
              </div>
            )}
  
            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center"
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
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onNavigate("browse");
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left py-3 text-base text-muted-foreground hover:text-foreground border-b border-border/30 last:border-0 transition-colors"
                >
                  <cat.icon size={16} style={{ color: cat.color }} />
                  {cat.name}
                </button>
              ))}
  
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
                    My Favorites
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
                    <User size={15} /> My Profile
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign Out
                  </button>
                  {authUser?.role === "admin" && (
                    <button
                      onClick={() => {
                        onNavigate("admin");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 rounded-xl"
                    >
                      <Settings size={15} />
                      Admin Dashboard
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => {
                      onAuthOpen("register");
                      setMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm"
                  >
                    Get Started — It's Free
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
    );
  }
  
  export { Navbar };  