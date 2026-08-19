import React from "react";
import { motion } from "framer-motion";
import { Hero } from "../components/home/Hero";
import { StatsSection } from "../components/home/StatsSection";
import { CategoriesSection } from "../components/home/CategoriesSection";
import { FeaturedProducts } from "../components/home/FeaturedProducts";
import { HowItWorks } from "../components/home/HowItWorks";
import { Footer } from "../components/layout/Footer";
import type { Product, Category, AuthUser, Page } from "../types";

interface HomePageProps {
  products: Product[];
  categories: Category[];
  authUser: AuthUser | null;
  onNavigate: (p: Page) => void;
  onSearch: (q: string) => void;
  onCategoryClick: (categoryId: string) => void;
  onProductClick: (p: Product) => void;
  onWishlistToggle: (id: string) => void;
  onAuthOpen: (mode: "login" | "register" | "forgot_password") => void;
  wishlist?: string[];
}

export function HomePage({
  products,
  categories,
  authUser,
  onNavigate,
  onSearch,
  onCategoryClick,
  onProductClick,
  onWishlistToggle,
  onAuthOpen,
  wishlist,
}: HomePageProps) {
  return (
    <motion.main
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Hero
        onSearch={onSearch}
        onNavigate={onNavigate}
        onAuthOpen={onAuthOpen}
      />
      <StatsSection products={products} />
      <CategoriesSection
        onCategoryClick={onCategoryClick}
        categories={categories}
      />
      <FeaturedProducts
        products={products}
        onProductClick={onProductClick}
        onNavigate={onNavigate}
        authUser={authUser}
        onWishlistToggle={onWishlistToggle}
        onAuthOpen={onAuthOpen}
        categories={categories}
        wishlist={wishlist}
      />
      <HowItWorks />
      <Footer onNavigate={onNavigate} categories={categories} />
    </motion.main>
  );
}
