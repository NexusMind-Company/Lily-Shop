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
              <p className="text-slate-900 text-sm font-medium mt-1">
                {vendor.cuisine ? `${vendor.cuisine}` : ""}
                {vendor.address && vendor.address !== "Lagos" && vendor.cuisine
                  ? ` • ${vendor.address}`
                  : ""}
                {vendor.address && vendor.address !== "Lagos" && !vendor.cuisine
                  ? vendor.address
                  : ""}
              </p>
              {(vendor.contact_phone || vendor.phone) && (
                <p className="text-slate-900 text-sm font-medium mt-1">
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {vendor.contact_phone || vendor.phone}
                  </span>
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="flex items-center bg-lily text-white px-2 py-0.5 rounded-md text-xs font-bold">
                  {vendor.rating} <Star className="text-[12px] ml-0.5" />
                </span>
                <span className="text-xs text-slate-900 font-medium">
                  ({vendor.reviewCount} reviews)
                </span>
                {hasSubscriptionPlans && (
                  <span className="flex items-center bg-lily text-white px-2 py-0.5 rounded-md text-xs font-bold">
                    Subscription Plan Available
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-slate-900 text-sm leading-relaxed">
            {vendor.description}
          </p>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Recent Reviews
              </h3>
              <div className="space-y-3">
                {reviews.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                          {review.user_name}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`text-xs ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
              {reviews.length > 3 && (
                <p className="text-sm text-slate-500 mt-2">
                  And {reviews.length - 3} more reviews...
                </p>
              )}
            </div>
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
