import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

/* =========================
   Skeleton Card Component
========================= */
const SkeletonCard = () => {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex items-center gap-5">
      <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );
};

/* =========================
   Vendor Card Component
========================= */
const VendorCard = ({ vendor, onClick }) => {
  const [imageError, setImageError] = React.useState(false);

  const imageUrl = vendor.all_media_urls?.[0];
  const showImage = imageUrl && !imageError;

  const initials =
    vendor.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "NA";

  return (
    <div
      onClick={() => onClick(vendor.id)}
      className="group bg-white border border-gray-100 hover:border-gray-200
      shadow-sm hover:shadow-lg transition-all duration-300
      rounded-2xl p-5 flex items-center gap-5 cursor-pointer"
    >
      {/* Avatar */}
      <div className="w-24 h-24 shrink-0">
        {showImage ? (
          <img
            src={imageUrl}
            alt={vendor.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-full
            ring-4 ring-white shadow-sm
            transition-transform duration-300
            group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center
            rounded-full bg-gray-200 text-gray-600 font-semibold text-lg
            ring-4 ring-white shadow-sm"
          >
            {initials}
          </div>
        )}
      </div>

      {/* Vendor Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold truncate">{vendor.name}</h2>
        <p className="text-sm text-gray-500 line-clamp-2">
          {vendor.description || "No description available"}
        </p>
      </div>
    </div>
  );
};

/* =========================
   Vendors List Page
========================= */
const VendorsList = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const response = await api.get("/foods/vendors/");
      console.log(response.data);
      return response.data;
    },
  });

  const vendors = data?.results || [];

  const handleVendorClick = (vendorId) => {
    navigate(`/vendor-subscription/${vendorId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="mb-6 text-gray-600 hover:text-black transition-colors"
      >
        <ArrowLeft />
      </button>

      <h1 className="text-3xl font-bold mb-8">Vendors</h1>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-red-500">
          Error loading vendors: {error.message}
        </div>
      )}

      {/* Vendors Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onClick={handleVendorClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorsList;
