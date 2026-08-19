import { apiClient } from "@/lib/api-client";
import type { ApiResponse, User, UpdateProfilePayload } from "@/types/api";

export const userService = {
  /**
   * Fetch current authenticated user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/api/user/profile");
    return response.data.data;
  },

  /**
   * Update authenticated user profile fields
   */
  async updateProfile(payload: Partial<UpdateProfilePayload> | Record<string, any>): Promise<User> {
    const cleanPayload = { ...payload };
    if (cleanPayload.userName) {
      cleanPayload.userName = cleanPayload.userName.toLowerCase().trim();
    }
    const response = await apiClient.put<ApiResponse<User>>(
      "/api/user/profile",
      cleanPayload
    );
    return response.data.data;
  },

  /**
   * Upload user avatar using multipart/form-data
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string; user?: User }> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("avatar", file);
    formData.append("profileImage", file);

    const response = await apiClient.put<ApiResponse<{ avatarUrl: string; user?: User }>>(
      "/api/user/profile/profile-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  /**
   * Request email verification OTP / email trigger
   */
  async requestEmailVerification(): Promise<{ message: string }> {
    const response = await apiClient.get<ApiResponse<{ message: string }>>(
      "/api/user/profile/verify"
    );
    return response.data.data;
  },

  /**
   * Verify email using OTP code
   */
  async verifyEmailCode(code: string): Promise<{ message: string; user?: User }> {
    const response = await apiClient.post<ApiResponse<{ message: string; user?: User }>>(
      "/api/user/profile/verify",
      { code: code.trim() }
    );
    return response.data.data;
  },

  /**
   * Fetch public profile for creator / publisher
   */
  async getPublicProfile(idOrUserName: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      `/api/user/profile/${encodeURIComponent(idOrUserName)}`
    );
    return response.data.data;
  },
};
