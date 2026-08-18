import { supabase } from "../lib/supabase";
import { FALLBACK_PRODUCTS } from "../data/fallbackData";
import { formatFileSize } from "../components/admin/ProductsAdminPanel";
import type { Product } from "../types";

/**
 * Product Data & Storage Service
 */
export const productService = {
  /**
   * Fetches all products with images from Supabase
   */
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images ( id, image_url, sort_order )
        `)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((p: any): Product => {
          const gallery = p.product_images
            ? p.product_images
                .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((img: any) => img.image_url)
            : [];

          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            shortDescription: p.short_description || "",
            fullDescription: p.full_description || "",
            price: Number(p.price) || 0,
            isFree: p.is_free ?? true,
            thumbnail: p.thumbnail_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
            galleryImages: gallery,
            figmaPreviewUrl: p.figma_preview_url || undefined,
            downloadFileUrl: p.download_file_url || undefined,
            categoryId: p.category_id || "",
            subcategoryId: p.subcategory_id || undefined,
            tags: Array.isArray(p.tags) ? p.tags : [],
            fileSize: p.file_size || "45 MB",
            formats: Array.isArray(p.formats) ? p.formats : ["Figma (.fig)"],
            screensCount: p.screens_count || 0,
            componentsCount: p.components_count || 0,
            version: p.version || "v1.0.0",
            downloadsCount: p.downloads_count || 0,
            viewsCount: p.views_count || 0,
            rating: Number(p.rating) || 5.0,
            reviewsCount: Number(p.reviews_count) || 0,
            isFeatured: Boolean(p.is_featured),
            createdAt: p.created_at || new Date().toISOString(),
            specifications: {
              fileSize: p.file_size || "45 MB",
              format: Array.isArray(p.formats) ? p.formats : ["Figma (.fig)"],
              screens: p.screens_count || 0,
              components: p.components_count || 0,
              version: p.version || "v1.0.0",
              compatibility: ["Figma Web", "Figma Desktop", "FigJam"],
              supportsVariables: p.supports_variables ?? true,
              supportsAutoLayout: p.supports_auto_layout ?? true,
              supportsLightDark: p.supports_light_dark ?? true,
            },
            license: {
              type: (p.license_type as any) || "commercial",
              allowCommercial: true,
              allowUnlimitedProjects: true,
              attributionRequired: false,
            },
          };
        });
      }

      return FALLBACK_PRODUCTS;
    } catch (err) {
      console.warn("Product service note: using fallback products", err);
      return FALLBACK_PRODUCTS;
    }
  },

  /**
   * Records a product view with unique viewer key
   */
  async recordView(productId: string, viewerKey: string): Promise<void> {
    try {
      await supabase.from("product_views").insert({
        product_id: productId,
        viewer_key: viewerKey,
      });
    } catch (err) {
      console.warn("Record view notice:", err);
    }
  },

  /**
   * Records a product download log
   */
  async recordDownload(productId: string, userId?: string | null): Promise<void> {
    try {
      await supabase.from("downloads").insert({
        product_id: productId,
        user_id: userId || null,
      });
    } catch (err) {
      console.warn("Record download notice:", err);
    }
  },

  /**
   * Uploads an image file to product-images storage bucket
   */
  async uploadImage(file: File, folder: "thumbnails" | "gallery"): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      // Fallback base64
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || "");
        reader.readAsDataURL(file);
      });
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Uploads a downloadable asset file to product-files storage bucket
   */
  async uploadAsset(file: File): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "fig";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `downloads/${fileName}`;

    const { error } = await supabase.storage
      .from("product-files")
      .upload(filePath, file, { upsert: true });

    if (error) {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || "");
        reader.readAsDataURL(file);
      });
    }

    const { data } = supabase.storage.from("product-files").getPublicUrl(filePath);
    return data.publicUrl;
  },
};
