import { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { toast } from "sonner";

export interface ApiErrorResponse {
  message?: string;
  errors?: Array<{ field?: string; param?: string; path?: string; message: string }> | Record<string, string | string[]>;
  status?: number;
}

/**
 * Automatically binds backend API 400/422 validation errors directly to React Hook Form fields.
 * If errors are general or no field matches, it surfaces them via toast.error.
 */
export function mapBackendErrorsToForm<TFieldValues extends FieldValues>(
  error: any,
  setError?: UseFormSetError<TFieldValues>
): string {
  const responseData: ApiErrorResponse = error?.response?.data || {};
  const status = error?.response?.status;
  const fallbackMessage = error?.message || "An unexpected error occurred. Please try again.";
  const mainMessage = responseData?.message || fallbackMessage;

  // 1. If we have array-based validation errors (e.g., Express-validator / Zod backend: [{ field: 'email', message: '...' }])
  if (Array.isArray(responseData?.errors) && setError) {
    responseData.errors.forEach((errItem) => {
      const fieldName = (errItem.field || errItem.param || errItem.path) as Path<TFieldValues>;
      if (fieldName && errItem.message) {
        setError(fieldName, {
          type: "server",
          message: errItem.message,
        });
      }
    });
  }

  // 2. If we have object key-value errors: { errors: { email: "Email already taken", password: "Too weak" } }
  else if (responseData?.errors && typeof responseData.errors === "object" && setError) {
    Object.entries(responseData.errors).forEach(([fieldKey, errVal]) => {
      const fieldName = fieldKey as Path<TFieldValues>;
      const msg = Array.isArray(errVal) ? errVal.join(", ") : String(errVal);
      if (fieldName && msg) {
        setError(fieldName, {
          type: "server",
          message: msg,
        });
      }
    });
  }

  // 3. Fallback toast notification
  toast.error(mainMessage, {
    description: status === 422 || status === 400 ? "Please check your inputs and try again." : undefined,
  });

  return mainMessage;
}
