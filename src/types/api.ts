// ─── Postman API Standard Contract & Domain Models ───

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

export interface ApiResponse<T = any> {
  statusCode: number;
  status: "success" | "error" | "fail" | string;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

// ─── User Model ───

export type UserRole = "user" | "publisher" | "admin";

export interface UserFinancialDetails {
  balance: number;
  totalEarnings: number;
  pendingEarnings: number;
  payoutMethod?: "bank_transfer" | "paypal" | "stripe" | string;
  payoutDetails?: {
    accountNumber?: string;
    routingNumber?: string;
    paypalEmail?: string;
    accountHolderName?: string;
    bankName?: string;
    iban?: string;
    swift?: string;
    [key: string]: any;
  };
}

export interface UserStatistics {
  totalDownloads: number;
  totalViews: number;
  totalProducts: number;
  totalSales?: number;
  averageRating?: number;
  totalFavorites?: number;
}

export interface User {
  _id?: string;
  id?: string;
  userName?: string;
  displayName?: string;
  name?: string;
  email: string;
  avatar?: string;
  role: UserRole | string;
  isEmailVerified?: boolean;
  financialDetails?: UserFinancialDetails;
  statistics?: UserStatistics;
  provider?: "local" | "google" | "github" | string;
  googleId?: string;
  githubId?: string;
  favoriteList?: string[];
  downloads?: string[];
  purchases?: string[];
  wishlist?: string[];
  bio?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    dribbble?: string;
    figma?: string;
    linkedin?: string;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Category & Taxonomy Models ───

export interface SubCategory {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  category?: string | Category;
  description?: string;
  productCount?: number;
  icon?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: any;
  color?: string;
  subcategories?: SubCategory[];
  productCount?: number;
  featured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Product Models ───

export type ProductStatus = "unpublished" | "published" | "draft" | "archived";

export interface ProductSpecifications {
  fileSize?: string;
  format?: string[];
  screens?: number;
  components?: number;
  version?: string;
  compatibility?: string[];
  supportsVariables?: boolean;
  supportsAutoLayout?: boolean;
  supportsLightDark?: boolean;
  figmaCompatible?: boolean;
  [key: string]: any;
}

export interface ProductLicense {
  type: "personal" | "commercial" | "extended";
  allowCommercial?: boolean;
  allowUnlimitedProjects?: boolean;
  attributionRequired?: boolean;
  description?: string;
}

export interface Product {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  publisher?: User | string;
  category?: Category | string;
  subCategory?: SubCategory | string;
  tags?: (Tag | string)[];
  price?: number;
  discountPrice?: number;
  currency?: string;
  isFree?: boolean;
  previewImages?: string[];
  thumbnail?: string;
  overview?: string;
  highlights?: string[];
  includedFiles?: string[];
  fileSize?: string;
  version?: string;
  status?: ProductStatus;
  views?: number;
  downloads?: number;
  rating?: number;
  reviewsCount?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  license?: ProductLicense;
  specifications?: ProductSpecifications;
  figmaPreviewUrl?: string;
  downloadUrl?: string;
  fileKey?: string;
  createdAt?: string;
  updatedAt?: string;

  // Compatibility fields for legacy and UI components
  downloadsCount?: number;
  viewsCount?: number;
  screensCount?: number;
  componentsCount?: number;
  formats?: string[];
  shortDescription?: string;
  fullDescription?: string;
  galleryImages?: string[];
  downloadFileUrl?: string;
  categoryId?: string;
  subcategoryId?: string;
  licenseType?: "personal" | "commercial";
  featured?: boolean;
  trending?: boolean;
  supportsVariables?: boolean;
  supportsAutoLayout?: boolean;
  supportsLightDark?: boolean;
}

// ─── Publisher Request Model ───

export type PublisherRequestStatus = "pending" | "approved" | "rejected";

export interface PublisherRequest {
  _id: string;
  id?: string;
  userId: string | User;
  user?: User;
  portfolioUrl: string;
  experience: string;
  sampleWork?: string[];
  motivation?: string;
  status: PublisherRequestStatus;
  reviewNotes?: string;
  reviewedBy?: string | User;
  submittedAt: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Review Model ───

export interface Review {
  _id?: string;
  id?: string;
  productId: string | Product;
  userId?: string | User;
  userName?: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment?: string;
  reviewText?: string;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  createdAt: string;
  updatedAt?: string;
}

// ─── Auth Tokens & Payloads ───

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
  code?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  userName: string;
  displayName?: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  userName?: string;
  bio?: string;
  website?: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    dribbble?: string;
    figma?: string;
    linkedin?: string;
  };
}
