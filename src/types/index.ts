import type { ElementType } from "react";

export type Page =
  | "home"
  | "browse"
  | "product"
  | "profile"
  | "publisher"
  | "team"
  | "about"
  | "terms"
  | "privacy"
  | "favorites"
  | "admin";

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: ElementType;
  color: string;
  subcategories: Subcategory[];
}

export interface ProductSpecifications {
  fileSize: string;
  format: string[];
  screens: number;
  components: number;
  version: string;
  compatibility: string[];
  supportsVariables: boolean;
  supportsAutoLayout: boolean;
  supportsLightDark: boolean;
}

export interface ProductLicense {
  type: "personal" | "commercial";
  allowCommercial: boolean;
  allowUnlimitedProjects: boolean;
  attributionRequired: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  discountPrice?: number;
  currency?: string;
  isFree: boolean;
  thumbnail: string;
  galleryImages?: string[];
  figmaPreviewUrl?: string;
  categoryId: string;
  subcategoryId?: string;
  tags?: string[];
  fileSize?: string;
  formats?: string[];
  screensCount?: number;
  componentsCount?: number;
  version?: string;
  supportsVariables?: boolean;
  supportsAutoLayout?: boolean;
  supportsLightDark?: boolean;
  licenseType?: "personal" | "commercial";
  downloadsCount?: number;
  viewsCount?: number;
  rating: number;
  reviewsCount?: number;
  downloadFileUrl?: string;

  // Compatibility fields
  downloads?: number;
  views?: number;
  featured?: boolean;
  isFeatured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
  specifications?: ProductSpecifications;
  license?: ProductLicense;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  role: "user" | "creator" | "admin";
  purchases?: string[];
  wishlist?: string[];
  createdAt: string;
  isVerified?: boolean;
  provider?: string;
  isEmailVerified?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BrowseFilters {
  query: string;
  categoryId: string | null;
  subcategoryId: string | null;
  isFree: boolean | null;
  sortBy: "newest" | "downloads" | "rating" | "alphabetical";
}