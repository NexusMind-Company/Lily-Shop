/**
 * Helper: parse axios/API error into a user-friendly message
 */
export const getErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred.";
  // Network/offline
  if (!window.navigator.onLine)
    return "You appear to be offline. Check your connection.";
  // Axios response errors
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (status === 400) {
    const msg =
      data?.message ||
      data?.detail ||
      data?.error ||
      data?.non_field_errors?.[0];
    if (msg) return msg;
    return "Invalid request. Please check your details and try again.";
  }
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You don't have permission to do this.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 429)
    return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "Server error. Please try again later.";
  // API validation message
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;
  if (data?.error) return data.error;
  if (Array.isArray(data?.non_field_errors)) return data.non_field_errors[0];
  // Generic
  return error?.message || "An unexpected error occurred.";
};
