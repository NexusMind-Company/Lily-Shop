export const getVendorImageUrl = (v) => {
  if (!v) return null;
  const url =
    v.all_media_urls?.profile_image ||
    v.image_url ||
    (Array.isArray(v.all_media_urls) && v.all_media_urls[0]);
  return url && typeof url === "string"
    ? url.replace(/^http:/, "https:")
    : null;
};

export const getVendorBannerUrl = (v) => {
  if (!v) return null;
  const url = v.all_media_urls?.banner_image || v.image_url;
  return url && typeof url === "string"
    ? url.replace(/^http:/, "https:")
    : null;
};

export const getVendorInitials = (n) =>
  (n || "NA")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * Checks if the current user is the owner of the given vendor or plan.
 * @param {Object} currentUser - The currently authenticated user object
 * @param {Object} [vendor] - The vendor object being viewed
 * @param {Object} [plan] - The specific plan being viewed
 * @returns {boolean} True if the user owns the vendor
 */
export const isVendorOwner = (currentUser, vendor, plan) => {
  if (!currentUser) return false;

  // Check if currentUser.vendor_id matches vendor.id or plan.vendor
  if (currentUser.vendor_id) {
    if (vendor && currentUser.vendor_id === vendor.id) return true;
    if (plan && currentUser.vendor_id === plan.vendor) return true;
  }

  // Check if currentUser.id matches vendor.user (the user ID that owns the vendor)
  if (vendor && vendor.user && currentUser.id === vendor.user) return true;

  return false;
};
