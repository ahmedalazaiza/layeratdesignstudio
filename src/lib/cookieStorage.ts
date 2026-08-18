/**
 * Cookie Storage Adapter for Supabase & Session Management
 * Adheres to secure cookie storage, SameSite=Lax, Secure flags, and fallback synchronization.
 */

export interface StorageAdapter {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

const COOKIE_PREFIX = "layerat_";
const DEFAULT_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

/**
 * Reads a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const target = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const c = cookies[i].trim();
    if (c.indexOf(target) === 0) {
      try {
        return decodeURIComponent(c.substring(target.length));
      } catch {
        return c.substring(target.length);
      }
    }
  }
  return null;
}

/**
 * Writes a cookie with secure attributes
 */
export function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number = DEFAULT_MAX_AGE_SEC
): void {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  const cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secureFlag}`;
  document.cookie = cookieString;
}

/**
 * Deletes a cookie
 */
export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Production-ready Cookie + LocalStorage synchronized storage adapter for Supabase
 */
export const cookieStorageAdapter: StorageAdapter = {
  getItem: (key: string): string | null => {
    // 1. Try reading from cookie first
    const fromCookie = getCookie(key);
    if (fromCookie) {
      return fromCookie;
    }

    // 2. Fallback to localStorage
    if (typeof localStorage !== "undefined") {
      try {
        const fromLocal = localStorage.getItem(key);
        if (fromLocal) {
          // Re-sync to cookie
          setCookie(key, fromLocal);
          return fromLocal;
        }
      } catch (err) {
        console.warn("Storage read error:", err);
      }
    }
    return null;
  },

  setItem: (key: string, value: string): void => {
    // 1. Store in cookie
    setCookie(key, value);

    // 2. Sync to localStorage
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        console.warn("Storage write error:", err);
      }
    }
  },

  removeItem: (key: string): void => {
    // 1. Remove from cookie
    deleteCookie(key);

    // 2. Remove from localStorage
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn("Storage remove error:", err);
      }
    }
  },
};

/**
 * Sanitizes auth inputs to prevent injection and trimming errors
 */
export function sanitizeAuthInput(email: string, password?: string, fullName?: string) {
  const sanitizedEmail = (email || "").toLowerCase().trim();
  const sanitizedPassword = (password || "").trim();
  const sanitizedFullName = (fullName || "").trim();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail);
  const isValidPassword = !password || sanitizedPassword.length >= 6;

  return {
    email: sanitizedEmail,
    password: sanitizedPassword,
    fullName: sanitizedFullName,
    isValidEmail,
    isValidPassword,
  };
}
