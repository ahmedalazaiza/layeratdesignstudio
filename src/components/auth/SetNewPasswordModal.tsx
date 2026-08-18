import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle, Lock } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface SetNewPasswordModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function SetNewPasswordModal({
  onClose,
  onSuccess,
}: SetNewPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMsg(error.message);
        setStatus("error");
        toast.error(error.message);
        return;
      }

      setStatus("success");
      toast.success("Password updated successfully!");
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        window.history.replaceState(null, "", window.location.pathname);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password.");
      setStatus("error");
      toast.error(err.message || "Failed to update password.");
    }
  };

  const inputClass =
    "w-full px-5 py-3.5 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl relative">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary">
          <Lock size={22} />
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Set new password
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your new password below to regain access to your account.
        </p>

        {status === "success" ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
              <CheckCircle size={24} />
            </div>
            <p className="font-semibold text-foreground mb-1">
              Password updated!
            </p>
            <p className="text-xs text-muted-foreground">
              Redirecting you to the studio...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-medium">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {status === "error" && errorMsg && (
              <div className="flex items-center gap-2 text-sm text-destructive-foreground bg-destructive/15 border border-destructive/20 rounded-xl px-4 py-3">
                <AlertCircle size={14} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] disabled:opacity-60 transition-all duration-300 mt-2 cursor-pointer"
            >
              {status === "loading" ? "Updating..." : "Set Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
