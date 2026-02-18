import { BadgeCheck, Star } from "lucide-react";
import PropTypes from "prop-types";

/**
 * VendorHero component displaying vendor profile and basic info
 * @param {Object} props - Component props
 * @param {Object} props.vendor - Vendor data
<<<<<<< HEAD
 * @param {Array} props.reviews - Array of vendor reviews
 */
const VendorHero = ({ vendor, reviews = [] }) => {
=======
 */
const VendorHero = ({ vendor }) => {
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
  if (!vendor) return null;

  return (
    <div className="px-4 pt-2 pb-6">
      <div className="flex flex-col gap-5">
        {/* Vendor Image & Basic Info */}
        <div className="flex gap-4 items-center">
          <div className="relative shrink-0">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-2xl h-24 w-24 shadow-sm"
              style={{
                backgroundImage: `url("${
<<<<<<< HEAD
                  vendor.all_media_urls || "https://i.pinimg.com/736x/03/e9/84/03e984afeb479490cab605c39bfdac03.jpg"
=======
                  vendor.image || "https://via.placeholder.com/96"
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
                }")`,
              }}
              alt={`${vendor.name} profile`}
            />
            {vendor.verified && (
              <div className="absolute -bottom-2 -right-2 bg-[#ffffff] dark:bg-surface-dark p-1.5 rounded-full shadow-sm border border-black/5 dark:border-white/5">
                <BadgeCheck className="text-[#13ec49] text-[20px] fill-1" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
              {vendor.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
              {vendor.cuisine} • {vendor.location}
            </p>
<<<<<<< HEAD
            {vendor.phone && (
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                Phone: {vendor.phone}
              </p>
            )}
=======
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
            <div className="flex items-center gap-1.5 mt-2">
              <span className="flex items-center bg-[#13ec49] text-green-950 px-2 py-0.5 rounded-md text-xs font-bold">
                {vendor.rating} <Star className="text-[12px] ml-0.5" />
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                ({vendor.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          {vendor.description}
        </p>
<<<<<<< HEAD

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
                    {review.review_text}
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
=======
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
      </div>
    </div>
  );
};

VendorHero.propTypes = {
  vendor: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    verified: PropTypes.bool,
    cuisine: PropTypes.string,
    location: PropTypes.string,
    rating: PropTypes.number,
    reviewCount: PropTypes.string,
    description: PropTypes.string,
<<<<<<< HEAD
    phone: PropTypes.string,
  }),
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      user_name: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      review_text: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
    })
  ),
=======
  }),
>>>>>>> b81ff230c3e51c31ac845258bb381bae56316d46
};

export default VendorHero;
