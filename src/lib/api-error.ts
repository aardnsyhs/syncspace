export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string[]>;
  status?: number;
  isNetworkError?: boolean;
}

export function normalizeApiError(error: unknown): ApiError {
  
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return {
      message:
        "Unable to connect to server. Please check your internet connection.",
      isNetworkError: true,
    };
  }

  if (isApiErrorResponse(error)) {
    return {
      message: error.message || "Validation failed",
      fieldErrors: error.errors,
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred",
    };
  }

  return {
    message: "An unexpected error occurred. Please try again.",
  };
}

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

export function getUserFriendlyMessage(error: ApiError): string {
  
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

export function getFirstFieldError(
  fieldErrors: Record<string, string[]> | undefined,
  field: string
): string | undefined {
  return fieldErrors?.[field]?.[0];
}

export function isAuthError(error: ApiError): boolean {
  return error.status === 401 || error.status === 419;
}

export function isPermissionError(error: ApiError): boolean {
  return error.status === 403;
}

export function isValidationError(error: ApiError): boolean {
  return error.status === 422 && !!error.fieldErrors;
}
