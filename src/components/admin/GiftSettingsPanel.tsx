import React, { useEffect, useState } from "react";
import {
  Gift,
  Save,
  Upload,
  FileCode,
  CheckCircle,
  AlertCircle,
  FileArchive,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export function GiftSettingsPanel() {
  const [form, setForm] = useState({
    title: "Free Figma Starter Kit",
    description: "50+ components · 3 themes · Variables-ready",
    image_url: "https://images.unsplash.com/photo-1637944059054-7091ca8efe14?w=600&q=80&fit=crop",
    download_url: "",
    file_name: "layerat-starter-kit.fig",
    file_format: "fig",
    file_size: "45 MB",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("gift_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (!error && data) {
          setForm({
            title: data.title || "Free Figma Starter Kit",
            description: data.description || "50+ components · 3 themes · Variables-ready",
            image_url: data.image_url || "https://images.unsplash.com/photo-1637944059054-7091ca8efe14?w=600&q=80&fit=crop",
            download_url: data.download_url || "",
            file_name: data.file_name || "layerat-starter-kit.fig",
            file_format: (data as any).file_format || "fig",
            file_size: (data as any).file_size || "45 MB",
            is_active: data.is_active ?? true,
          });
        }
      } catch (err) {
        console.error("Error loading gift settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileUploading(true);
      const ext = file.name.split(".").pop()?.toLowerCase() || "fig";
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";

      // If under 10MB we can generate data URL or file reader, otherwise set file name & format
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({
          ...prev,
          file_name: file.name,
          file_format: ext,
          file_size: sizeMB,
          download_url: typeof reader.result === "string" ? reader.result : prev.download_url,
        }));
        toast.success(`Attached file: ${file.name} (${sizeMB})`);
        setFileUploading(false);
      };
      reader.onerror = () => {
        setForm((prev) => ({
          ...prev,
          file_name: file.name,
          file_format: ext,
          file_size: sizeMB,
        }));
        toast.success(`File details updated: ${file.name}`);
        setFileUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File attach error:", err);
      setFileUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase.from("gift_settings").upsert({
        id: 1,
        title: form.title,
        description: form.description,
        image_url: form.image_url || null,
        download_url: form.download_url || null,
        file_name: form.file_name || null,
        file_format: form.file_format || "fig",
        file_size: form.file_size || "45 MB",
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Gift Starter Kit settings saved successfully!");
    } catch (err: any) {
      console.error("Save gift error:", err);
      toast.error(err.message || "Failed to save gift settings.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all";

  if (loading) {
    return (
      <div className="p-16 text-center text-muted-foreground">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono">Loading gift settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-2">
            <Gift size={13} /> Marketing Lead Magnet
          </div>
          <h2 className="text-2xl font-display font-extrabold text-foreground">
            Free Gift Starter Kit Configuration
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Configure the exclusive design file (.fig, .zip, .sketch, .xd) gifted upon email verification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border bg-card text-xs font-bold cursor-pointer hover:border-primary/40 transition-all">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
              className="accent-primary w-4 h-4 cursor-pointer"
            />
            <span>{form.is_active ? "🟢 Popup Active" : "🔴 Popup Disabled"}</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Description */}
          <div className="p-6 rounded-3xl border border-border bg-card space-y-4">
            <h3 className="text-sm font-display font-bold text-foreground">
              Kit Details & Copywriting
            </h3>

            <div>
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-semibold">
                Gift Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
                placeholder="e.g. Free Figma Starter Kit"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-semibold">
                Description / Highlights
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="50+ components · 3 themes · Variables-ready"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-semibold">
                Cover Image URL
              </label>
              <input
                value={form.image_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image_url: e.target.value }))
                }
                placeholder="https://images.unsplash.com/..."
                className={inputCls}
              />
            </div>
          </div>

          {/* File & Formats Management */}
          <div className="p-6 rounded-3xl border border-border bg-card space-y-5">
            <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
              <FileCode size={16} className="text-primary" /> File Package & Design Formats
            </h3>

            {/* Format Chooser */}
            <div>
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-semibold">
                Primary File Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "fig", label: ".FIG (Figma)", icon: Layers },
                  { id: "zip", label: ".ZIP (Archive)", icon: FileArchive },
                  { id: "sketch", label: ".SKETCH", icon: FileCode },
                  { id: "xd", label: ".XD (Adobe)", icon: FileCode },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  const selected = form.file_format === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          file_format: fmt.id,
                          file_name: f.file_name.replace(/\.[^/.]+$/, `.${fmt.id}`),
                        }))
                      }
                      className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        selected
                          ? "bg-primary/10 border-primary text-primary shadow-sm"
                          : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File Name & Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-semibold">
                  File Name
                </label>
                <input
                  value={form.file_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, file_name: e.target.value }))
                  }
                  placeholder="layerat-starter-kit.fig"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-semibold">
                  Estimated File Size
                </label>
                <input
                  value={form.file_size}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, file_size: e.target.value }))
                  }
                  placeholder="e.g. 45 MB"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Direct File Upload / URL */}
            <div>
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-semibold">
                Download Link or Direct File Attachment
              </label>
              <input
                value={form.download_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, download_url: e.target.value }))
                }
                placeholder="https://drive.google.com/... or direct CDN link"
                className={inputCls}
              />

              <div className="mt-3 flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-mono font-bold cursor-pointer transition-all">
                  <Upload size={13} />
                  <span>{fileUploading ? "Attaching File..." : "Attach Local Design File (.fig / .zip)"}</span>
                  <input
                    type="file"
                    accept=".fig,.zip,.sketch,.xd,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Target: {form.file_name} ({form.file_size})
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.3)] transition-all cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} /> Save Gift Settings
              </>
            )}
          </button>
        </div>

        {/* Right 1 Column: Live Popup Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
            <Sparkles size={15} className="text-primary" /> Live Popup Preview
          </h3>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-lg space-y-4">
            <div className="relative h-40 rounded-2xl overflow-hidden border border-border">
              <img
                src={form.image_url || "https://images.unsplash.com/photo-1637944059054-7091ca8efe14?w=600&q=80&fit=crop"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold font-mono">
                  .{form.file_format.toUpperCase()} · {form.file_size}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold text-foreground text-base">
                {form.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {form.description}
              </p>
            </div>

            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Verification required:</span>
                <span className="text-amber-400 font-bold">Yes (Enforced)</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-1">
                <span>File Format:</span>
                <span className="text-primary font-bold">.{form.file_format.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}