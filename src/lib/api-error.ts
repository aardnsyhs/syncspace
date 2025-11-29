// src/lib/api-error.ts

export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string[]>;
  status?: number;
  isNetworkError?: boolean;
}

/**
 * Normalize API errors into a consistent format
 */
export function normalizeApiError(error: unknown): ApiError {
  // Network error (no response)
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return {
      message:
        "Unable to connect to server. Please check your internet connection.",
      isNetworkError: true,
    };
  }

  // Error with status and errors (validation)
  if (isApiErrorResponse(error)) {
    return {
      message: error.message || "Validation failed",
      fieldErrors: error.errors,
      status: error.status,
    };
  }

  // Standard Error object
  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred",
    };
  }

  // Unknown error
  return {
    message: "An unexpected error occurred. Please try again.",
  };
}

/**
 * Type guard for API error responses
 */
function isApiErrorResponse(
  error: unknown
): error is {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

/**
 * Get user-friendly error message (hides internal details in production)
 */
export function getUserFriendlyMessage(error: ApiError): string {
  // In production, don't expose internal error details
  if (import.meta.env.PROD) {
    if (error.status === 500) {
      return "Something went wrong on our end. Please try again later.";
    }
    if (error.status === 503) {
      return "Service temporarily unavailable. Please try again later.";
    }
  }

  return error.message;
}

/**
 * Get first field error message
 */
export function getFirstFieldError(
  fieldErrors: Record<string, string[]> | undefined,
  field: string
): string | undefined {
  return fieldErrors?.[field]?.[0];
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: ApiError): boolean {
  return error.status === 401 || error.status === 419;
}

/**
 * Check if error is permission related
 */
export function isPermissionError(error: ApiError): boolean {
  return error.status === 403;
}

/**
 * Check if error is validation related
 */
export function isValidationError(error: ApiError): boolean {
  return error.status === 422 && !!error.fieldErrors;
}
