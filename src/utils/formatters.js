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

// Add other formatting functions here as needed
