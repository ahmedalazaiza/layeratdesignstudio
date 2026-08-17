import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function PublisherApplicationsPanel() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("publisher_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading publisher applications:", error);
      }
      setApps(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        Loading applications...
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        No publisher applications yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Portfolio
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr
                key={app.id}
                className="border-b border-border/60 hover:bg-muted/20"
              >
                <td className="px-4 py-3 text-foreground font-medium">
                  {app.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{app.email}</td>
                <td className="px-4 py-3">
                  {app.portfolio ? (
                    <a
                      href={
                        app.portfolio.startsWith("http")
                          ? app.portfolio
                          : `https://${app.portfolio}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {app.created_at
                    ? new Date(app.created_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { PublisherApplicationsPanel };