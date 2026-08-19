import { z } from "zod";

// ─── Login Schema ───
export const loginSchema = z.object({
  emailOrUserName: z
    .string()
    .min(3, "Please enter your email or username")
    .trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Signup Schema ───
export const signupSchema = z
  .object({
    userName: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers, and underscores"
      ),
    displayName: z
      .string()
      .max(50, "Full name cannot exceed 50 characters")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirmPassword: z
      .string()
      .min(6, "Please confirm your password"),
    termsAccepted: z
      .boolean()
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// ─── Forgot Password Schema (Step 1) ───
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ─── Verify Recovery Code Schema (Step 2) ───
export const verifyRecoveryCodeSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
  code: z
    .string()
    .min(4, "Please enter the verification code")
    .max(10, "Invalid verification code")
    .trim(),
});

export type VerifyRecoveryCodeFormData = z.infer<typeof verifyRecoveryCodeSchema>;

// ─── Recover / Reset Password Schema (Step 3) ───
export const recoverPasswordSchema = z
  .object({
    recoverToken: z.string().min(1, "Recovery token is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirmPassword: z
      .string()
      .min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>;

// ─── Change Password Schema (Profile Security Tab) ───
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirmPassword: z
      .string()
      .min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ─── Edit Profile Schema ───
export const editProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name cannot exceed 60 characters"),
  userName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain lowercase letters, numbers, and underscores"
    ),
  bio: z
    .string()
    .max(300, "Bio cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  github: z.string().optional().or(z.literal("")),
  dribbble: z.string().optional().or(z.literal("")),
  figma: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

// ─── Verify Email OTP Schema ───
export const emailOtpSchema = z.object({
  code: z
    .string()
    .min(4, "Please enter the verification code")
    .max(10, "Invalid code")
    .trim(),
});

export type EmailOtpFormData = z.infer<typeof emailOtpSchema>;
