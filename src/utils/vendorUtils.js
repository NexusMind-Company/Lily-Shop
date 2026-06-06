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
