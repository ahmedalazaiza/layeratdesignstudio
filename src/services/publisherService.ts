import { apiClient } from "@/lib/api-client";
import type { Product, ApiResponse, PaginationMeta } from "@/types/api";

export interface PublisherApplicationPayload {
  portfolioLinks: string[];
  websiteUrl?: string;
  motivation?: string;
  experience?: string;
}

export interface MyProductsResponse {
  products: Product[];
  meta?: PaginationMeta;
}

export const publisherService = {
  /**
   * Submit Publisher Application
   * POST /api/user/publisher
   */
  async apply(payload: PublisherApplicationPayload): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/api/user/publisher",
      payload
    );
    return response.data;
  },

  /**
   * Fetch Publisher's Own Products
   * GET /api/product/publisher/
   */
  async getMyProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<MyProductsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<Product[] | { products: Product[]; meta?: PaginationMeta }>>(
        "/api/product/publisher/",
        { params }
      );

      const data = response.data.data;

      if (Array.isArray(data)) {
        return {
          products: data.map(formatPublisherProduct),
          meta: response.data.meta,
        };
      }

      if (data && typeof data === "object" && "products" in data) {
        return {
          products: ((data as any).products || []).map(formatPublisherProduct),
          meta: (data as any).meta || response.data.meta,
        };
      }

      return { products: [] };
    } catch (err) {
      console.warn("My products service note:", err);
      return { products: [] };
    }
  },

  /**
   * Upload / Create New Product as Publisher
   * POST /api/product/publisher/
   */
  async createProduct(
    formData: FormData,
    onProgress?: (percentage: number) => void
  ): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>(
      "/api/product/publisher/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );

    return response.data.data;
  },
};

function formatPublisherProduct(p: any): Product {
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
    title: p.title || "Untitled Product",
    slug: p.slug || id,
    thumbnail: p.thumbnail || previewImages[0] || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    previewImages,
    price: Number(p.price) || 0,
    isFree: p.isFree !== undefined ? p.isFree : (Number(p.price || 0) === 0),
    status: p.status || "published",
    downloads: Number(p.downloads) || Number(p.downloadsCount) || 0,
    downloadsCount: Number(p.downloads) || Number(p.downloadsCount) || 0,
    views: Number(p.views) || Number(p.viewsCount) || 0,
    rating: Number(p.rating) || 5.0,
    reviewsCount: Number(p.reviewsCount) || 0,
    category: p.category || p.categoryId,
    categoryId: typeof p.category === "object" ? (p.category?._id || p.category?.id) : (p.categoryId || p.category || ""),
    subcategoryId: typeof p.subCategory === "object" ? (p.subCategory?._id || p.subCategory?.id) : (p.subcategoryId || p.subCategory || ""),
    tags: Array.isArray(p.tags) ? p.tags : [],
    createdAt: p.createdAt || new Date().toISOString(),
  };
}
