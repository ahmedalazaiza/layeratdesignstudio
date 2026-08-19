"use client";

import React, { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  User,
  Package,
  Sparkles,
  ExternalLink,
  Download,
  Eye,
  Star,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { userService } from "@/services/userService";
import { ProductCard } from "@/components/product/ProductCard";
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from "@/data/fallbackData";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@/types/api";

function PublicProfileContent() {
  const params = useParams();
  const router = useRouter();
  const idOrUserName = params?.idOrUserName as string;
  const { authUser, toggleWishlist, openAuthModal, wishlist } = useAuth();

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<UserType>({
    queryKey: ["publicProfile", idOrUserName],
    queryFn: async () => {
      try {
        return await userService.getPublicProfile(idOrUserName);
      } catch {
        // Mock / Fallback public creator profile for preview
        return {
          _id: "creator-001",
          userName: idOrUserName || "layerat_creator",
          displayName: idOrUserName ? idOrUserName.replace(/[-_]/g, " ").toUpperCase() : "Layerat Design Studio",
          email: "creator@layerat.com",
          role: "publisher",
          isEmailVerified: true,
          bio: "Official Layerat design studio verified creator. Crafting high-converting design systems, SaaS dashboards, and mobile UI kits.",
          website: "https://layerat.com",
          socialLinks: {
            twitter: "layerat",
            figma: "layerat",
            dribbble: "layerat",
          },
          statistics: {
            totalDownloads: 4820,
            totalViews: 32400,
            totalProducts: 8,
            averageRating: 4.9,
          },
          favoriteList: [],
          downloads: [],
        };
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center font-mono text-muted-foreground">
        Loading creator profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Creator Not Found
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          The requested creator profile could not be found.
        </p>
        <button
          onClick={() => router.push("/browse")}
          className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-xs cursor-pointer"
        >
          Browse Free Resources
        </button>
      </div>
    );
  }

  const creatorProducts = FALLBACK_PRODUCTS.slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Creator Hero Banner */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-border bg-muted flex items-center justify-center shadow-md shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.displayName || profile.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-display font-bold text-primary">
                  {(profile.displayName || profile.userName || "C")[0].toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                  {profile.displayName || profile.userName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20 capitalize">
                  {profile.role || "Verified Publisher"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Verified Creator
                </span>
              </div>

              <p className="text-sm font-mono text-muted-foreground mb-3">
                @{profile.userName}
              </p>

              {profile.bio && (
                <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl mb-4">
                  {profile.bio}
                </p>
              )}

              {/* Creator Links & Metrics */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 border-t border-border/50 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Download size={13} className="text-primary" />
                  <strong>{profile.statistics?.totalDownloads || 1200}+</strong> Downloads
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-primary fill-primary" />
                  <strong>{profile.statistics?.averageRating || 4.9}</strong> Rating
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Package size={13} />
                  <strong>{profile.statistics?.totalProducts || 6}</strong> Resources
                </span>

                {profile.website && (
                  <>
                    <span>·</span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Globe size={13} />
                      Portfolio
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Creator's Published Works */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">
                Published Design Kits & Systems
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Free resources published by @{profile.userName}
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {creatorProducts.length} Files
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creatorProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onProductClick={(p) => router.push(`/product/${p.slug || p.id}`)}
                authUser={authUser}
                onWishlistToggle={toggleWishlist}
                onAuthOpen={openAuthModal}
                categories={FALLBACK_CATEGORIES}
                wishlist={wishlist}
                isWishlisted={wishlist.includes(prod.id || prod._id || "")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading creator profile...
        </div>
      }
    >
      <PublicProfileContent />
    </Suspense>
  );
}
