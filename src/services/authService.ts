import { apiClient, setAuthTokens, clearAuthTokens } from "@/lib/api-client";
import type {
  ApiResponse,
  User,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
} from "@/types/api";

export interface GoogleAuthResponse {
  user: User;
  tokens: AuthTokens;
  isNewUser?: boolean;
}

export interface UserNameAvailabilityResponse {
  isAvailable: boolean;
  message?: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email?: string;
}

export interface VerifyRecoveryCodeResponse {
  recoverToken: string;
  message?: string;
}

export const authService = {
  /**
   * Register a new user account with lowercase username
   */
  async signup(payload: RegisterPayload): Promise<{ user: User; tokens: AuthTokens }> {
    const cleanPayload = {
      ...payload,
      userName: payload.userName.toLowerCase().trim(),
      email: payload.email.toLowerCase().trim(),
    };

    const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      "/api/user/auth/signup",
      cleanPayload
    );

    const data = response.data.data;
    if (data.tokens) {
      setAuthTokens(data.tokens);
    }
    return data;
  },

  /**
   * Login with email or username + password
   */
  async login(payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> {
    const cleanPayload = {
      ...payload,
      emailOrUserName: payload.emailOrUserName.trim(),
    };

    const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      "/api/user/auth/login",
      cleanPayload
    );

    const data = response.data.data;
    if (data.tokens) {
      setAuthTokens(data.tokens);
    }
    return data;
  },

  /**
   * Sign in / link with Google OAuth
   */
  async googleLogin(credential: string): Promise<GoogleAuthResponse> {
    const response = await apiClient.post<ApiResponse<GoogleAuthResponse>>(
      "/api/user/auth/google",
      {
        idToken: credential,
        credential,
        token: credential,
      }
    );

    const data = response.data.data;
    if (data.tokens) {
      setAuthTokens(data.tokens);
    }
    return data;
  },

  /**
   * Check real-time username availability
   */
  async checkUserName(userName: string): Promise<boolean> {
    const cleanName = userName.toLowerCase().trim();
    if (!cleanName || cleanName.length < 3) return false;

    try {
      const response = await apiClient.post<ApiResponse<UserNameAvailabilityResponse>>(
        "/api/user/auth/userName",
        { userName: cleanName },
        { skipToast: true }
      );
      return response.data?.data?.isAvailable ?? true;
    } catch {
      // In case backend returns 409 or 422 for taken username
      return false;
    }
  },

  /**
   * Password Recovery Step 1: Request OTP code
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<ApiResponse<ForgotPasswordResponse>>(
      "/api/user/password/forgot",
      { email: email.toLowerCase().trim() }
    );
    return response.data.data;
  },

  /**
   * Password Recovery Step 2: Verify OTP code to obtain recoverToken
   */
  async verifyRecoveryCode(
    email: string,
    code: string
  ): Promise<VerifyRecoveryCodeResponse> {
    const response = await apiClient.post<ApiResponse<VerifyRecoveryCodeResponse>>(
      "/api/user/password/verify-code",
      {
        email: email.toLowerCase().trim(),
        code: code.trim(),
      }
    );
    return response.data.data;
  },

  /**
   * Password Recovery Step 3: Set new password using recoverToken
   */
  async recoverPassword(
    recoverToken: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/api/user/password/recover",
      {
        recoverToken,
        newPassword,
        confirmPassword: newPassword,
      }
    );
    return response.data.data;
  },

  /**
   * Change password from user security settings
   */
  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.put<ApiResponse<{ message: string }>>(
      "/api/user/auth/profile/password",
      payload
    );
    return response.data.data;
  },

  /**
   * Disconnect linked Google account
   */
  async disconnectGoogle(): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/api/user/auth/disconnect-google",
      {}
    );
    return response.data.data;
  },

  /**
   * Logout user and clear all cookies
   */
  logout() {
    clearAuthTokens();
  },
};
