import { ArrowLeft, Search, X, MapPin } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import CustomerSubscriptionsPage from "./CustomerSubscriptionsPage";

/* =========================
   Skeleton Card Component
========================= */
const SkeletonCard = () => {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex items-center gap-5">
      <div className="w-24 h-24 rounded-xl bg-gray-200 animate-pulse"></div>
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

  const rawUrl =
    vendor.profile_pic ||
    vendor.user?.profile_pic ||
    vendor.logo ||
    vendor.image ||
    vendor.all_media_urls?.[0];
  const imageUrl =
    typeof rawUrl === "string"
      ? rawUrl.replace(/^http:\/\//i, "https://")
      : rawUrl;
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
            className="w-full h-full object-cover rounded-none
            ring-4 ring-white shadow-sm
            transition-transform duration-300
            group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center
            rounded-none bg-gray-200 text-gray-600 font-semibold text-lg
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
          <p className="text-xs text-lily font-medium mb-1">{vendor.cuisine}</p>
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

  const [activeTab, setActiveTab] = useState("food");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ["vendors", currentPage, searchQuery],
    queryFn: async () => {
      const params = { page: currentPage, page_size: itemsPerPage };
      if (searchQuery) params.search = searchQuery;
      const response = await api.get("/foods/vendors/", { params });
      return response.data;
    },
    enabled: activeTab === "food",
  });
  const vendors = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

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

  const handleVendorClick = (vendorId) => {
    navigate(`/vendor-subscription/${vendorId}`);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white min-h-screen">
      {/* Header with Back Button and Pill Navbar */}
      <div className="relative flex items-center justify-center mb-10">
        <button
          onClick={handleBack}
          className="absolute left-0 p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Pill Navbar */}
        <div className="flex bg-gray-100 p-1 rounded-full w-fit shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab("food")}
            className={`px-8 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === "food"
                ? "bg-lily text-white shadow-md scale-105"
                : "text-gray-500 hover:text-lily"
            }`}
          >
            Food
          </button>
          <button
            onClick={() => setActiveTab("sub")}
            className={`px-8 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === "sub"
                ? "bg-lily text-white shadow-md scale-105"
                : "text-gray-500 hover:text-lily"
            }`}
          >
            Sub
          </button>
        </div>
      </div>

      {activeTab === "food" ? (
        <>
          <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">
            Food Vendors
          </h1>

          <div className="relative mb-8 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-lily transition-colors" />
            <input
              type="text"
              placeholder="Search local food vendors..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily bg-gray-50/50 text-base transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-lily transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20 text-red-500">
              Error loading vendors: {error.message}
            </div>
          )}

          {/* Vendors Grid */}
          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vendors.length > 0 ? (
                  vendors.map((vendor) => (
                    <VendorCard
                      key={vendor.id}
                      vendor={vendor}
                      onClick={handleVendorClick}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center">
                    <p className="text-gray-400 text-lg">
                      No vendors found matching your search
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-6 py-2 rounded-xl border border-gray-200 hover:bg-white hover:border-lily hover:text-lily disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-all font-medium"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-6 py-2 rounded-xl border border-gray-200 hover:bg-white hover:border-lily hover:text-lily disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-all font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <CustomerSubscriptionsPage
          hideHeader={true}
          onExplore={() => setActiveTab("food")}
        />
      )}
    </div>
  );
};

export default VendorsList;
