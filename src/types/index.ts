import type { User, SubCategory } from "./api";

export * from "./api";

// ─── UI & Client State Types ───

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

export interface BrowseFilters {
  query: string;
  categoryId: string | null;
  subcategoryId: string | null;
  isFree: boolean | null;
  sortBy: "newest" | "downloads" | "rating" | "alphabetical";
  tag?: string | null;
  minPrice?: number;
  maxPrice?: number;
}

// ─── Compatibility Aliases for Existing UI Components ───

export type Subcategory = SubCategory;

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  userName?: string;
  displayName?: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  role: "user" | "publisher" | "admin" | "creator";
  purchases?: string[];
  wishlist?: string[];
  downloads?: string[];
  createdAt: string;
  updatedAt?: string;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  provider?: string;
}

export interface ProductReview {
  id: string;
  _id?: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  reviewText: string;
  title?: string;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}