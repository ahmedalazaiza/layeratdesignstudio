import type { ElementType } from "react";

export type Page =
  | "home"
  | "browse"
  | "product"
  | "profile"
  | "publisher"
  | "team"
  | "about"
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

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  discountPrice?: number;
  currency: string;
  isFree: boolean;
  thumbnail: string;
  galleryImages: string[];
  figmaPreviewUrl?: string;
  categoryId: string;
  subcategoryId: string;
  tags: string[];
  fileSize: string;
  formats: string[];
  screensCount: number;
  componentsCount: number;
  version: string;
  supportsVariables: boolean;
  supportsAutoLayout: boolean;
  supportsLightDark: boolean;
  licenseType: "personal" | "commercial";
  downloadsCount: number;
  viewsCount: number;
  rating: number;
  reviewsCount: number;
  downloadFileUrl: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  role: "user" | "creator" | "admin";
  purchases: string[];
  wishlist: string[];
  createdAt: string;
}

export interface BrowseFilters {
  query: string;
  categoryId: string | null;
  subcategoryId: string | null;
  isFree: boolean | null;
  sortBy: "newest" | "downloads" | "rating" | "price-asc" | "price-desc";
}