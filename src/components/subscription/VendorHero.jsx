import PropTypes from "prop-types";

/**
 * VendorHero component displaying vendor profile and basic info
 * @param {Object} props - Component props
 * @param {Object} props.vendor - Vendor data
 */
const VendorHero = ({ vendor }) => {
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
                  vendor.image || "https://via.placeholder.com/96"
                }")`,
              }}
              alt={`${vendor.name} profile`}
            />
            {vendor.verified && (
              <div className="absolute -bottom-2 -right-2 bg-surface-light dark:bg-surface-dark p-1.5 rounded-full shadow-sm border border-black/5 dark:border-white/5">
                <span className="material-symbols-outlined text-primary text-[20px] fill-1">
                  verified
                </span>
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
            <div className="flex items-center gap-1.5 mt-2">
              <span className="flex items-center bg-primary text-green-950 px-2 py-0.5 rounded-md text-xs font-bold">
                {vendor.rating}{" "}
                <span className="material-symbols-outlined text-[12px] ml-0.5">
                  star
                </span>
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
  }),
};

export default VendorHero;
