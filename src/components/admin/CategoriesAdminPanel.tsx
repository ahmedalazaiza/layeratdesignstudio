import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Layers } from "lucide-react";
import { supabase } from "../../lib/supabase";

function CategoriesAdminPanel() {
  const [categories, setCategories] = useState<any[]>([]);
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
  const iconOptions = [
    "Layers",
    "Layout",
    "FileText",
    "Package",
    "Smartphone",
    "Globe",
    "Code",
    "Zap",
  ];

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
      return;
    }
    setSubForm({ category_id: "", name: "", slug: "" });
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

    setSuccess(editingId ? "Category updated." : "Category created.");
    resetForm();
    loadCategories();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* LEFT: Form */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">
              {editingId ? "Edit Category" : "Add Category"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {editingId
                ? "Update category details then save."
                : "Create a category for navbar and browse filters."}
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
              placeholder="e.g. UI Kits"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              placeholder="ui-kits"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
              Icon
            </label>
            <select
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, color: e.target.value }))
                  }
                  className="w-12 h-11 rounded-xl border border-border bg-background"
                />
                <input
                  value={form.color}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, color: e.target.value }))
                  }
                  className="flex-1 min-w-0 px-3 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
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
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
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
              : "Create Category"}
          </button>
        </form>
      </div>

      {/* RIGHT: List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-lg font-display font-bold text-foreground">
            Existing Categories
          </h2>
          {subForm.category_id && (
            <form
              onSubmit={handleAddSubcategory}
              className="mt-4 p-4 rounded-xl border border-border bg-muted/20 space-y-3"
            >
              <div className="text-sm font-medium text-foreground">
                Add subcategory under:{" "}
                {categories.find((c) => c.id === subForm.category_id)?.name}
              </div>
              <input
                value={subForm.name}
                onChange={(e) =>
                  setSubForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/\s+/g, "-"),
                  }))
                }
                placeholder="Subcategory name"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                required
              />
              <input
                value={subForm.slug}
                onChange={(e) =>
                  setSubForm((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder="slug"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={subSaving}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                >
                  {subSaving ? "Saving..." : "Save subcategory"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSubForm({ category_id: "", name: "", slug: "" })
                  }
                  className="px-4 py-2 rounded-lg border border-border text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No categories yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`px-5 py-4 flex flex-wrap items-center gap-4 ${
                  editingId === cat.id ? "bg-primary/5" : ""
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-border"
                  style={{
                    backgroundColor: `${cat.color}22`,
                    color: cat.color,
                  }}
                >
                  <Layers size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {cat.name}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {cat.slug} · {cat.icon} · #{cat.sort_order}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(cat)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  Edit
                </button>
                <div className="basis-full mt-2 space-y-1">
                  {subcategories
                    .filter((s) => s.category_id === cat.id)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="text-xs text-muted-foreground font-mono"
                      >
                        — {s.name}
                      </div>
                    ))}
                  <button
                    type="button"
                    onClick={() =>
                      setSubForm({ category_id: cat.id, name: "", slug: "" })
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    + Add subcategory
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

export { CategoriesAdminPanel };
