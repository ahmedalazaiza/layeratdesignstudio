import { createClient } from "@supabase/supabase-js";
import { cookieStorageAdapter } from "./cookieStorage";

const env = (import.meta as any)?.env || {};

const supabaseUrl: string =
  env.VITE_SUPABASE_URL ||
  "https://bsqbumqjwwwfmefcvful.supabase.co";

const supabaseAnonKey: string =
  env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcWJ1bXFqd3d3Zm1lZmN2ZnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MTY3MDEsImV4cCI6MjEwMjM5MjcwMX0.xCd8Z1XJik-zHCwMLWGOYL6AUJzU3wvU0KyMS53wL9M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: cookieStorageAdapter,
    storageKey: "layerat_auth_session",
    flowType: "pkce",
  },
});