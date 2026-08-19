import { apiClient } from "@/lib/api-client";
import { FALLBACK_PRODUCTS } from "@/data/fallbackData";
import type {
  Product,
  ProductQueryParams,
  ProductDownloadResponse,
  RateProductPayload,
  ApiResponse,
  PaginationMeta,
} from "@/types/api";

export interface ProductsResponse {
  products: Product[];
  meta?: PaginationMeta;
}

export const productService = {
  /**
   * Fetches paginated products with filters (search, category, subCategory, tag, sort)
   * GET /api/product/
   */
  async getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<Product[] | { products: Product[]; meta?: PaginationMeta }>>(
        "/api/product/",
        { params }
      );

      const data = response.data.data;

      if (Array.isArray(data)) {
        return {
          products: data.map(formatProductItem),
          meta: response.data.meta,
        };
      }

      if (data && typeof data === "object" && "products" in data) {
        return {
          products: ((data as any).products || []).map(formatProductItem),
          meta: (data as any).meta || response.data.meta,
        };
      }

      return {
        products: FALLBACK_PRODUCTS,
      };
    } catch (err) {
      console.warn("Product service note: using fallback products", err);
      let filtered = [...FALLBACK_PRODUCTS];

      if (params?.query) {
        const q = params.query.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.shortDescription?.toLowerCase().includes(q) ||
            p.overview?.toLowerCase().includes(q) ||
            p.tags?.some((t) => (typeof t === "string" ? t.toLowerCase().includes(q) : t.name.toLowerCase().includes(q)))
        );
      }

      if (params?.category) {
        filtered = filtered.filter(
          (p) =>
            p.categoryId === params.category ||
            (typeof p.category === "object" && (p.category?.slug === params.category || p.category?._id === params.category)) ||
            (typeof p.category === "string" && p.category === params.category)
        );
      }

      if (params?.subCategory) {
        filtered = filtered.filter(
          (p) =>
            p.subcategoryId === params.subCategory ||
            (typeof p.subCategory === "object" && (p.subCategory?.slug === params.subCategory || p.subCategory?._id === params.subCategory)) ||
            (typeof p.subCategory === "string" && p.subCategory === params.subCategory)
        );
      }

      if (params?.tag) {
        const t = params.tag.toLowerCase();
        filtered = filtered.filter((p) =>
          p.tags?.some((tagItem) =>
            typeof tagItem === "string"
              ? tagItem.toLowerCase() === t
              : tagItem.slug?.toLowerCase() === t || tagItem.name?.toLowerCase() === t
          )
        );
      }

      if (params?.sort) {
        if (params.sort === "popular" || params.sort === "downloads") {
          filtered.sort((a, b) => (b.downloads || b.downloadsCount || 0) - (a.downloads || a.downloadsCount || 0));
        } else if (params.sort === "rating") {
          filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        } else if (params.sort === "price_asc") {
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (params.sort === "price_desc") {
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        }
      }

      return {
        products: filtered,
        meta: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: filtered.length,
          totalPages: 1,
        },
      };
    }
  },

  /**
   * Fetches single product by ID or slug
   * GET /api/product/:id
   */
  async getProductById(idOrSlug: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<ApiResponse<Product>>(`/api/product/${encodeURIComponent(idOrSlug)}`);
      const prod = response.data.data;
      if (prod) {
        return formatProductItem(prod);
      }
      return null;
    } catch (err) {
      console.warn(`Product lookup notice for ${idOrSlug}:`, err);
      const fallback = FALLBACK_PRODUCTS.find(
        (p) => p.slug === idOrSlug || p.id === idOrSlug || p._id === idOrSlug
      );
      return fallback ? formatProductItem(fallback) : null;
    }
  },

  /**
   * Fetches user's saved favorite products
   * GET /api/product/user/favorite
   */
  async getFavorites(): Promise<Product[]> {
    try {
      const response = await apiClient.get<ApiResponse<Product[]>>("/api/product/user/favorite");
      const list = response.data.data;
      return Array.isArray(list) ? list.map(formatProductItem) : [];
    } catch {
      return [];
    }
  },

  /**
   * Adds product to user's favorites
   * POST /api/product/user/favorite
   */
  async addToFavorites(productId: string): Promise<{ success: boolean; favoriteList?: string[] }> {
    const response = await apiClient.post<ApiResponse<{ favoriteList: string[] }>>(
      "/api/product/user/favorite",
      { productId }
    );
    return { success: true, favoriteList: response.data.data?.favoriteList };
  },

  /**
   * Removes product from user's favorites
   * DELETE /api/product/user/favorite
   */
  async removeFromFavorites(productId: string): Promise<{ success: boolean; favoriteList?: string[] }> {
    const response = await apiClient.delete<ApiResponse<{ favoriteList: string[] }>>(
      "/api/product/user/favorite",
      { data: { productId } }
    );
    return { success: true, favoriteList: response.data.data?.favoriteList };
  },

  /**
   * S3 Presigned Download: records download and returns signed downloadLink
   * POST /api/product/user/mydownloads
   */
  async downloadProduct(productId: string): Promise<ProductDownloadResponse> {
    const response = await apiClient.post<ApiResponse<ProductDownloadResponse>>(
      "/api/product/user/mydownloads",
      { productId }
    );
    return response.data.data;
  },

  /**
   * Submits 1-5 star rating and optional review comment
   * POST /api/product/user/rate
   */
  async rateProduct(payload: RateProductPayload): Promise<{ newAverageRating?: number; reviewsCount?: number }> {
    const response = await apiClient.post<ApiResponse<{ newAverageRating?: number; reviewsCount?: number }>>(
      "/api/product/user/rate",
      payload
    );
    return response.data.data || {};
  },

  /**
   * Increment view counter
   */
  async recordView(productId: string): Promise<void> {
    try {
      await apiClient.post(`/api/product/${encodeURIComponent(productId)}/view`, {}, { skipToast: true });
    } catch {
      // Non-blocking view tracking
    }
  },
};

/**
 * Normalizes backend product schema with UI helper properties
 */
function formatProductItem(p: any): Product {
  const id = p._id || p.id || "";
  const previewImages =
    p.previewImages ||
    p.galleryImages ||
    (p.thumbnail ? [p.thumbnail] : []) ||
    [];

  return {
    ...p,
    id,
    _id: id,
    title: p.title || "Untitled Design Kit",
    slug: p.slug || id,
    thumbnail: p.thumbnail || previewImages[0] || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    previewImages: previewImages.length > 0 ? previewImages : [p.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"],
    galleryImages: previewImages,
    price: Number(p.price) || 0,
    isFree: p.isFree !== undefined ? p.isFree : (Number(p.price) === 0),
    rating: Number(p.rating) || 5.0,
    reviewsCount: Number(p.reviewsCount) || 0,
    downloads: Number(p.downloads) || Number(p.downloadsCount) || 0,
    downloadsCount: Number(p.downloads) || Number(p.downloadsCount) || 0,
    views: Number(p.views) || Number(p.viewsCount) || 0,
    viewsCount: Number(p.views) || Number(p.viewsCount) || 0,
    categoryId: typeof p.category === "object" ? (p.category?._id || p.category?.id) : (p.categoryId || p.category || ""),
    subcategoryId: typeof p.subCategory === "object" ? (p.subCategory?._id || p.subCategory?.id) : (p.subcategoryId || p.subCategory || ""),
    tags: Array.isArray(p.tags) ? p.tags : [],
    overview: p.overview || p.fullDescription || p.shortDescription || "",
    shortDescription: p.shortDescription || p.overview || "",
    fullDescription: p.fullDescription || p.overview || "",
    highlights: Array.isArray(p.highlights) && p.highlights.length > 0
      ? p.highlights
      : ["Figma Variables Ready", "Auto-Layout 5.0", "Light & Dark Mode Included", "100% Free Lifetime Access"],
    includedFiles: Array.isArray(p.includedFiles) && p.includedFiles.length > 0
      ? p.includedFiles
      : ["Figma (.fig)", "Documentation (.pdf)", "Preview Assets (.png)"],
  };
}
