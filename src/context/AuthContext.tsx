import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import type { AuthUser } from "../types";

export interface AuthContextValue {
  authUser: AuthUser | null;
  loading: boolean;
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  authModal: {
    isOpen: boolean;
    mode: "login" | "register" | "forgot_password";
  };
  openAuthModal: (mode?: "login" | "register" | "forgot_password") => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: "login" | "register" | "forgot_password") => void;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  showSetNewPasswordModal: boolean;
  setShowSetNewPasswordModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_EMAILS = ["ahmedazy.uxui@gmail.com", "admin@layerat.com"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showSetNewPasswordModal, setShowSetNewPasswordModal] = useState(false);

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "login" | "register" | "forgot_password";
  }>({
    isOpen: false,
    mode: "login",
  });

  const openAuthModal = useCallback((mode: "login" | "register" | "forgot_password" = "login") => {
    setAuthModal({ isOpen: true, mode });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setAuthModalMode = useCallback((mode: "login" | "register" | "forgot_password") => {
    setAuthModal((prev) => ({ ...prev, mode }));
  }, []);

  // Sync profile from Supabase profiles table
  const syncProfile = useCallback(async (sessionUser: any) => {
    if (!sessionUser) {
      setAuthUser(null);
      return;
    }

    try {
      const email = sessionUser.email || "";
      const isConfiguredAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      const userRole: "user" | "creator" | "admin" =
        isConfiguredAdmin || profile?.role === "admin"
          ? "admin"
          : profile?.role === "creator"
          ? "creator"
          : "user";

      const user: AuthUser = {
        id: sessionUser.id,
        email,
        name: profile?.name || sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || email.split("@")[0],
        avatar: profile?.avatar_url || sessionUser.user_metadata?.avatar_url || undefined,
        role: userRole,
        provider: sessionUser.app_metadata?.provider || "email",
        createdAt: profile?.created_at || sessionUser.created_at,
        isEmailVerified: sessionUser.email_confirmed_at != null || sessionUser.app_metadata?.provider === "google",
      };

      setAuthUser(user);

      // Load user's wishlist (localStorage first for instant response + graceful DB sync)
      try {
        const localKey = `layerat_wishlist_${sessionUser.id}`;
        let localWl: string[] = [];
        try {
          const saved = localStorage.getItem(localKey);
          if (saved) localWl = JSON.parse(saved);
        } catch {}

        if (profile?.wishlist && Array.isArray(profile.wishlist)) {
          localWl = Array.from(new Set([...localWl, ...profile.wishlist]));
        }

        setWishlist(localWl);

        // Graceful DB check (only if table exists)
        try {
          const { data: wlData, error: wlError } = await supabase
            .from("wishlists")
            .select("product_id")
            .eq("user_id", sessionUser.id);

          if (!wlError && wlData && wlData.length > 0) {
            const dbIds = wlData.map((w: any) => w.product_id);
            const merged = Array.from(new Set([...localWl, ...dbIds]));
            setWishlist(merged);
            localStorage.setItem(localKey, JSON.stringify(merged));
          }
        } catch {}
      } catch (err) {
        console.warn("Profile sync notice:", err);
      }
    } catch (err) {
      console.warn("Profile sync notice:", err);
    }
  }, []);

  // Initialize auth session
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          await syncProfile(session.user);
        }
      } catch (err) {
        console.warn("Auth initialization notice:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowSetNewPasswordModal(true);
      }

      if (session?.user) {
        await syncProfile(session.user);
      } else {
        setAuthUser(null);
        setWishlist([]);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [syncProfile]);

  // Toggle wishlist item
  const toggleWishlist = useCallback(async (productId: string) => {
    if (!authUser) {
      openAuthModal("login");
      toast.info("Please sign in to save items to your wishlist", {
        description: "Your saved collection will sync across all your devices.",
      });
      return;
    }

    const exists = wishlist.includes(productId);
    const updated = exists
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    setWishlist(updated);

    // Save to localStorage immediately
    try {
      localStorage.setItem(`layerat_wishlist_${authUser.id}`, JSON.stringify(updated));
    } catch {}

    if (exists) {
      toast.success("Removed from wishlist");
    } else {
      toast.success("Added to your wishlist", {
        description: "View all your saved UI kits in the Favorites tab.",
      });
    }

    // Attempt DB sync in background
    try {
      if (exists) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", authUser.id)
          .eq("product_id", productId);
      } else {
        await supabase
          .from("wishlists")
          .insert({ user_id: authUser.id, product_id: productId });
      }
    } catch {}
  }, [authUser, wishlist, openAuthModal]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setAuthUser(null);
      setWishlist([]);
      toast.success("Signed out successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign out");
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await syncProfile(session.user);
    }
  }, [syncProfile]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        loading,
        wishlist,
        toggleWishlist,
        authModal,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        signOut,
        refreshUserProfile,
        showSetNewPasswordModal,
        setShowSetNewPasswordModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
