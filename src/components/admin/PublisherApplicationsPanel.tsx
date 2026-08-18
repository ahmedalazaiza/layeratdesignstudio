import React, { useEffect, useState } from "react";
import {
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Mail,
  Search,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { CustomSelect } from "../ui/CustomSelect";

export function PublisherApplicationsPanel() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("publisher_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApps(data || []);
    } catch (err: any) {
      console.error("Error loading publisher applications:", err);
      toast.error("Failed to load publisher applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    try {
      setUpdatingId(id);
      const { error } = await supabase
        .from("publisher_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      toast.success(
        `Application marked as ${newStatus.toUpperCase()}!`
      );
    } catch (err: any) {
      console.error("Error updating application status:", err);
      toast.error(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, applicantName: string) => {
    if (!window.confirm(`Delete application for ${applicantName}?`)) return;

    try {
      const { error } = await supabase
        .from("publisher_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setApps((prev) => prev.filter((a) => a.id !== id));
      toast.success("Application deleted.");
    } catch (err: any) {
      console.error("Error deleting application:", err);
      toast.error("Failed to delete application.");
    }
  };

  const filtered = apps.filter((app) => {
    if (statusFilter !== "all" && (app.status || "pending") !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = app.name?.toLowerCase().includes(q);
      const matchEmail = app.email?.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Publisher & Creator Applications
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Review design portfolios, evaluate creator experience, and grant publishing permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by designer or email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status Filter */}
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: "all", label: `All Statuses (${apps.length})` },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
            className="w-48 text-xs font-mono"
          />
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-16 text-center text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono">Loading applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-16 text-center text-muted-foreground">
          <FileCheck size={36} className="mx-auto mb-3 opacity-30 text-primary" />
          <p className="font-semibold text-foreground">No publisher applications found.</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Designers who submit via the /publisher page will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Portfolio & Links</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((app) => {
                  const status = app.status || "pending";

                  return (
                    <tr key={app.id} className="hover:bg-muted/10 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">
                          {app.name}
                        </div>
                        <a
                          href={`mailto:${app.email}`}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-mono mt-0.5"
                        >
                          <Mail size={11} /> {app.email}
                        </a>
                      </td>

                      {/* Portfolio */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {app.portfolio ? (
                            <a
                              href={
                                app.portfolio.startsWith("http")
                                  ? app.portfolio
                                  : `https://${app.portfolio}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <ExternalLink size={12} /> Portfolio
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                          {app.social && (
                            <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                              {app.social}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                        {app.experience ? `${app.experience} yrs` : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                            status === "approved"
                              ? "bg-green-500/10 text-green-500 border-green-500/30"
                              : status === "rejected"
                              ? "bg-destructive/10 text-destructive border-destructive/30"
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                          }`}
                        >
                          {status === "approved" && <CheckCircle size={12} />}
                          {status === "rejected" && <XCircle size={12} />}
                          {status === "pending" && <Clock size={12} />}
                          {status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                        {app.created_at
                          ? new Date(app.created_at).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status !== "approved" && (
                            <button
                              disabled={updatingId === app.id}
                              onClick={() =>
                                handleUpdateStatus(app.id, "approved")
                              }
                              className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all text-xs font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {status !== "rejected" && (
                            <button
                              disabled={updatingId === app.id}
                              onClick={() =>
                                handleUpdateStatus(app.id, "rejected")
                              }
                              className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all text-xs font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(app.id, app.name)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}