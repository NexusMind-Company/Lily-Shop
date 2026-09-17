import { BadgeCheck, Star } from "lucide-react";
import PropTypes from "prop-types";
import {
  getVendorImageUrl,
  getVendorInitials,
  getVendorBannerUrl,
} from "../../utils/vendorUtils";

/**
 * VendorHero component displaying vendor profile and basic info
 * @param {Object} props - Component props
 * @param {Object} props.vendor - Vendor data
 * @param {Array} props.reviews - Array of vendor reviews
 * @param {boolean} props.hasSubscriptionPlans - Whether vendor has subscription plans available
 */
const VendorHero = ({ vendor, reviews = [], hasSubscriptionPlans = false }) => {
  if (!vendor) return null;

  // Determine media URLs and initials using utilities
  const mediaUrl = getVendorImageUrl(vendor);
  const bannerUrl = getVendorBannerUrl(vendor);
  const initials = getVendorInitials(vendor.name);

  return (
    <div className="pb-6">
      {/* Banner Image */}
      {bannerUrl && (
        <div
          className="w-full h-40 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url("${bannerUrl}")` }}
        />
      )}

      <div className={`px-4 ${bannerUrl ? "-mt-10" : "pt-2"}`}>
        <div
          className={`flex flex-col gap-5 ${bannerUrl ? "bg-white dark:bg-surface-dark rounded-t-4xl p-4 shadow-sm" : ""}`}
        >
          {/* Vendor Image & Basic Info */}
          <div className="flex gap-4 items-center">
            <div className="relative shrink-0">
              {mediaUrl ? (
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-2xl h-24 w-24 shadow-sm"
                  style={{ backgroundImage: `url("${mediaUrl}")` }}
                  alt={`${vendor.name} profile`}
                />
              ) : (
                <div className="flex items-center justify-center rounded-2xl h-24 w-24 bg-gray-100 text-black font-black text-2xl shadow-sm border border-gray-200">
                  {initials}
                </div>
              )}
              {vendor.verified && (
                <div className="absolute -bottom-2 -right-2 bg-[#ffffff] dark:bg-surface-dark p-1.5 rounded-full shadow-sm border border-black/5 dark:border-white/5">
                  <BadgeCheck className="text-lily text-[20px] fill-1" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
                {vendor.name}
              </h1>
              {(vendor.cuisine || (vendor.address && vendor.address !== "Lagos")) && (
                <p className="text-gray-500 text-sm font-medium mt-1">
                  {[vendor.cuisine, vendor.address && vendor.address !== "Lagos" ? vendor.address : null].filter(Boolean).join(" • ")}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={() => {
                    const reviewsTab = document.querySelector('[data-tab="reviews"]');
                    if (reviewsTab) reviewsTab.click();
                  }}
                  className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <Star className="text-[14px] fill-green-600 text-green-600" />
                  <span className="font-extrabold text-sm">{vendor.rating || "New"}</span>
                  {vendor.reviewCount > 0 && (
                    <span className="text-xs font-semibold text-green-600/80">
                      ({vendor.reviewCount} reviews)
                    </span>
                  )}
                </button>
                
                {hasSubscriptionPlans && (
                  <span className="bg-lily/10 text-lily px-2.5 py-1 rounded-lg text-xs font-bold border border-lily/20">
                    Subscriptions
                  </span>
                )}
              </div>
            </div>
          </div>
          {vendor.description && (
            <p className="text-gray-600 text-sm leading-relaxed mt-2">
              {vendor.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

VendorHero.propTypes = {
  vendor: PropTypes.shape({
    name: PropTypes.string.isRequired,
    profile_image: PropTypes.string,
    logo: PropTypes.string,
    image: PropTypes.string,
    profile_pic: PropTypes.string,
    banner_image: PropTypes.string,
    verified: PropTypes.bool,
    cuisine: PropTypes.string,
    address: PropTypes.string,
    rating: PropTypes.number,
    reviewCount: PropTypes.string,
    description: PropTypes.string,
    contact_phone: PropTypes.string,
    phone: PropTypes.string,
  }),
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      user_name: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string,
      created_at: PropTypes.string.isRequired,
    }),
  ),
  hasSubscriptionPlans: PropTypes.bool,
};

export default VendorHero;
