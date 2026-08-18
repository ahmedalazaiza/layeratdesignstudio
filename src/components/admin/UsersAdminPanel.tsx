import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  Trash2,
  CheckCircle,
  AlertCircle,
  Mail,
  Calendar,
  Filter,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import type { AuthUser } from "../../types";

export function UsersAdminPanel({
  currentAuthUser,
}: {
  currentAuthUser: AuthUser | null;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error("Error loading users:", err);
      toast.error("Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateRole = async (
    userId: string,
    newRole: "user" | "creator" | "admin"
  ) => {
    try {
      setUpdatingId(userId);
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`User role updated to ${newRole.toUpperCase()}!`);
    } catch (err: any) {
      console.error("Update role error:", err);
      toast.error(err.message || "Failed to update role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProfile = async (userId: string, userName: string) => {
    if (userId === currentAuthUser?.id) {
      toast.error("You cannot delete your own admin account.");
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to remove user "${userName || "this user"}"?`
    );
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (error) throw error;

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User profile removed.");
    } catch (err: any) {
      console.error("Delete user error:", err);
      toast.error("Failed to delete user profile.");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && (u.role || "user") !== roleFilter) return false;
    if (providerFilter !== "all") {
      const p = (u.provider || "email").toLowerCase();
      if (p !== providerFilter.toLowerCase()) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.full_name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchId = u.id?.toLowerCase().includes(q);
      return matchName || matchEmail || matchId;
    }
    return true;
  });

  const renderProviderBadge = (provider?: string) => {
    const p = (provider || "email").toLowerCase();
    if (p === "google") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold">
          <svg className="w-3 h-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </span>
      );
    }
    if (p === "facebook") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 text-xs font-mono font-bold">
          <svg className="w-3 h-3 fill-[#1877F2]" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border text-xs font-mono font-bold">
        <Mail size={12} />
        Email & Password
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-2">
            <Users size={13} /> User Accounts & OAuth Directory
          </div>
          <h2 className="text-2xl font-display font-extrabold text-foreground">
            Registered Designers & Auth Methods
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Monitor auth providers (Google, Facebook, Email), grant publisher roles, and manage accounts
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
              placeholder="Search by name, email, or ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Provider Filter */}
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary/60 cursor-pointer font-mono"
          >
            <option value="all">All Providers</option>
            <option value="google">Google OAuth</option>
            <option value="facebook">Facebook OAuth</option>
            <option value="email">Email & Password</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary/60 cursor-pointer font-mono"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="user">Standard Users</option>
            <option value="creator">Creators / Publishers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-16 text-center text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono">Loading user directory...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-16 text-center text-muted-foreground">
          <Users size={36} className="mx-auto mb-3 opacity-30 text-primary" />
          <p className="font-semibold text-foreground">
            No users match your filter.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Designer & Email</th>
                  <th className="px-6 py-4">Auth Method</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((u) => {
                  const role = u.role || "user";
                  const isCurrent = u.id === currentAuthUser?.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      {/* Name & Avatar & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.full_name || "Avatar"}
                              className="w-10 h-10 rounded-xl object-cover border border-border shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-display font-bold text-primary shrink-0">
                              {(u.full_name || u.email || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate flex items-center gap-2">
                              <span>{u.full_name || "Community Designer"}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-mono font-bold">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                              {u.email || `ID: ${u.id.slice(0, 18)}...`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Auth Method */}
                      <td className="px-6 py-4">
                        {renderProviderBadge(u.provider)}
                      </td>

                      {/* Role Badge & Selector */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={role}
                            disabled={updatingId === u.id || isCurrent}
                            onChange={(e) =>
                              handleUpdateRole(
                                u.id,
                                e.target.value as "user" | "creator" | "admin"
                              )
                            }
                            className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                              role === "admin"
                                ? "bg-primary/10 text-primary border-primary/30"
                                : role === "creator"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                                : "bg-muted text-muted-foreground border-border"
                            } ${
                              isCurrent ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                          >
                            <option value="user">User</option>
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() =>
                              handleDeleteProfile(u.id, u.full_name)
                            }
                            title="Delete User"
                            className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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
