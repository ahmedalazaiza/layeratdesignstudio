import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import type { ApiResponse, RefreshTokenResponse } from "@/types/api";

// ─── Token Keys & Cookie Config ───

export const ACCESS_TOKEN_KEY = "layerat_access_token";
export const REFRESH_TOKEN_KEY = "layerat_refresh_token";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

// ─── Cookie Storage Helpers ───

export function getAccessToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(
  tokenOrTokens: string | { accessToken: string; refreshToken?: string },
  refreshTokenArg?: string
): void {
  if (typeof window === "undefined") return;

  let access: string;
  let refresh: string | undefined;

  if (typeof tokenOrTokens === "object" && tokenOrTokens !== null) {
    access = tokenOrTokens.accessToken;
    refresh = tokenOrTokens.refreshToken;
  } else {
    access = tokenOrTokens;
    refresh = refreshTokenArg;
  }

  if (access) {
    Cookies.set(ACCESS_TOKEN_KEY, access, COOKIE_OPTIONS);
  }
  if (refresh) {
    Cookies.set(REFRESH_TOKEN_KEY, refresh, {
      ...COOKIE_OPTIONS,
      expires: 30, // 30 days for refresh token
    });
  }
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

// ─── Custom Config Extension ───

export interface CustomRequestConfig extends AxiosRequestConfig {
  skipToast?: boolean;
  _retry?: boolean;
}

interface CustomInternalRequestConfig extends InternalAxiosRequestConfig {
  skipToast?: boolean;
  _retry?: boolean;
}

// ─── Create Axios Instance ───

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Refresh Token Mutex Queue ───

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Request Interceptor ───

api.interceptors.request.use(
  (config: CustomInternalRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (Silent Refresh & Error Toasting) ───

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiResponse<any>>) => {
    const originalRequest = error.config as CustomInternalRequestConfig | undefined;

    // Do not retry refresh-token endpoint itself or if request is missing
    const isRefreshEndpoint = originalRequest?.url?.includes("/auth/refresh-token");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshEndpoint) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuthTokens();
        // Notify any auth listener if needed
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("layerat:unauthorized"));
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent refresh
        const refreshResponse = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${BASE_URL}/api/user/auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken =
          refreshResponse.data?.data?.accessToken ||
          (refreshResponse.data as any)?.accessToken;
        const newRefreshToken =
          refreshResponse.data?.data?.refreshToken ||
          (refreshResponse.data as any)?.refreshToken;

        if (!newAccessToken) {
          throw new Error("No access token returned from refresh endpoint.");
        }

        setAuthTokens(newAccessToken, newRefreshToken || refreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthTokens();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("layerat:unauthorized"));
        }

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Standardized Global Error Notification
    const shouldSkipToast = originalRequest?.skipToast || false;
    if (!shouldSkipToast && typeof window !== "undefined") {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred. Please try again.";

      // Avoid duplicate toasts for 401 if it was during refresh
      if (error.response?.status !== 401 || !getRefreshToken()) {
        toast.error(errorMessage, {
          duration: 4000,
        });
      }
    }

    return Promise.reject(error);
  }
);

// ─── Type-Safe API Helper Client ───

export const apiClient = {
  get: async <T>(url: string, config?: CustomRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data;
  },

  post: async <T>(url: string, data?: any, config?: CustomRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: any, config?: CustomRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  patch: async <T>(url: string, data?: any, config?: CustomRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: CustomRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data;
  },
};

export default apiClient;
