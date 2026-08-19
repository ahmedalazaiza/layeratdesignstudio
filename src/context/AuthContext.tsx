"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { getAccessToken, clearAuthTokens, setAuthTokens } from "@/lib/api-client";
import { toast } from "sonner";
import type { User, LoginPayload, RegisterPayload } from "@/types/api";

export type AuthModalMode =
  | "login"
  | "register"
  | "forgot_password"
  | "verify_code"
  | "reset_password";

export interface AuthContextValue {
  authUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  
  // Auth modal control
  authModal: {
    isOpen: boolean;
    mode: AuthModalMode;
  };
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;

  // Email verification modal control
  emailVerifyModal: {
    isOpen: boolean;
  };
  openEmailVerifyModal: () => void;
  closeEmailVerifyModal: () => void;

  // Auth operations
  login: (payload: LoginPayload) => Promise<{ user: User }>;
  signup: (payload: RegisterPayload) => Promise<{ user: User }>;
  googleLogin: (credential: string) => Promise<{ user: User; isNewUser?: boolean }>;
  logout: () => void;
  updateProfile: (payload: Partial<User>) => Promise<User>;
  uploadAvatar: (file: File) => Promise<{ avatarUrl: string }>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
  disconnectGoogle: () => Promise<void>;
  requestEmailVerification: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  refetchUser: () => Promise<any>;
  refreshUserProfile: () => Promise<any>;
  signOut: () => void;
  showSetNewPasswordModal: boolean;
  setShowSetNewPasswordModal: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [tokenPresent, setTokenPresent] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Track token existence in cookies on mount and storage events
  useEffect(() => {
    const token = getAccessToken();
    setTokenPresent(Boolean(token));
  }, []);

  // Modal states
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: AuthModalMode;
  }>({
    isOpen: false,
    mode: "login",
  });

  const [emailVerifyModal, setEmailVerifyModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  });

  const openAuthModal = useCallback((mode: AuthModalMode = "login") => {
    setAuthModal({ isOpen: true, mode });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setAuthModalMode = useCallback((mode: AuthModalMode) => {
    setAuthModal((prev) => ({ ...prev, mode }));
  }, []);

  const openEmailVerifyModal = useCallback(() => {
    setEmailVerifyModal({ isOpen: true });
  }, []);

  const closeEmailVerifyModal = useCallback(() => {
    setEmailVerifyModal({ isOpen: false });
  }, []);

  // ─── Query Current User ───
  const {
    data: authUser = null,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null>({
    queryKey: ["authUser"],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) return null;
      try {
        const profile = await userService.getProfile();
        return profile;
      } catch (err: any) {
        if (err?.response?.status === 401) {
          clearAuthTokens();
          setTokenPresent(false);
        }
        return null;
      }
    },
    enabled: tokenPresent,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Sync wishlist from user profile or localStorage
  useEffect(() => {
    if (authUser) {
      const userWishlist = authUser.favoriteList || authUser.wishlist || [];
      setWishlist(userWishlist);
      try {
        const key = `layerat_wishlist_${authUser._id || authUser.id}`;
        localStorage.setItem(key, JSON.stringify(userWishlist));
      } catch {}
    } else {
      try {
        const guestWl = localStorage.getItem("layerat_guest_wishlist");
        if (guestWl) setWishlist(JSON.parse(guestWl));
      } catch {}
    }
  }, [authUser]);

  // ─── Login Mutation ───
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setTokenPresent(true);
      queryClient.setQueryData(["authUser"], data.user);
      closeAuthModal();
      toast.success(`Welcome back, ${data.user.displayName || data.user.userName}!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Invalid credentials";
      toast.error(msg);
    },
  });

  // ─── Signup Mutation ───
  const signupMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.signup(payload),
    onSuccess: (data) => {
      setTokenPresent(true);
      queryClient.setQueryData(["authUser"], data.user);
      closeAuthModal();
      toast.success(`Account created successfully! Welcome to Layerat Studio.`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to create account";
      toast.error(msg);
    },
  });

  // ─── Google OAuth Mutation ───
  const googleLoginMutation = useMutation({
    mutationFn: (credential: string) => authService.googleLogin(credential),
    onSuccess: (data) => {
      setTokenPresent(true);
      queryClient.setQueryData(["authUser"], data.user);
      closeAuthModal();
      if (data.isNewUser) {
        toast.success(`Welcome to Layerat Studio, ${data.user.displayName || data.user.userName}!`);
      } else {
        toast.success(`Signed in with Google as ${data.user.displayName || data.user.email}!`);
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Google sign-in failed";
      toast.error(msg);
    },
  });

  // ─── Logout ───
  const logout = useCallback(() => {
    authService.logout();
    setTokenPresent(false);
    queryClient.setQueryData(["authUser"], null);
    queryClient.removeQueries({ queryKey: ["authUser"] });
    toast.success("Signed out successfully");
  }, [queryClient]);

  // ─── Update Profile Mutation ───
  const updateProfileMutation = useMutation({
    mutationFn: (payload: Partial<User>) => userService.updateProfile(payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["authUser"], (old: User | null) => ({
        ...old,
        ...updatedUser,
      }));
      toast.success("Profile updated successfully!");
    },
  });

  // ─── Avatar Upload Mutation ───
  const avatarUploadMutation = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], (old: User | null) => {
        if (!old) return old;
        return {
          ...old,
          avatar: data.avatarUrl,
        };
      });
      toast.success("Avatar updated successfully!");
    },
  });

  // ─── Change Password ───
  const changePassword = useCallback(
    async (payload: { currentPassword: string; newPassword: string }) => {
      await authService.changePassword(payload);
      toast.success("Password changed successfully!");
    },
    []
  );

  // ─── Disconnect Google ───
  const disconnectGoogle = useCallback(async () => {
    await authService.disconnectGoogle();
    await refetchUser();
    toast.success("Google account disconnected.");
  }, [refetchUser]);

  // ─── Email Verification ───
  const requestEmailVerification = useCallback(async () => {
    await userService.requestEmailVerification();
    toast.success("Verification code sent to your email!");
  }, []);

  const verifyEmail = useCallback(
    async (code: string) => {
      const data = await userService.verifyEmailCode(code);
      if (data.user) {
        queryClient.setQueryData(["authUser"], data.user);
      } else {
        await refetchUser();
      }
      closeEmailVerifyModal();
      toast.success("Email verified successfully!");
    },
    [queryClient, refetchUser, closeEmailVerifyModal]
  );

  // ─── Wishlist Toggle ───
  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!tokenPresent || !authUser) {
        openAuthModal("login");
        toast.info("Please sign in to save items to your studio library.");
        return;
      }

      const exists = wishlist.includes(productId);
      const updated = exists
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];

      setWishlist(updated);

      // Save to localStorage
      try {
        const key = `layerat_wishlist_${authUser._id || authUser.id}`;
        localStorage.setItem(key, JSON.stringify(updated));
      } catch {}

      if (exists) {
        toast.success("Removed from wishlist");
      } else {
        toast.success("Saved to your studio wishlist!");
      }
    },
    [tokenPresent, authUser, wishlist, openAuthModal]
  );

  return (
    <AuthContext.Provider
      value={{
        authUser,
        isLoading,
        isAuthenticated: Boolean(tokenPresent && authUser),
        wishlist,
        toggleWishlist,
        authModal,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        emailVerifyModal,
        openEmailVerifyModal,
        closeEmailVerifyModal,
        login: (payload) => loginMutation.mutateAsync(payload),
        signup: (payload) => signupMutation.mutateAsync(payload),
        googleLogin: (credential) => googleLoginMutation.mutateAsync(credential),
        logout,
        updateProfile: (payload) => updateProfileMutation.mutateAsync(payload),
        uploadAvatar: (file) => avatarUploadMutation.mutateAsync(file),
        changePassword,
        disconnectGoogle,
        requestEmailVerification,
        verifyEmail,
        refetchUser,
        refreshUserProfile: refetchUser,
        signOut: logout,
        showSetNewPasswordModal: false,
        setShowSetNewPasswordModal: () => {},
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
