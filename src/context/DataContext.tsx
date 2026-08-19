import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "../data/fallbackData";
import type { Product, Category } from "../types";

export interface DataContextValue {
  products: Product[];
  categories: Category[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshAll: () => Promise<void>;
  getProductByIdOrSlug: (idOrSlug: string) => Product | undefined;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const refreshCategories = useCallback(async () => {
    try {
      const data = await categoryService.getCategories();
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (err) {
      console.warn("Failed to refresh categories", err);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await productService.getProducts();
      const prods = Array.isArray(res) ? res : res?.products || [];
      if (prods && prods.length > 0) {
        setProducts(prods);
      }
    } catch (err) {
      console.warn("Failed to refresh products", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([refreshCategories(), refreshProducts()]);
    setLoading(false);
  }, [refreshCategories, refreshProducts]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const getProductByIdOrSlug = useCallback((idOrSlug: string): Product | undefined => {
    return products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  }, [products]);

  return (
    <DataContext.Provider
      value={{
        products,
        categories,
        loading,
        refreshProducts,
        refreshCategories,
        refreshAll,
        getProductByIdOrSlug,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}
