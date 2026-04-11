import { ArrowLeft, Search, X, MapPin } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

/* =========================
   Skeleton Card Component
========================= */
const SkeletonCard = () => {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex items-center gap-5">
      <div className="w-32 h-32 rounded-2xl bg-gray-200 animate-pulse"></div>
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

  const rawUrl = vendor.profile_pic || vendor.user?.profile_pic || vendor.logo || vendor.image || vendor.all_media_urls?.[0];
  const imageUrl = typeof rawUrl === 'string' ? rawUrl.replace(/^http:\/\//i, 'https://') : rawUrl;
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
      <div className="w-32 h-32 shrink-0">
        {showImage ? (
          <img
            src={imageUrl}
            alt={vendor.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-2xl
            ring-4 ring-white shadow-sm
            transition-transform duration-300
            group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center
            rounded-2xl bg-gray-200 text-gray-600 font-semibold text-lg
            ring-4 ring-white shadow-sm"
          >
            {initials}
          </div>
        )}
      </div>

      {/* Vendor Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold truncate">{vendor.name}</h2>
        <p className="text-sm text-gray-500 line-clamp-1 mb-1">
          {vendor.description || "No description available"}
        </p>
        {vendor.cuisine && (
          <p className="text-xs text-lily font-medium mb-1">
            {vendor.cuisine}
          </p>
        )}
        {vendor.address && vendor.address !== "Lagos" && (
          <div className="flex items-center gap-1 text-gray-500 mt-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <p className="text-xs truncate font-medium">{vendor.address}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================
   Vendors List Page
========================= */
const VendorsList = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("")

const { data, isLoading, error } = useQuery({
  queryKey: ["vendors"],
  queryFn: async () => {
    const response = await api.get("/foods/vendors/");
    return response.data;
  },
});
const vendors = data?.results || [];

// const mockVendors = [
//   {
//     id: "1",
//     name: "Mama's Kitchen",
//     description: "Delicious home cooked meals delivered fresh daily",
//     cuisine: "Nigerian",
//     location: "Lekki, Lagos",
//     rating: 4.5,
//     verified: true,
//     all_media_urls: [],
//   },
//   {
//     id: "2",
//     name: "Iya Basira",
//     description: "Best amala and ewedu in town",
//     cuisine: "Yoruba",
//     location: "Surulere, Lagos",
//     rating: 4.8,
//     verified: true,
//     all_media_urls: [],
//   },
//   {
//     id: "3",
//     name: "Chef Emeka",
//     description: "Eastern Nigerian delicacies made with love",
//     cuisine: "Igbo",
//     location: "Ikeja, Lagos",
//     rating: 4.3,
//     verified: false,
//     all_media_urls: [],
//   },
//   {
//     id: "4",
//     name: "Abuja Buka",
//     description: "Authentic northern Nigerian meals",
//     cuisine: "Hausa",
//     location: "Wuse, Abuja",
//     rating: 4.6,
//     verified: true,
//     all_media_urls: [],
//   },
//   {
//     id: "5",
//     name: "Lagos Grill House",
//     description: "Grilled fish, chicken and suya platters",
//     cuisine: "Continental",
//     location: "VI, Lagos",
//     rating: 4.2,
//     verified: false,
//     all_media_urls: [],
//   },
//   {
//     id: "6",
//     name: "Nkechi's Place",
//     description: "Soups, swallows and everything nice",
//     cuisine: "Nigerian",
//     location: "Ajah, Lagos",
//     rating: 4.7,
//     verified: true,
//     all_media_urls: [],
//   },
// ];

// const vendors = mockVendors;
// const isLoading = false;
// const error = null;


  const filteredVendors = vendors.filter((vendor) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vendor.name?.toLowerCase().includes(searchLower) ||
      vendor.cuisine?.toLowerCase().includes(searchLower) ||
      vendor.description?.toLowerCase().includes(searchLower) ||
      vendor.address?.toLowerCase().includes(searchLower)
    );
  });

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


      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 bg-white text-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

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
        {filteredVendors.length > 0 ? (
  filteredVendors.map((vendor) => (
    <VendorCard
      key={vendor.id}
      vendor={vendor}
      onClick={handleVendorClick}
    />
  ))
) : (
  <p className="text-gray-400 text-sm col-span-3 text-center py-10">
    No vendors found for "{searchQuery}"
  </p>
)}
          
        </div>
      )}
    </div>
  );
};

export default VendorsList;
