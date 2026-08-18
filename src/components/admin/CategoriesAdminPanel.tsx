import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Layers,
  Layout,
  FileText,
  Package,
  Smartphone,
  Globe,
  Code,
  Zap,
} from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  Layers,
  Layout,
  FileText,
  Package,
  Smartphone,
  Globe,
  Code,
  Zap,
};

const iconSelectOptions = [
  { value: "Layers", label: "Layers", icon: Layers },
  { value: "Layout", label: "Layout", icon: Layout },
  { value: "FileText", label: "FileText", icon: FileText },
  { value: "Package", label: "Package", icon: Package },
  { value: "Smartphone", label: "Smartphone", icon: Smartphone },
  { value: "Globe", label: "Globe", icon: Globe },
  { value: "Code", label: "Code", icon: Code },
  { value: "Zap", label: "Zap", icon: Zap },
];

interface CategoriesAdminPanelProps {
  categories?: any[];
}

export function CategoriesAdminPanel({ categories: initialCategories }: CategoriesAdminPanelProps = {}) {
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [subForm, setSubForm] = useState({
    category_id: "",
    name: "",
    slug: "",
  });
  const [subSaving, setSubSaving] = useState(false);

  const emptyForm = {
    name: "",
    slug: "",
    icon: "Layers",
    color: "#aaff38",
    sort_order: 0,
  };

  const [form, setForm] = useState(emptyForm);

  const loadCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) console.error(error);
    setCategories(data || []);

    const { data: subs } = await supabase
      .from("subcategories")
      .select("*")
      .order("sort_order", { ascending: true });
    setSubcategories(subs || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const generateSlug = (name: string) =>
    name
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
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      icon: cat.icon || "Layers",
      color: cat.color || "#aaff38",
      sort_order: cat.sort_order || 0,
    });
    setError("");
    setSuccess("");
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.category_id || !subForm.name.trim() || !subForm.slug.trim())
      return;
    setSubSaving(true);
    const { error } = await supabase.from("subcategories").insert({
      category_id: subForm.category_id,
      name: subForm.name.trim(),
      slug: subForm.slug.trim(),
      sort_order: 0,
    });
    setSubSaving(false);
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Subcategory added.");
    setSubForm({ category_id: "", name: "", slug: "" });
    loadCategories();
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("Delete this subcategory?")) return;
    const { error } = await supabase.from("subcategories").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    toast.success("Subcategory deleted.");
    loadCategories();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      icon: form.icon,
      color: form.color,
      sort_order: Number(form.sort_order) || 0,
    };

    const result = editingId
      ? await supabase.from("categories").update(payload).eq("id", editingId)
      : await supabase.from("categories").insert(payload);

    setSaving(false);

    if (result.error) {
      if (result.error.code === "23505") {
        setError("This slug already exists.");
      } else {
        setError(result.error.message || "Something went wrong.");
      }
      return;
    }

    const msg = editingId ? "Category updated." : "Category created.";
    setSuccess(msg);
    toast.success(msg);
    resetForm();
    loadCategories();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}" and its subcategories?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    toast.success("Category deleted.");
    if (editingId === id) resetForm();
    loadCategories();
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  const categorySelectOptions = [
    { value: "", label: "Select Parent Category" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* LEFT: Form */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Categories group resources across the platform.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Name *
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: editingId ? f.slug : generateSlug(e.target.value),
                  }))
                }
                className={inputCls}
                required
                placeholder="e.g. UI Kits"
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
                placeholder="ui-kits"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CustomSelect
                label="Icon"
                options={iconSelectOptions}
                value={form.icon}
                onChange={(v) => setForm((f) => ({ ...f, icon: v }))}
              />

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className="w-11 h-11 rounded-xl border border-border p-1 bg-background cursor-pointer"
                  />
                  <input
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className={`${inputCls} font-mono`}
                    placeholder="#aaff38"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                }
                className={inputCls}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive-foreground bg-destructive/15 border border-destructive/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 font-medium">
                <CheckCircle size={15} /> {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all shadow-md shadow-primary/10 cursor-pointer"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Save Category"
                : "Create Category"}
            </button>
          </form>
        </div>

        {/* Add Subcategory Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-display font-bold text-foreground mb-1">
            Add Subcategory
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Subcategories provide more detailed grouping for resources.
          </p>

          <form onSubmit={handleAddSubcategory} className="space-y-4">
            <CustomSelect
              label="Parent Category *"
              options={categorySelectOptions}
              value={subForm.category_id}
              onChange={(v) => setSubForm((f) => ({ ...f, category_id: v }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Subcategory Name *
                </label>
                <input
                  value={subForm.name}
                  onChange={(e) =>
                    setSubForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    }))
                  }
                  className={inputCls}
                  required
                  placeholder="e.g. Mobile Apps"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                  Slug *
                </label>
                <input
                  value={subForm.slug}
                  onChange={(e) =>
                    setSubForm((f) => ({
                      ...f,
                      slug: generateSlug(e.target.value),
                    }))
                  }
                  className={`${inputCls} font-mono`}
                  required
                  placeholder="mobile-apps"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={subSaving || !subForm.category_id}
              className="w-full py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 transition-all cursor-pointer"
            >
              {subSaving ? "Adding..." : "+ Add Subcategory"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">
            Categories ({categories.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No categories yet.
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[75vh] overflow-y-auto">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] || Layers;
              const subs = subcategories.filter(
                (s) => s.category_id === cat.id
              );

              return (
                <div key={cat.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${cat.color}15`,
                          border: `1px solid ${cat.color}30`,
                        }}
                      >
                        <Icon size={18} style={{ color: cat.color }} />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">
                          {cat.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {cat.slug}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="px-3 py-1.5 rounded-lg border border-destructive/30 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Subcategories list */}
                  {subs.length > 0 && (
                    <div className="pl-12 flex flex-wrap gap-2">
                      {subs.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1.5 text-xs bg-muted/60 text-muted-foreground px-2.5 py-1 rounded-lg border border-border/50 group"
                        >
                          {s.name}
                          <button
                            type="button"
                            onClick={() => handleDeleteSubcategory(s.id)}
                            className="text-muted-foreground/60 hover:text-destructive transition-colors ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
