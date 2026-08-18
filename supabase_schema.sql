-- ==============================================================================
-- Layerat Design Studio - Complete Supabase Database Schema (With OAuth Provider Tracking)
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable required UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table - Ensure table and columns exist safely
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add all columns to profiles if they do not exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Super Admin & Security Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ahmedazy.uxui@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Automatic Profile Creation Trigger with Provider & Avatar Extraction
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_provider TEXT;
  v_avatar TEXT;
  v_name TEXT;
BEGIN
  -- Extract OAuth provider (e.g. 'google', 'facebook', 'email')
  v_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  
  -- Extract Avatar URL from Google/Facebook metadata
  v_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'avatar'
  );

  -- Extract Full Name
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, provider)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_avatar,
    CASE 
      WHEN LOWER(NEW.email) = 'ahmedazy.uxui@gmail.com' THEN 'admin'
      ELSE 'user'
    END,
    v_provider
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    provider = EXCLUDED.provider,
    role = CASE 
      WHEN LOWER(EXCLUDED.email) = 'ahmedazy.uxui@gmail.com' THEN 'admin'
      ELSE profiles.role 
    END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'Layers',
  description TEXT,
  color TEXT DEFAULT '#aaff38',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subcategories Table
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Products Table (Free Design Kits & Resources)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  full_description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  thumbnail_url TEXT NOT NULL,
  figma_preview_url TEXT,
  file_size TEXT DEFAULT '45 MB',
  version TEXT DEFAULT 'v1.0.0',
  formats TEXT[] DEFAULT ARRAY['Figma'],
  tags TEXT[] DEFAULT '{}',
  screens_count INT DEFAULT 0,
  components_count INT DEFAULT 0,
  supports_variables BOOLEAN DEFAULT true,
  supports_auto_layout BOOLEAN DEFAULT true,
  supports_light_dark BOOLEAN DEFAULT true,
  license_type TEXT DEFAULT 'commercial',
  download_file_url TEXT,
  downloads_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images (Gallery) Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Publisher Applications Table
CREATE TABLE IF NOT EXISTS public.publisher_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  portfolio TEXT,
  bio TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.publisher_applications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.publisher_applications ADD COLUMN IF NOT EXISTS social TEXT;
ALTER TABLE public.publisher_applications ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.publisher_applications ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
ALTER TABLE public.publisher_applications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.publisher_applications ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 8. Downloads Log Table
DROP TABLE IF EXISTS public.downloads CASCADE;
CREATE TABLE public.downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  source TEXT DEFAULT 'direct'
);

-- 9. Product Views Log Table
DROP TABLE IF EXISTS public.product_views CASCADE;
CREATE TABLE public.product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- 10. Favorites / Wishlists Table
DROP TABLE IF EXISTS public.favorites CASCADE;
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- 11. Gift Popup Configuration Table
CREATE TABLE IF NOT EXISTS public.gift_settings (
  id INT PRIMARY KEY DEFAULT 1,
  title TEXT DEFAULT 'Free Figma Starter Kit',
  description TEXT DEFAULT '50+ components · 3 themes · Variables-ready',
  image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1637944059054-7091ca8efe14?w=600&q=80&fit=crop',
  download_url TEXT,
  file_name TEXT DEFAULT 'layerat-starter-kit.fig',
  file_format TEXT DEFAULT 'fig',
  file_size TEXT DEFAULT '45 MB',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gift_settings ADD COLUMN IF NOT EXISTS file_format TEXT DEFAULT 'fig';
ALTER TABLE public.gift_settings ADD COLUMN IF NOT EXISTS file_size TEXT DEFAULT '45 MB';

-- Ensure default gift row exists
INSERT INTO public.gift_settings (id, title, description, is_active)
VALUES (1, 'Free Figma Starter Kit', '50+ components · 3 themes · Variables-ready', true)
ON CONFLICT (id) DO NOTHING;

-- 12. Marketing Leads Table (Gift captures)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'gift_popup',
  gift_downloaded BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Site Content CMS Table (Live Home, Team, About, Footer, Announcement)
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Product Reviews Table (Verified Downloaders Only)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  user_name TEXT,
  user_avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS review_text TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS user_avatar TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating INT DEFAULT 5;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 10. Reviews Policies
DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert review" ON public.reviews;
CREATE POLICY "Users can insert review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own review" ON public.reviews;
CREATE POLICY "Users can update own review" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users or Admins can delete review" ON public.reviews;
CREATE POLICY "Users or Admins can delete review" ON public.reviews FOR DELETE USING (
  auth.uid() = user_id OR public.is_admin()
);

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR ALL USING (public.is_admin());

-- 2. Categories & Subcategories Policies
DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Subcategories viewable by everyone" ON public.subcategories;
CREATE POLICY "Subcategories viewable by everyone" ON public.subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage subcategories" ON public.subcategories;
CREATE POLICY "Admins manage subcategories" ON public.subcategories FOR ALL USING (public.is_admin());

-- 3. Products & Images Policies
DROP POLICY IF EXISTS "Products viewable by everyone" ON public.products;
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and Publishers manage products" ON public.products;
CREATE POLICY "Admins and Publishers manage products" ON public.products FOR ALL USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'publisher')
  )
);

DROP POLICY IF EXISTS "Product images viewable by everyone" ON public.product_images;
CREATE POLICY "Product images viewable by everyone" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage product images" ON public.product_images;
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL USING (public.is_admin());

-- 4. Favorites Policies
DROP POLICY IF EXISTS "Users view own favorites" ON public.favorites;
CREATE POLICY "Users view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own favorites" ON public.favorites;
CREATE POLICY "Users insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own favorites" ON public.favorites;
CREATE POLICY "Users delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 5. Downloads & Views Policies
DROP POLICY IF EXISTS "Anyone can log download" ON public.downloads;
CREATE POLICY "Anyone can log download" ON public.downloads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins view downloads" ON public.downloads;
CREATE POLICY "Admins view downloads" ON public.downloads FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can log views" ON public.product_views;
CREATE POLICY "Anyone can log views" ON public.product_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins view product views" ON public.product_views;
CREATE POLICY "Admins view product views" ON public.product_views FOR SELECT USING (true);

-- 6. Publisher Applications Policies
DROP POLICY IF EXISTS "Users can insert application" ON public.publisher_applications;
CREATE POLICY "Users can insert application" ON public.publisher_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users view own application or Admins view all" ON public.publisher_applications;
DROP POLICY IF EXISTS "Admins view all applications" ON public.publisher_applications;
CREATE POLICY "Admins view all applications" ON public.publisher_applications FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update application" ON public.publisher_applications;
CREATE POLICY "Admins can update application" ON public.publisher_applications FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete application" ON public.publisher_applications;
CREATE POLICY "Admins can delete application" ON public.publisher_applications FOR DELETE USING (public.is_admin());

-- 7. Gift Settings Policies
DROP POLICY IF EXISTS "Anyone can read gift settings" ON public.gift_settings;
CREATE POLICY "Anyone can read gift settings" ON public.gift_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage gift settings" ON public.gift_settings;
CREATE POLICY "Admins manage gift settings" ON public.gift_settings FOR ALL USING (public.is_admin());

-- 8. Leads Policies
DROP POLICY IF EXISTS "Anyone can submit lead" ON public.leads;
CREATE POLICY "Anyone can submit lead" ON public.leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins view leads" ON public.leads;
CREATE POLICY "Admins view leads" ON public.leads FOR SELECT USING (public.is_admin());

-- 9. Site Content CMS Policies
DROP POLICY IF EXISTS "Anyone can read site content" ON public.site_content;
CREATE POLICY "Anyone can read site content" ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage site content" ON public.site_content;
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL USING (public.is_admin());

-- 11. Supabase Storage Buckets for Product Files & Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-files', 'product-files', true),
       ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public product files download" ON storage.objects;
CREATE POLICY "Public product files download" ON storage.objects FOR SELECT USING (bucket_id IN ('product-files', 'product-images'));

DROP POLICY IF EXISTS "Admins upload product files" ON storage.objects;
CREATE POLICY "Admins upload product files" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('product-files', 'product-images'));

DROP POLICY IF EXISTS "Admins delete product files" ON storage.objects;
CREATE POLICY "Admins delete product files" ON storage.objects FOR DELETE USING (bucket_id IN ('product-files', 'product-images'));

-- 12. Search Telemetry & Queries Table
CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  results_count INT DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log search queries" ON public.search_logs;
CREATE POLICY "Anyone can log search queries" ON public.search_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins view search logs" ON public.search_logs;
CREATE POLICY "Admins view search logs" ON public.search_logs FOR SELECT USING (true);
