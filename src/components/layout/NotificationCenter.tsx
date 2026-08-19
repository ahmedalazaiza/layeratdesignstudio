"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Gift,
  Sparkles,
  ExternalLink,
  Info,
  Download,
  Star,
  Trash2,
  X,
  Layers,
} from "lucide-react";
import type { Page } from "../../types";

export interface StudioNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: "gift" | "product" | "system" | "download" | "review";
  read: boolean;
  actionUrl?: string;
  actionPage?: Page;
  actionPayload?: any;
}

const STORAGE_KEY = "layerat_notifications";

export const INITIAL_NOTIFICATIONS: StudioNotification[] = [
  {
    id: "notif-welcome-gift",
    title: "Claim Free Figma Starter Kit",
    message: "Unlock 50+ community components, 3 color themes & responsive layouts for free.",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    type: "gift",
    read: false,
    actionPage: "home",
  },
  {
    id: "notif-new-kits",
    title: "15+ New UI Kits Published",
    message: "Fresh mobile app flows, design tokens and SaaS dashboard templates are now live.",
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    type: "product",
    read: false,
    actionPage: "browse",
  },
  {
    id: "notif-studio-v2",
    title: "Studio Design System v2.0",
    message: "Experience faster downloads, instant previews and responsive mega menus.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    type: "system",
    read: false,
    actionPage: "about",
  },
];

interface NotificationCenterProps {
  onNavigate: (page: Page, payload?: any) => void;
  isDark?: boolean;
}

export function NotificationCenter({
  onNavigate,
  isDark = true,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<StudioNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (item: StudioNotification) => {
    markAsRead(item.id);
    setIsOpen(false);

    if (item.type === "gift") {
      window.dispatchEvent(new CustomEvent("layerat_open_gift"));
      return;
    }

    if (item.actionPage) {
      onNavigate(item.actionPage, item.actionPayload);
    } else if (item.actionUrl) {
      if (item.actionUrl.startsWith("http")) {
        window.open(item.actionUrl, "_blank");
      }
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : true
  );

  const getIcon = (type: StudioNotification["type"]) => {
    switch (type) {
      case "gift":
        return <Gift size={16} className="text-primary" />;
      case "product":
        return <Layers size={16} className="text-emerald-400" />;
      case "download":
        return <Download size={16} className="text-blue-400" />;
      case "review":
        return <Star size={16} className="text-amber-400" />;
      default:
        return <Sparkles size={16} className="text-primary" />;
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200 relative cursor-pointer ${
          isOpen
            ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
            : "border-border bg-card hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-foreground"
        }`}
      >
        <Bell size={16} className={unreadCount > 0 ? "text-foreground" : ""} />

        {/* Glowing Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-border/80 dark:border-white/10 bg-card/98 dark:bg-[#0c130e]/98 backdrop-blur-2xl shadow-2xl shadow-black/20 dark:shadow-black/70 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                  <Bell size={14} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground leading-none">
                    Studio Updates
                  </h3>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                  </span>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-border/40 flex items-center gap-2 bg-muted/20">
              <button
                onClick={() => setFilter("all")}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filter === "unread"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground mx-auto mb-3">
                    <CheckCheck size={20} />
                  </div>
                  <p className="text-xs font-bold text-foreground">
                    {filter === "unread" ? "No unread notifications" : "No notifications"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    You're all caught up with latest design kits & resources.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 transition-colors cursor-pointer group flex items-start gap-3 relative ${
                      !item.read
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-xl bg-card border border-border/80 flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:border-primary/40">
                      {getIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4
                          className={`text-xs font-bold truncate ${
                            !item.read ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground/70 font-mono shrink-0">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {/* Unread Indicator & Delete Button */}
                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-sm" />
                      )}
                      <button
                        onClick={(e) => deleteNotification(item.id, e)}
                        title="Delete notification"
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all rounded-lg hover:bg-card"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border/40 bg-muted/10 text-center">
              <span className="text-[11px] text-muted-foreground/80 font-mono">
                Layerat Design Studio &bull; Real-time Notifications
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
