"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  FileArchive,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
  ArrowLeft,
  X,
  FileCode,
} from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { publisherService } from "@/services/publisherService";
import {
  publisherProductSchema,
  type PublisherProductFormData,
} from "@/lib/validations/publisher";
import { toast } from "sonner";
import type { Category, Tag } from "@/types/api";

const FILE_FORMAT_OPTIONS = [
  "Figma (.fig)",
  "Figma Community Link",
  "Design Tokens (.json)",
  "React Components (.tsx)",
  "HTML / CSS Templates",
  "Documentation (.pdf)",
  "Icons (.svg)",
  "Illustration Assets (.png)",
];

export function PublisherProductStudio() {
  const router = useRouter();

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [zipArchiveFile, setZipArchiveFile] = useState<File | null>(null);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const previewsInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
  });

  // 2. Fetch Tags
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => categoryService.getTags(),
  });

  // 3. React Hook Form Setup
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PublisherProductFormData>({
    resolver: zodResolver(publisherProductSchema),
    defaultValues: {
      title: "",
      price: 0,
      overview: "",
      category: "",
      subCategories: [],
      tags: [],
      highlights: [
        { value: "Figma Variables & Token Ready" },
        { value: "Auto-Layout 5.0 on all screens" },
        { value: "Light & Dark Mode Included" },
      ],
      includedFiles: ["Figma (.fig)"],
    },
  });

  const selectedCategoryId = watch("category");
  const selectedSubCategories = watch("subCategories") || [];
  const selectedTags = watch("tags") || [];
  const selectedFiles = watch("includedFiles") || [];

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control,
    name: "highlights",
  });

  // Cascading subcategories for the selected category
  const activeCategoryObj = categories.find(
    (c) => (c.slug || c._id || c.id) === selectedCategoryId
  );
  const availableSubcategories = activeCategoryObj?.subcategories || [];

  // Toggle Subcategory Checkbox
  const toggleSubCategory = (subId: string) => {
    const current = [...selectedSubCategories];
    const exists = current.includes(subId);
    const updated = exists ? current.filter((id) => id !== subId) : [...current, subId];
    setValue("subCategories", updated);
  };

  // Toggle Tag Pill
  const toggleTag = (tagName: string) => {
    const current = [...selectedTags];
    const exists = current.includes(tagName);
    const updated = exists ? current.filter((t) => t !== tagName) : [...current, tagName];
    setValue("tags", updated);
  };

  // Toggle Included File Format
  const toggleFileFormat = (format: string) => {
    const current = [...selectedFiles];
    const exists = current.includes(format);
    const updated = exists ? current.filter((f) => f !== format) : [...current, format];
    setValue("includedFiles", updated);
  };

  // Thumbnail selection handler
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Thumbnail must be an image file (JPG, PNG, WEBP)");
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // Multiple preview gallery selection handler
  const handlePreviewsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newFiles = [...previewFiles, ...files];
    setPreviewFiles(newFiles);
    setPreviewUrls(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const removePreview = (index: number) => {
    const updatedFiles = previewFiles.filter((_, i) => i !== index);
    setPreviewFiles(updatedFiles);
    setPreviewUrls(updatedFiles.map((f) => URL.createObjectURL(f)));
  };

  // ZIP Archive File selection handler
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setZipArchiveFile(file);
  };

  // 4. Form Submit
  const onSubmit = async (data: PublisherProductFormData) => {
    if (!thumbnailFile) {
      toast.error("Cover thumbnail image is required");
      return;
    }

    if (!zipArchiveFile) {
      toast.error("Product file package (.zip / .fig) is required");
      return;
    }

    try {
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("price", String(data.price));
      formData.append("overview", data.overview);
      formData.append("category", data.category);

      data.subCategories?.forEach((sub) => {
        formData.append("subCategory[]", sub);
      });

      data.tags.forEach((tag) => {
        formData.append("tags[]", tag);
      });

      data.highlights.forEach((h) => {
        formData.append("highlights[]", h.value);
      });

      data.includedFiles.forEach((f) => {
        formData.append("includedFiles[]", f);
      });

      formData.append("thumbnail", thumbnailFile);

      previewFiles.forEach((imgFile) => {
        formData.append("previewImages", imgFile);
      });

      formData.append("zipFile", zipArchiveFile);

      await publisherService.createProduct(formData, (percent) => {
        setUploadProgress(percent);
      });

      toast.success("Product published successfully!", {
        description: "Your design resource is now live in the studio.",
      });

      reset();
      router.push("/publisher/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to upload product";
      toast.error(msg);
    } finally {
      setUploadProgress(null);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-sm";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Header Bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-primary font-bold">
            <Sparkles size={13} />
            <span>Publisher Product Studio</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Upload New Design Resource
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Publish your Figma UI kits, dashboard templates, and mobile systems.
          </p>
        </div>

        {/* Upload Progress Bar Overlay */}
        {uploadProgress !== null && (
          <div className="mb-8 p-6 rounded-3xl border border-primary/40 bg-card shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-foreground font-bold flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-primary" />
                Uploading assets to AWS S3 storage...
              </span>
              <span className="text-primary font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* ── Section 1: Basic Information ── */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-lg font-display font-bold text-foreground">
              1. Resource Details
            </h2>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  Resource Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="e.g., Nova SaaS Dashboard UI Kit"
                  className={inputClass}
                />
                {errors.title && (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  Price (USD) <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0"
                    className={`${inputClass} pl-8 font-mono`}
                  />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground mt-1 block">
                  Set $0 for 100% Free download
                </span>
                {errors.price && (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>

            {/* Overview / Description */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                Product Overview & Description <span className="text-primary">*</span>
              </label>
              <textarea
                rows={4}
                {...register("overview")}
                placeholder="Comprehensive SaaS design kit crafted in Figma with 120+ screens, 400+ components, variable spacing, and light/dark theme..."
                className={`${inputClass} resize-none`}
              />
              {errors.overview && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.overview.message}
                </p>
              )}
            </div>
          </div>

          {/* ── Section 2: Taxonomy & Categories ── */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-lg font-display font-bold text-foreground">
              2. Categorization & Tags
            </h2>

            {/* Category Dropdown */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                Main Category <span className="text-primary">*</span>
              </label>
              <select {...register("category")} className={inputClass}>
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c._id || c.id} value={c.slug || c._id || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Cascading Subcategories Checkboxes */}
            {availableSubcategories.length > 0 && (
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-medium">
                  Subcategories (Select Applicable)
                </label>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  {availableSubcategories.map((sub) => {
                    const subId = sub.slug || sub._id || sub.id || "";
                    const isChecked = selectedSubCategories.includes(subId);
                    return (
                      <button
                        key={subId}
                        type="button"
                        onClick={() => toggleSubCategory(subId)}
                        className={`p-3 rounded-2xl border text-left text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                          isChecked
                            ? "bg-primary/10 border-primary text-primary font-bold"
                            : "border-border bg-background hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        {isChecked && <Check size={14} className="text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags Pills */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-medium">
                Design Tags <span className="text-primary">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const tagName = t.slug || t.name;
                  const isChecked = selectedTags.includes(tagName);
                  return (
                    <button
                      key={t._id || t.id || tagName}
                      type="button"
                      onClick={() => toggleTag(tagName)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                        isChecked
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "bg-background border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      #{t.name}
                    </button>
                  );
                })}
              </div>
              {errors.tags && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.tags.message}
                </p>
              )}
            </div>
          </div>

          {/* ── Section 3: Features & Included Files ── */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-lg font-display font-bold text-foreground">
              3. Features & Formats
            </h2>

            {/* Highlights Array */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block font-medium">
                  Key Feature Highlights <span className="text-primary">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => appendHighlight({ value: "" })}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer font-mono"
                >
                  <Plus size={13} /> Add Feature
                </button>
              </div>

              {highlightFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    {...register(`highlights.${index}.value` as const)}
                    placeholder="e.g., 100% Vector & Scalable Components"
                    className={inputClass}
                  />
                  {highlightFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="p-3 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {errors.highlights && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.highlights.message}
                </p>
              )}
            </div>

            {/* Included Files Selector */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-medium">
                Included File Formats <span className="text-primary">*</span>
              </label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {FILE_FORMAT_OPTIONS.map((format) => {
                  const isChecked = selectedFiles.includes(format);
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => toggleFileFormat(format)}
                      className={`p-3 rounded-2xl border text-left text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-primary/10 border-primary text-primary font-bold"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className="truncate">{format}</span>
                      {isChecked && <Check size={14} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {errors.includedFiles && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.includedFiles.message}
                </p>
              )}
            </div>
          </div>

          {/* ── Section 4: File Uploads ── */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-display font-bold text-foreground">
              4. Media & File Package
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Cover Thumbnail */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-medium">
                  Cover Thumbnail (16:10 Aspect Ratio) <span className="text-primary">*</span>
                </label>
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="h-44 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-background flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden relative group transition-colors"
                >
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center space-y-1">
                      <ImageIcon size={28} className="mx-auto text-muted-foreground/50" />
                      <p className="text-xs font-bold text-foreground">Upload Thumbnail</p>
                      <p className="text-[10px] text-muted-foreground font-mono">PNG, JPG, WEBP (Max 5MB)</p>
                    </div>
                  )}
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </div>
              </div>

              {/* ZIP Archive File */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-medium">
                  Product Archive (.ZIP / .FIG) <span className="text-primary">*</span>
                </label>
                <div
                  onClick={() => zipInputRef.current?.click()}
                  className="h-44 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-background flex flex-col items-center justify-center p-4 cursor-pointer relative transition-colors"
                >
                  {zipArchiveFile ? (
                    <div className="text-center space-y-2">
                      <FileArchive size={32} className="mx-auto text-primary" />
                      <p className="text-xs font-bold text-foreground truncate max-w-xs">{zipArchiveFile.name}</p>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {(zipArchiveFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <FileArchive size={28} className="mx-auto text-muted-foreground/50" />
                      <p className="text-xs font-bold text-foreground">Select .ZIP / .FIG File</p>
                      <p className="text-[10px] text-muted-foreground font-mono">Archive containing all Figma files</p>
                    </div>
                  )}
                  <input
                    ref={zipInputRef}
                    type="file"
                    accept=".zip,.fig,.rar,.7z"
                    className="hidden"
                    onChange={handleZipChange}
                  />
                </div>
              </div>
            </div>

            {/* Gallery Previews */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block font-medium">
                  Gallery Previews (Multiple Images)
                </label>
                <button
                  type="button"
                  onClick={() => previewsInputRef.current?.click()}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer font-mono"
                >
                  <Plus size={13} /> Add Screenshots
                </button>
              </div>

              <input
                ref={previewsInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePreviewsChange}
              />

              {previewUrls.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative h-20 rounded-xl overflow-hidden border border-border group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePreview(i)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-mono italic">
                  No preview images added yet. Click "Add Screenshots" to showcase your Figma screens.
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted text-foreground font-bold text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadProgress !== null}
              className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting || uploadProgress !== null ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Publishing Product...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Publish to Studio Library
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PublisherProductStudio;
