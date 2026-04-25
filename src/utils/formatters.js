/**
 * Formats a number as a price string with commas.
 * e.g., 10000 becomes "10,000"
 * @param {number | string} price - The price to format.
 * @returns {string} The formatted price string or "N/A".
 */
export const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return "N/A";
  }
  return numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Formats a date string or Date object into "Month Day" format.
 * e.g., "2025-10-28" becomes "Oct 28"
 * @param {string | Date} date - The date to format.
 * @returns {string} The formatted date string or "".
 */
export const formatDate = (date) => {
  if (!date || isNaN(new Date(date).getTime())) {
    return "";
  }
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a date string into a relative time (e.g., "5m ago", "2h ago", "1d ago")
 * @param {string | Date} dateString - The date to format.
 * @returns {string} The relative time string.
 */
export const formatTimeAgo = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const secondsPast = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsPast < 60) return "Just now";
  if (secondsPast < 3600) return `${Math.floor(secondsPast / 60)}m ago`;
  if (secondsPast <= 86400) return `${Math.floor(secondsPast / 3600)}h ago`;
  if (secondsPast <= 604800) return `${Math.floor(secondsPast / 86400)}d ago`;
  if (secondsPast <= 2592000) return `${Math.floor(secondsPast / 604800)}w ago`;
  if (secondsPast <= 31536000)
    return `${Math.floor(secondsPast / 2592000)}mo ago`;
  return `${Math.floor(secondsPast / 31536000)}y ago`;
};

/**
 * Formats a phone number for the backend API.
 * Ensures it starts with + and follows E.164 format.
 * @param {string} phone - The phone number to format.
 * @returns {string} The formatted phone number.
 */
export const formatPhoneForAPI = (phone) => {
  if (!phone) return "";

  // Strip all non-numeric characters
  const digits = phone.replace(/\D/g, "");

  if (phone.startsWith("+")) {
    return `+${digits}`;
  }

  // If it starts with 0, assume Nigerian and replace 0 with +234
  if (digits.startsWith("0")) {
    return `+234${digits.substring(1)}`;
  }

  // If it starts with 234 but no +, just add +
  if (digits.startsWith("234")) {
    return `+${digits}`;
  }

  // Default to adding + if missing
  return `+${digits}`;
};
