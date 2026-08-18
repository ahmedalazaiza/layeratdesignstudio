import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Category } from "../../types";


function ProductsAdminPanel({ categories }: { categories: Category[] }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
  
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  
    const emptyForm = {
      title: "",
      slug: "",
      short_description: "",
      full_description: "",
      thumbnail_url: "",
      price: 0,
      is_free: true,
      category_id: "",
      subcategory_id: "",
      tags: "",
      file_size: "",
      formats: "Figma",
      screens_count: 0,
      components_count: 0,
      version: "v1.0.0",
      supports_variables: false,
      supports_auto_layout: false,
      supports_light_dark: false,
      license_type: "personal",
      download_file_url: "",
    };
  
    const [form, setForm] = useState(emptyForm);
    const [allSubcategories, setAllSubcategories] = useState<any[]>([]);
  
    useEffect(() => {
      const loadSubs = async () => {
        const { data } = await supabase
          .from("subcategories")
          .select("*")
          .order("sort_order", { ascending: true });
        setAllSubcategories(data || []);
      };
      loadSubs();
    }, []);
  
    const subcategories = allSubcategories.filter(
      (s) => s.category_id === form.category_id
    );
  
    const loadProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      setProducts(data || []);
      setLoading(false);
    };
  
    useEffect(() => {
      loadProducts();
    }, []);
  
    const generateSlug = (title: string) =>
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
  
    const resetForm = () => {
      setForm(emptyForm);
      setEditingId(null);
      setError("");
      setSuccess("");
      setGalleryUrls([]);
    };
  
    const startEdit = (p: any) => {
      setEditingId(p.id);
      setForm({
        title: p.title || "",
        slug: p.slug || "",
        short_description: p.short_description || "",
        full_description: p.full_description || "",
        thumbnail_url: p.thumbnail_url || "",
        price: p.price || 0,
        is_free: p.is_free ?? true,
        category_id: p.category_id || "",
        subcategory_id: p.subcategory_id || "",
        tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
        file_size: p.file_size || "",
        formats: Array.isArray(p.formats)
          ? p.formats.join(", ")
          : p.formats || "Figma",
        screens_count: p.screens_count || 0,
        components_count: p.components_count || 0,
        version: p.version || "v1.0.0",
        supports_variables: p.supports_variables || false,
        supports_auto_layout: p.supports_auto_layout || false,
        supports_light_dark: p.supports_light_dark || false,
        license_type: p.license_type || "personal",
        download_file_url: p.download_file_url || "",
      });
      setError("");
      setSuccess("");
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
  
      if (!form.title.trim() || !form.slug.trim()) {
        setError("Title and slug are required.");
        return;
      }
  
      setSaving(true);
  
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        short_description: form.short_description.trim() || null,
        full_description: form.full_description.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || null,
        price: form.is_free ? 0 : Number(form.price) || 0,
        is_free: form.is_free,
        category_id: form.category_id || null,
        subcategory_id: form.subcategory_id || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        file_size: form.file_size || null,
        formats: form.formats
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        screens_count: Number(form.screens_count) || 0,
        components_count: Number(form.components_count) || 0,
        version: form.version || null,
        supports_variables: form.supports_variables,
        supports_auto_layout: form.supports_auto_layout,
        supports_light_dark: form.supports_light_dark,
        license_type: form.license_type,
        download_file_url: form.download_file_url.trim() || null,
      };
  
      let productId = editingId as string | null;
  
      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId);
        setSaving(false);
        if (error) {
          if (error.code === "23505") setError("This slug already exists.");
          else setError(error.message || "Failed to save product.");
          return;
        }
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        setSaving(false);
        if (error) {
          if (error.code === "23505") setError("This slug already exists.");
          else setError(error.message || "Failed to save product.");
          return;
        }
        productId = data.id;
      }
  
      // Save gallery images
      if (productId && galleryUrls.length > 0) {
        if (editingId) {
          await supabase
            .from("product_images")
            .delete()
            .eq("product_id", productId);
        }
        await supabase.from("product_images").insert(
          galleryUrls.map((url, index) => ({
            product_id: productId,
            image_url: url,
            sort_order: index,
          }))
        );
      }
  
      setSuccess(editingId ? "Product updated." : "Product created.");
      resetForm();
      loadProducts();
    };
  
    const handleDelete = async (id: string, title: string) => {
      if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        alert(error.message);
        return;
      }
      if (editingId === id) resetForm();
      loadProducts();
    };
  
    const inputCls =
      "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none";
  
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">
                {editingId ? "Edit Product" : "Add Product"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Fill product details. Image upload comes next.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            )}
          </div>
  
          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
          >
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Title *
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: editingId ? f.slug : generateSlug(e.target.value),
                  }))
                }
                className={inputCls}
                required
              />
            </div>
  
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Slug *
              </label>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }))
                }
                className={`${inputCls} font-mono`}
                required
              />
            </div>
  
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Short Description
              </label>
              <input
                value={form.short_description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, short_description: e.target.value }))
                }
                className={inputCls}
              />
            </div>
  
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Full Description
              </label>
              <textarea
                value={form.full_description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, full_description: e.target.value }))
                }
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </div>
  
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Thumbnail Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSaving(true);
                  setError("");
                  const ext = file.name.split(".").pop();
                  const path = `thumbnails/${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}.${ext}`;
                  const { error: uploadError } = await supabase.storage
                    .from("product-images")
                    .upload(path, file);
                  if (uploadError) {
                    setError(uploadError.message);
                    setSaving(false);
                    return;
                  }
                  const { data } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(path);
                  setForm((f) => ({ ...f, thumbnail_url: data.publicUrl }));
                  setSaving(false);
                }}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium"
              />
              {form.thumbnail_url && (
                <img
                  src={form.thumbnail_url}
                  alt="Thumbnail preview"
                  className="mt-3 w-full max-w-xs h-36 object-cover rounded-xl border border-border"
                />
              )}
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Gallery Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  setSaving(true);
                  setError("");
                  const urls: string[] = [];
                  for (const file of files) {
                    const ext = file.name.split(".").pop();
                    const path = `gallery/${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2)}.${ext}`;
                    const { error: uploadError } = await supabase.storage
                      .from("product-images")
                      .upload(path, file);
                    if (uploadError) {
                      setError(uploadError.message);
                      continue;
                    }
                    const { data } = supabase.storage
                      .from("product-images")
                      .getPublicUrl(path);
                    urls.push(data.publicUrl);
                  }
                  setGalleryUrls((prev) => [...prev, ...urls]);
                  setSaving(false);
                }}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium"
              />
  
              {galleryUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {galleryUrls.map((url) => (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt=""
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryUrls((prev) => prev.filter((u) => u !== url))
                        }
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
  
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Category
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category_id: e.target.value,
                      subcategory_id: "",
                    }))
                  }
                  className={inputCls}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Subcategory
                </label>
                <select
                  value={form.subcategory_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subcategory_id: e.target.value }))
                  }
                  className={inputCls}
                  disabled={!form.category_id}
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.is_free}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      is_free: e.target.checked,
                      price: e.target.checked ? 0 : f.price,
                    }))
                  }
                />
                Free product
              </label>
              {!form.is_free && (
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  placeholder="Price"
                  className={inputCls}
                />
              )}
            </div>
  
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Tags (comma separated)
              </label>
              <input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="UI Kit, Figma, Dashboard"
                className={inputCls}
              />
            </div>
  
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  File Size
                </label>
                <input
                  value={form.file_size}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, file_size: e.target.value }))
                  }
                  placeholder="24.2 MB"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Version
                </label>
                <input
                  value={form.version}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, version: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Screens
                </label>
                <input
                  type="number"
                  value={form.screens_count}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      screens_count: Number(e.target.value),
                    }))
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Components
                </label>
                <input
                  type="number"
                  value={form.components_count}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      components_count: Number(e.target.value),
                    }))
                  }
                  className={inputCls}
                />
              </div>
            </div>
  
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Formats
              </label>
              <input
                value={form.formats}
                onChange={(e) =>
                  setForm((f) => ({ ...f, formats: e.target.value }))
                }
                placeholder="Figma, Sketch"
                className={inputCls}
              />
            </div>
  
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                License
              </label>
              <select
                value={form.license_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, license_type: e.target.value }))
                }
                className={inputCls}
              >
                <option value="personal">Personal</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
  
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                ["supports_variables", "Variables"],
                ["supports_auto_layout", "Auto Layout"],
                ["supports_light_dark", "Light/Dark"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(form as any)[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.checked }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
  
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Download File URL (temporary)
              </label>
              <input
                value={form.download_file_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, download_file_url: e.target.value }))
                }
                placeholder="https://..."
                className={inputCls}
              />
            </div>
  
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-destructive/20 border border-red-200 dark:border-destructive/30 rounded-xl px-4 py-3">
                <AlertCircle size={14} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3">
                <CheckCircle size={14} /> {success}
              </div>
            )}
  
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Save Changes"
                : "Create Product"}
            </button>
          </form>
        </div>
  
        {/* List */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-lg font-display font-bold text-foreground">
              Products ({products.length})
            </h2>
          </div>
  
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No products yet.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
              {products.map((p) => (
                <div
                  key={p.id}
                  className={`px-5 py-4 flex items-center gap-4 ${
                    editingId === p.id ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                    {p.thumbnail_url ? (
                      <img
                        src={p.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {p.title}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {p.slug} · {p.is_free ? "Free" : `$${p.price}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.title)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export { ProductsAdminPanel };