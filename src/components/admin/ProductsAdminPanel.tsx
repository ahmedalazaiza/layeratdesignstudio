import React, { useEffect, useState, useRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  Package,
  FileCode,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  Download,
  Star,
  Check,
  RefreshCw,
  FolderArchive,
} from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import type { Category } from "../../types";

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${val} ${sizes[i]}`;
}

interface ProductsAdminPanelProps {
  categories: Category[];
}

export function ProductsAdminPanel({ categories }: ProductsAdminPanelProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Tab State: "essentials" | "files" | "media" | "specs"
  const [activeFormTab, setActiveFormTab] = useState<
    "essentials" | "files" | "media" | "specs"
  >("essentials");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Deferred File Upload State (Holds local File handles until final submit)
  const [pendingAssetFile, setPendingAssetFile] = useState<File | null>(null);
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState<File | null>(null);
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<{ file: File; previewUrl: string }[]>([]);

  // File Upload State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    format: string;
  } | null>(null);

  // Gallery URLs (mixture of existing Supabase public URLs and new local preview object URLs)
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
    file_size: "45 MB",
    formats: "Figma (.fig)",
    screens_count: 80,
    components_count: 150,
    version: "v1.0.0",
    supports_variables: true,
    supports_auto_layout: true,
    supports_light_dark: true,
    license_type: "commercial",
    download_file_url: "",
    figma_preview_url: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [allSubcategories, setAllSubcategories] = useState<any[]>([]);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images ( id, image_url, sort_order )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error("Load products error:", err);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
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
    setAttachedFile(null);
    setPendingAssetFile(null);
    setPendingThumbnailFile(null);
    setPendingGalleryFiles([]);
    setGalleryUrls([]);
    setActiveFormTab("essentials");
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setPendingAssetFile(null);
    setPendingThumbnailFile(null);
    setPendingGalleryFiles([]);
    setForm({
      title: p.title || "",
      slug: p.slug || "",
      short_description: p.short_description || "",
      full_description: p.full_description || "",
      thumbnail_url: p.thumbnail_url || "",
      price: 0,
      is_free: true,
      category_id: p.category_id || "",
      subcategory_id: p.subcategory_id || "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
      file_size: p.file_size || "45 MB",
      formats: Array.isArray(p.formats)
        ? p.formats.join(", ")
        : p.formats || "Figma (.fig)",
      screens_count: p.screens_count || 0,
      components_count: p.components_count || 0,
      version: p.version || "v1.0.0",
      supports_variables: p.supports_variables ?? true,
      supports_auto_layout: p.supports_auto_layout ?? true,
      supports_light_dark: p.supports_light_dark ?? true,
      license_type: p.license_type || "commercial",
      download_file_url: p.download_file_url || "",
      figma_preview_url: p.figma_preview_url || "",
    });

    if (p.download_file_url) {
      setAttachedFile({
        name: `${p.slug || "layerat-kit"}.fig`,
        size: p.file_size || "Attached",
        format: p.formats?.[0] || "FIG",
      });
    } else {
      setAttachedFile(null);
    }

    if (p.product_images && p.product_images.length > 0) {
      setGalleryUrls(
        p.product_images
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((img: any) => img.image_url)
      );
    } else {
      setGalleryUrls([]);
    }

    setActiveFormTab("essentials");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 1. Handle Local Design Asset File Selection (.fig, .zip, .sketch, .xd, etc.)
  const handleAssetFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "fig";
    const formattedSize = formatFileSize(file.size);

    setPendingAssetFile(file);
    setAttachedFile({
      name: file.name,
      size: formattedSize,
      format: ext.toUpperCase(),
    });

    setForm((prev) => ({
      ...prev,
      file_size: formattedSize,
      formats: `Figma (.${ext})`,
    }));

    toast.success(`Attached "${file.name}" (${formattedSize}) — will upload upon Save!`);
  };

  // 2. Handle Cover Image Thumbnail Selection (Local Preview)
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingThumbnailFile(file);
    const localUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, thumbnail_url: localUrl }));
    toast.success("Cover image selected! (Will upload on Save)");
  };

  // 3. Handle Multi-Image Gallery Selection (Local Previews)
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPending = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingGalleryFiles((prev) => [...prev, ...newPending]);
    setGalleryUrls((prev) => [...prev, ...newPending.map((p) => p.previewUrl)]);
    toast.success(`Added ${files.length} screenshots to gallery! (Will upload on Save)`);
  };

  // 4. Save / Update Product (Executes all Storage uploads and DB record sync upon Submit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and slug are required.");
      return;
    }

    try {
      setSaving(true);
      setUploadProgress("Preparing upload...");

      let finalThumbnailUrl = form.thumbnail_url;
      let finalDownloadUrl = form.download_file_url;
      let finalGalleryUrls: string[] = galleryUrls.filter(
        (url) => !url.startsWith("blob:") && !url.startsWith("data:")
      );

      // A. Upload Cover Thumbnail if new file selected
      if (pendingThumbnailFile) {
        setUploadProgress("Uploading cover image to storage...");
        const ext = pendingThumbnailFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: thumbErr } = await supabase.storage
          .from("product-images")
          .upload(filePath, pendingThumbnailFile, { upsert: true });

        if (thumbErr) {
          console.warn("Storage upload note (Thumbnail):", thumbErr.message);
          // Fallback: Read as base64 data url if bucket error
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = (ev) => {
              finalThumbnailUrl = (ev.target?.result as string) || finalThumbnailUrl;
              resolve();
            };
            reader.readAsDataURL(pendingThumbnailFile);
          });
        } else {
          const { data: thumbData } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);
          finalThumbnailUrl = thumbData.publicUrl;
        }
      }

      // B. Upload Gallery Images if new files selected
      if (pendingGalleryFiles.length > 0) {
        for (let i = 0; i < pendingGalleryFiles.length; i++) {
          setUploadProgress(`Uploading screenshot ${i + 1}/${pendingGalleryFiles.length}...`);
          const item = pendingGalleryFiles[i];
          const ext = item.file.name.split(".").pop()?.toLowerCase() || "jpg";
          const filePath = `gallery/${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${ext}`;

          const { error: galErr } = await supabase.storage
            .from("product-images")
            .upload(filePath, item.file, { upsert: true });

          if (!galErr) {
            const { data: gData } = supabase.storage
              .from("product-images")
              .getPublicUrl(filePath);
            finalGalleryUrls.push(gData.publicUrl);
          } else {
            console.warn("Storage upload note (Gallery):", galErr.message);
            // Fallback base64
            const reader = new FileReader();
            await new Promise<void>((resolve) => {
              reader.onload = (ev) => {
                if (ev.target?.result) finalGalleryUrls.push(ev.target.result as string);
                resolve();
              };
              reader.readAsDataURL(item.file);
            });
          }
        }
      }

      // C. Upload Asset File (.fig / .zip) if new file selected
      if (pendingAssetFile) {
        setUploadProgress(`Uploading downloadable asset file (${pendingAssetFile.name})...`);
        const ext = pendingAssetFile.name.split(".").pop()?.toLowerCase() || "fig";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `downloads/${fileName}`;

        const { error: assetErr } = await supabase.storage
          .from("product-files")
          .upload(filePath, pendingAssetFile, { upsert: true });

        if (assetErr) {
          console.warn("Storage upload note (Asset file):", assetErr.message);
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = (ev) => {
              finalDownloadUrl = (ev.target?.result as string) || finalDownloadUrl;
              resolve();
            };
            reader.readAsDataURL(pendingAssetFile);
          });
        } else {
          const { data: assetData } = supabase.storage
            .from("product-files")
            .getPublicUrl(filePath);
          finalDownloadUrl = assetData.publicUrl;
        }
      }

      setUploadProgress("Saving product details to database...");

      const payload: any = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        short_description: form.short_description.trim() || null,
        full_description: form.full_description.trim() || null,
        thumbnail_url: finalThumbnailUrl?.startsWith("blob:") ? null : (finalThumbnailUrl?.trim() || null),
        price: 0,
        is_free: true,
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
        version: form.version || "v1.0.0",
        supports_variables: form.supports_variables,
        supports_auto_layout: form.supports_auto_layout,
        supports_light_dark: form.supports_light_dark,
        license_type: form.license_type,
        download_file_url: finalDownloadUrl?.startsWith("blob:") ? null : (finalDownloadUrl?.trim() || null),
        figma_preview_url: form.figma_preview_url.trim() || null,
      };

      let productId = editingId;

      try {
        if (editingId) {
          const { error } = await supabase
            .from("products")
            .update(payload)
            .eq("id", editingId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("products")
            .insert(payload)
            .select("id")
            .single();
          if (error) throw error;
          productId = data.id;
        }
      } catch (dbErr: any) {
        // Schema cache mismatch resilience (e.g. PGRST204 on figma_preview_url or subcategory_id)
        if (
          dbErr.code === "PGRST204" ||
          dbErr.message?.toLowerCase().includes("figma_preview_url") ||
          dbErr.message?.toLowerCase().includes("schema cache")
        ) {
          console.warn("Retrying product save without figma_preview_url due to database cache mismatch:", dbErr.message);
          delete payload.figma_preview_url;
          if (editingId) {
            const { error } = await supabase
              .from("products")
              .update(payload)
              .eq("id", editingId);
            if (error) throw error;
          } else {
            const { data, error } = await supabase
              .from("products")
              .insert(payload)
              .select("id")
              .single();
            if (error) throw error;
            productId = data.id;
          }
        } else {
          throw dbErr;
        }
      }

      // Sync gallery images in product_images
      if (productId) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        if (finalGalleryUrls.length > 0) {
          await supabase.from("product_images").insert(
            finalGalleryUrls.map((url, idx) => ({
              product_id: productId,
              image_url: url,
              sort_order: idx,
            }))
          );
        }
      }

      toast.success(
        editingId ? "Product updated successfully!" : "Product published to 100% Free Library!"
      );
      resetForm();
      await loadProducts();
    } catch (err: any) {
      console.error("Save product error:", err);
      toast.error(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  // 5. Delete Product
  const handleDelete = async (id: string, title: string) => {
    const confirm = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirm) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      toast.success(`Deleted "${title}"`);
      if (editingId === id) resetForm();
      await loadProducts();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete product.");
    }
  };

  const categoryOptions = [
    { value: "", label: "Select Category" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const subcategoryOptions = [
    { value: "", label: "Select Subcategory" },
    ...subcategories.map((s) => ({ value: s.id, label: s.name })),
  ];

  const filteredProducts = products.filter((p) => {
    if (selectedCategoryFilter !== "all" && p.category_id !== selectedCategoryFilter)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (p.title || "").toLowerCase().includes(q);
      const matchSlug = (p.slug || "").toLowerCase().includes(q);
      return matchTitle || matchSlug;
    }
    return true;
  });

  const inputCls =
    "w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all font-sans";

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-2">
            <Package size={13} /> Product Engine & Asset Uploads
          </div>
          <h2 className="text-2xl font-display font-extrabold text-foreground">
            {editingId ? "Editing Design Resource" : "Add Free Design Resource"}
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Upload files directly (.fig, .zip), manage HD screenshots, and publish to the marketplace
          </p>
        </div>

        <div className="flex items-center gap-3">
          {editingId && (
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono font-bold transition-all cursor-pointer"
            >
              + Create New Product
            </button>
          )}
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/40 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Interface: Editor Form & Live Library */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ── LEFT: ADD / EDIT PRODUCT FORM (7 Cols) ────────────────────────── */}
        <div className="xl:col-span-7 rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-lg space-y-6">
          {/* Form Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/80 overflow-x-auto">
            {[
              { id: "essentials", label: "1. Essentials", icon: Layers },
              { id: "files", label: "2. Asset File (.FIG / .ZIP)", icon: FolderArchive },
              { id: "media", label: "3. Cover & Gallery", icon: ImageIcon },
              { id: "specs", label: "4. Specs & Features", icon: FileCode },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFormTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── TAB 1: ESSENTIALS ───────────────────────────────────────── */}
            {activeFormTab === "essentials" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
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
                      placeholder="e.g. Orbit SaaS & Mobile UI Kit"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                      URL Slug *
                    </label>
                    <input
                      value={form.slug}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }))
                      }
                      className={`${inputCls} font-mono`}
                      required
                      placeholder="orbit-saas-ui-kit"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <CustomSelect
                    label="Category"
                    options={categoryOptions}
                    value={form.category_id}
                    onChange={(val) =>
                      setForm((f) => ({
                        ...f,
                        category_id: val,
                        subcategory_id: "",
                      }))
                    }
                  />

                  <CustomSelect
                    label="Subcategory"
                    options={subcategoryOptions}
                    value={form.subcategory_id}
                    onChange={(val) => setForm((f) => ({ ...f, subcategory_id: val }))}
                    disabled={!form.category_id}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                    Short Hook Description
                  </label>
                  <input
                    value={form.short_description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, short_description: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="High-converting dark mode dashboard with 120+ prebuilt components..."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                    Full Description (Markdown supported)
                  </label>
                  <textarea
                    value={form.full_description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, full_description: e.target.value }))
                    }
                    rows={5}
                    className={`${inputCls} resize-none`}
                    placeholder="Describe design features, style guides, included tokens, responsive layouts..."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                    Tags (comma separated)
                  </label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="UI Kit, Figma, SaaS, Dashboard, Mobile"
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* ── TAB 2: ASSET FILE (.FIG / .ZIP) DIRECT UPLOADER ─────────── */}
            {activeFormTab === "files" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                    Direct Design Asset Uploader
                  </label>
                  <p className="text-xs text-muted-foreground mb-3 font-mono">
                    Upload your raw .fig or .zip file. When users click "Download", this exact file will download directly to their computer!
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".fig,.zip,.sketch,.xd,.svg,.pdf,.rar,.7z,.tar,.gz"
                    onChange={handleAssetFileSelect}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 rounded-3xl p-8 text-center transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-display font-bold text-foreground mb-1">
                      Click or drag & drop design file here
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Supports .FIG, .ZIP, .SKETCH, .XD, .SVG, .PDF, .RAR, .7Z (Auto calculates size)
                    </p>
                  </div>
                </div>

                {/* Attached File Indicator */}
                {attachedFile && (
                  <div className="p-4 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-mono font-bold text-xs">
                        .{attachedFile.format}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground truncate max-w-xs">
                          {attachedFile.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Size: <span className="text-primary font-bold">{form.file_size}</span> · Format: {attachedFile.format} · <span className="text-emerald-500 font-bold">Staged for Save</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFile(null);
                        setPendingAssetFile(null);
                        setForm((prev) => ({ ...prev, download_file_url: "" }));
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                {/* Fallback Direct Download URL input */}
                <div>
                  <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                    Or Direct Download File URL
                  </label>
                  <input
                    value={form.download_file_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, download_file_url: e.target.value }))
                    }
                    placeholder="https://your-storage-bucket.com/files/kit.fig"
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                      Calculated File Size (Auto-Populated)
                    </label>
                    <input
                      value={form.file_size}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, file_size: e.target.value }))
                      }
                      placeholder="e.g. 48.5 MB or 650 KB"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                      Format Label
                    </label>
                    <input
                      value={form.formats}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, formats: e.target.value }))
                      }
                      placeholder="Figma (.fig)"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: COVER & GALLERY SCREENSHOTS ──────────────────────── */}
            {activeFormTab === "media" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Thumbnail Cover */}
                <div>
                  <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                    Featured Cover Image *
                  </label>

                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    className="hidden"
                  />

                  <div className="grid sm:grid-cols-2 gap-4 items-start">
                    <div
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-primary/50 bg-background/50 hover:bg-primary/5 rounded-2xl p-6 text-center transition-all cursor-pointer group"
                    >
                      <ImageIcon
                        size={24}
                        className="mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors"
                      />
                      <p className="text-xs font-bold text-foreground">Select Cover Image</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        PNG, JPG, WebP (Uploaded on Submit)
                      </p>
                    </div>

                    {form.thumbnail_url ? (
                      <div className="relative rounded-2xl overflow-hidden border border-border bg-card aspect-[16/10] group">
                        <img
                          src={form.thumbnail_url}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPendingThumbnailFile(null);
                            setForm((prev) => ({ ...prev, thumbnail_url: "" }));
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-destructive transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-border/60 bg-muted/20 aspect-[16/10] flex items-center justify-center text-xs font-mono text-muted-foreground">
                        No cover selected
                      </div>
                    )}
                  </div>

                  <input
                    value={form.thumbnail_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, thumbnail_url: e.target.value }))
                    }
                    placeholder="Or paste direct image URL (https://...)"
                    className={`${inputCls} font-mono mt-3`}
                  />
                </div>

                {/* Gallery Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide font-bold">
                      Gallery & Showcase Screens ({galleryUrls.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="text-xs font-mono text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Screens
                    </button>
                  </div>

                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGallerySelect}
                    className="hidden"
                  />

                  {galleryUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {galleryUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-xl overflow-hidden border border-border aspect-[3/2] group"
                        >
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setGalleryUrls((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-destructive transition-colors cursor-pointer"
                          >
                            <X size={11} />
                          </button>
                          <span className="absolute bottom-1 left-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-white">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-2xl p-6 text-center text-muted-foreground hover:border-primary/40 cursor-pointer"
                    >
                      <ImageIcon size={20} className="mx-auto mb-1.5 opacity-40" />
                      <p className="text-xs font-bold">No gallery screenshots added</p>
                      <p className="text-[10px] font-mono mt-0.5">
                        Upload multi-screen previews for the fullscreen Lightbox
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 4: SPECS & FIGMA FEATURES ───────────────────────────── */}
            {activeFormTab === "specs" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                      Screens Count
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
                    <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                      Components Count
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

                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                      Version
                    </label>
                    <input
                      value={form.version}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, version: e.target.value }))
                      }
                      placeholder="v1.0.0"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-bold">
                    Figma Community Preview URL (Optional External Link)
                  </label>
                  <input
                    value={form.figma_preview_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, figma_preview_url: e.target.value }))
                    }
                    placeholder="https://www.figma.com/community/file/..."
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-2.5 font-bold">
                    Figma Ecosystem Features
                  </label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      ["supports_variables", "Figma Variables"],
                      ["supports_auto_layout", "Auto Layout 5.0"],
                      ["supports_light_dark", "Light & Dark Mode"],
                    ].map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 p-3 rounded-xl border border-border bg-background/60 text-xs font-semibold cursor-pointer hover:border-primary/40 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={(form as any)[key]}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, [key]: e.target.checked }))
                          }
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Upload progress banner */}
            {uploadProgress && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>{uploadProgress}</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                {activeFormTab !== "essentials" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeFormTab === "files") setActiveFormTab("essentials");
                      if (activeFormTab === "media") setActiveFormTab("files");
                      if (activeFormTab === "specs") setActiveFormTab("media");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Back
                  </button>
                )}

                {activeFormTab !== "specs" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeFormTab === "essentials") setActiveFormTab("files");
                      if (activeFormTab === "files") setActiveFormTab("media");
                      if (activeFormTab === "media") setActiveFormTab("specs");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold cursor-pointer"
                  >
                    Next Step →
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:shadow-[0_0_25px_rgba(170,255,56,0.3)] transition-all cursor-pointer disabled:opacity-60 shadow-md"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>{editingId ? "Save Changes" : "Publish Free Resource"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: LIVE PRODUCTS DIRECTORY (5 Cols) ───────────────────────── */}
        <div className="xl:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-foreground">
                All Products ({products.length})
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground">
                100% Free Resources
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary/60"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary/60 font-mono cursor-pointer"
              >
                <option value="all">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Items List */}
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-muted-foreground">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                Loading resources...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-muted-foreground border border-border rounded-2xl bg-card">
                No products found matching filters.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isCurrent = editingId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {p.thumbnail_url ? (
                        <img
                          src={p.thumbnail_url}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                          <Package size={20} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-foreground truncate">
                            {p.title}
                          </h4>
                          {p.download_file_url && (
                            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono font-bold shrink-0">
                              Direct File ✅
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                          {p.categories?.name || "General"} · {p.file_size || "45 MB"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(p)}
                          title="Edit Resource"
                          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          title="Delete Resource"
                          className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}