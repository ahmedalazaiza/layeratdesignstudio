import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function GiftSettingsPanel() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    download_url: "",
    file_name: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("gift_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (!error && data) {
        setForm({
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || "",
          download_url: data.download_url || "",
          file_name: data.file_name || "",
          is_active: data.is_active ?? true,
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("gift_settings").upsert({
      id: 1,
      title: form.title,
      description: form.description,
      image_url: form.image_url || null,
      download_url: form.download_url || null,
      file_name: form.file_name || null,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setMessage(error ? error.message : "Gift settings saved.");
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground">Loading gift settings...</div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 max-w-2xl">
      <h2 className="text-lg font-display font-bold text-foreground mb-1">
        Gift Popup Settings
      </h2>
      <p className="text-xs text-muted-foreground mb-6">
        Control the gift shown to visitors: title, description, image, and
        download link.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
            Title
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
            Image URL
          </label>
          <input
            value={form.image_url}
            onChange={(e) =>
              setForm((f) => ({ ...f, image_url: e.target.value }))
            }
            placeholder="https://..."
            className={inputCls}
          />
          {form.image_url && (
            <img
              src={form.image_url}
              alt=""
              className="mt-3 w-full max-w-sm h-40 object-cover rounded-xl border border-border"
            />
          )}
        </div>

        <div>
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
            Download URL
          </label>
          <input
            value={form.download_url}
            onChange={(e) =>
              setForm((f) => ({ ...f, download_url: e.target.value }))
            }
            placeholder="https://..."
            className={inputCls}
          />
        </div>

        <div>
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
            File Name
          </label>
          <input
            value={form.file_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, file_name: e.target.value }))
            }
            placeholder="gift.fig"
            className={inputCls}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_active: e.target.checked }))
            }
          />
          Gift popup is active
        </label>

        {message && (
          <div className="text-sm text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Gift Settings"}
        </button>
      </form>
    </div>
  );
}

export { GiftSettingsPanel };