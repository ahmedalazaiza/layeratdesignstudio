"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  CheckCircle,
  Star,
  Download,
  Camera,
  Upload,
  Link2,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  editProfileSchema,
  changePasswordSchema,
  type EditProfileFormData,
  type ChangePasswordFormData,
} from "@/lib/validations/auth";
import { UnverifiedEmailBanner } from "@/components/layout/UnverifiedEmailBanner";
import { EmailVerificationModal } from "@/components/auth/EmailVerificationModal";
import { toast } from "sonner";
import type { User as UserType, Product, Page } from "@/types/api";

export function ProfilePage({
  onProductClick,
  onNavigate,
}: {
  onProductClick?: (p: Product) => void;
  onNavigate?: (page: Page) => void;
}) {
  const {
    authUser,
    updateProfile,
    uploadAvatar,
    changePassword,
    disconnectGoogle,
    logout,
    wishlist,
    toggleWishlist,
    openEmailVerifyModal,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "account" | "library" | "wishlist" | "security"
  >("account");

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [disconnectingGoogle, setDisconnectingGoogle] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 1. Edit Profile Form ──
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile, isSubmitting: isSubmittingProfile },
    reset: resetProfile,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: authUser?.displayName || authUser?.name || "",
      userName: (authUser?.userName || "").toLowerCase(),
      bio: authUser?.bio || "",
      website: authUser?.website || "",
      twitter: authUser?.socialLinks?.twitter || "",
      github: authUser?.socialLinks?.github || "",
      dribbble: authUser?.socialLinks?.dribbble || "",
      figma: authUser?.socialLinks?.figma || "",
      linkedin: authUser?.socialLinks?.linkedin || "",
    },
  });

  const onProfileSubmit = async (data: EditProfileFormData) => {
    try {
      await updateProfile({
        displayName: data.displayName,
        userName: data.userName.toLowerCase().trim(),
        bio: data.bio || undefined,
        website: data.website || undefined,
        socialLinks: {
          twitter: data.twitter || undefined,
          github: data.github || undefined,
          dribbble: data.dribbble || undefined,
          figma: data.figma || undefined,
          linkedin: data.linkedin || undefined,
        },
      });
    } catch {
      // Handled in context toast
    }
  };

  // ── 2. Change Password Form ──
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPasswordForm();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update password";
      toast.error(msg);
    }
  };

  // ── Avatar Upload Handler ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be smaller than 5MB");
      return;
    }

    try {
      setAvatarUploading(true);
      await uploadAvatar(file);
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Disconnect Google ──
  const handleDisconnectGoogle = async () => {
    try {
      setDisconnectingGoogle(true);
      await disconnectGoogle();
    } catch (err: any) {
      toast.error(err?.message || "Failed to disconnect Google");
    } finally {
      setDisconnectingGoogle(false);
    }
  };

  if (!authUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
          <User size={30} />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Sign In Required
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Please sign in to access your Layerat profile, settings, and library.
        </p>
      </div>
    );
  }

  const isVerified = Boolean(
    authUser.isVerified || authUser.isEmailVerified
  );

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-sm";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Email Verification Banner */}
      <UnverifiedEmailBanner authUser={authUser} />
      <EmailVerificationModal />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Profile Hero Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar & Upload Trigger */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-border bg-muted flex items-center justify-center shadow-md">
                {authUser.avatar ? (
                  <img
                    src={authUser.avatar}
                    alt={authUser.displayName || authUser.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-display font-bold text-primary">
                    {(authUser.displayName || authUser.userName || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>

              {/* Camera upload overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer"
                title="Change Avatar"
              >
                {avatarUploading ? (
                  <Loader2 size={20} className="animate-spin text-primary" />
                ) : (
                  <>
                    <Camera size={20} className="mb-1" />
                    <span>Upload</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground truncate">
                  {authUser.displayName || authUser.userName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20 capitalize">
                  {authUser.role || "Designer"}
                </span>
                {isVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={openEmailVerifyModal}
                    className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                  >
                    Unverified · Verify Now
                  </button>
                )}
              </div>

              <p className="text-sm font-mono text-muted-foreground mb-3">
                @{authUser.userName || "username"} · {authUser.email}
              </p>

              {authUser.bio && (
                <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl mb-4">
                  {authUser.bio}
                </p>
              )}

              {/* Stats badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground font-mono">
                <span>
                  Downloads:{" "}
                  <strong className="text-foreground">
                    {authUser.statistics?.totalDownloads || authUser.downloads?.length || 0}
                  </strong>
                </span>
                <span>·</span>
                <span>
                  Wishlist:{" "}
                  <strong className="text-foreground">{wishlist.length}</strong>
                </span>
                {authUser.financialDetails && (
                  <>
                    <span>·</span>
                    <span>
                      Balance:{" "}
                      <strong className="text-emerald-500">
                        ${authUser.financialDetails.balance.toFixed(2)}
                      </strong>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Logout button */}
            <div className="shrink-0 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-2xl border border-border hover:border-destructive/40 text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-medium text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border mb-8 overflow-x-auto pb-px">
          {[
            { id: "account", label: "Edit Profile", icon: User },
            { id: "library", label: "My Downloads", icon: Package },
            { id: "wishlist", label: "Saved Wishlist", icon: Heart },
            { id: "security", label: "Security & Google", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {/* ── TAB 1: EDIT PROFILE ── */}
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl"
            >
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-display font-bold text-foreground mb-1">
                  Public Profile Information
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Update your display name, username, biography, and portfolio links.
                </p>

                <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Display Name */}
                    <div>
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                        Display Name <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        {...registerProfile("displayName")}
                        className={inputClass}
                      />
                      {errorsProfile.displayName && (
                        <p className="text-xs text-destructive mt-1 font-medium">
                          {errorsProfile.displayName.message}
                        </p>
                      )}
                    </div>

                    {/* Username */}
                    <div>
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                        Username <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          {...registerProfile("userName")}
                          className={`${inputClass} font-mono lowercase`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground/40">
                          @
                        </span>
                      </div>
                      {errorsProfile.userName && (
                        <p className="text-xs text-destructive mt-1 font-medium">
                          {errorsProfile.userName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                      Biography
                    </label>
                    <textarea
                      rows={3}
                      {...registerProfile("bio")}
                      placeholder="Senior Product Designer crafting Figma design systems..."
                      className={`${inputClass} resize-none`}
                    />
                    {errorsProfile.bio && (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        {errorsProfile.bio.message}
                      </p>
                    )}
                  </div>

                  {/* Website */}
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                      Website / Portfolio
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        {...registerProfile("website")}
                        placeholder="https://yourportfolio.com"
                        className={inputClass}
                      />
                      <Link2
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                      />
                    </div>
                    {errorsProfile.website && (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        {errorsProfile.website.message}
                      </p>
                    )}
                  </div>

                  {/* Social Links Grid */}
                  <div className="pt-2 border-t border-border/60">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-3 font-medium">
                      Social Profiles
                    </label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-1">Twitter / X</span>
                        <input
                          type="text"
                          {...registerProfile("twitter")}
                          placeholder="@username"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-1">Dribbble</span>
                        <input
                          type="text"
                          {...registerProfile("dribbble")}
                          placeholder="dribbble.com/username"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-1">Figma Profile</span>
                        <input
                          type="text"
                          {...registerProfile("figma")}
                          placeholder="@figma_handle"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-1">LinkedIn</span>
                        <input
                          type="text"
                          {...registerProfile("linkedin")}
                          placeholder="linkedin.com/in/username"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingProfile}
                      className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_25px_rgba(170,255,56,0.25)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmittingProfile ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Profile Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── TAB 2: MY DOWNLOADS / LIBRARY ── */}
          {activeTab === "library" && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-display font-bold text-foreground mb-1">
                  Downloaded Resources & Kits
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Access and re-download all Figma files previously added to your studio account.
                </p>

                {(!authUser.downloads || authUser.downloads.length === 0) ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-2xl p-6">
                    <Package size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-foreground mb-1">
                      No downloads yet
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Explore our 100% free Figma design library and download kits with a single click.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate?.("browse")}
                      className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xs cursor-pointer shadow-sm"
                    >
                      Browse Free Resources
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {authUser.downloads.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl border border-border bg-background flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {typeof item === "string" ? `Product #${item.slice(-6)}` : item.title}
                          </p>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            100% Free · Figma File
                          </span>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold hover:bg-primary/20 transition-colors"
                        >
                          Get File
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TAB 3: WISHLIST ── */}
          {activeTab === "wishlist" && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-display font-bold text-foreground mb-1">
                  Saved Wishlist Items ({wishlist.length})
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Design files and UI kits you've saved for future inspiration and projects.
                </p>

                {wishlist.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-2xl p-6">
                    <Heart size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Your wishlist is empty
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Click the heart icon on any UI kit or design system to save it here.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate?.("browse")}
                      className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xs cursor-pointer shadow-sm"
                    >
                      Explore Library
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((productId, i) => (
                      <div
                        key={productId || i}
                        className="p-4 rounded-2xl border border-border bg-background flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            Item ID: {productId.slice(-8)}
                          </p>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            Saved in studio
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(productId)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TAB 4: SECURITY & GOOGLE ── */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl space-y-8"
            >
              {/* Google Account Link Card */}
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-display font-bold text-foreground mb-1">
                  Connected Accounts
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Manage third-party single sign-on providers linked to your account.
                </p>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-background">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Google Account</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {authUser.googleId || authUser.provider === "google"
                          ? "Connected to " + authUser.email
                          : "Not connected"}
                      </p>
                    </div>
                  </div>

                  {authUser.googleId || authUser.provider === "google" ? (
                    <button
                      type="button"
                      onClick={handleDisconnectGoogle}
                      disabled={disconnectingGoogle}
                      className="px-3.5 py-1.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {disconnectingGoogle ? "Disconnecting..." : "Disconnect"}
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground font-mono">
                      Not Linked
                    </span>
                  )}
                </div>
              </div>

              {/* Change Password Form */}
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-display font-bold text-foreground mb-1">
                  Update Account Password
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Ensure your account is protected with a secure, unique password.
                </p>

                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        {...registerPassword("currentPassword")}
                        placeholder="••••••••"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errorsPassword.currentPassword && (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        {errorsPassword.currentPassword.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        {...registerPassword("newPassword")}
                        placeholder="Min. 6 characters"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errorsPassword.newPassword && (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        {errorsPassword.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        {...registerPassword("confirmPassword")}
                        placeholder="Repeat new password"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errorsPassword.confirmPassword && (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        {errorsPassword.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingPassword}
                      className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_25px_rgba(170,255,56,0.25)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmittingPassword ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default ProfilePage;