import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const VendorsList = () => {
  const navigate = useNavigate();

  // Fetch vendors from backend
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <button
          onClick={handleBack}
          className="mb-4 text-blue-500 hover:underline"
        >
          <ArrowLeft className="" />
        </button>
        <h1 className="text-2xl font-bold mb-4">Vendors</h1>
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lily"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <button
          onClick={handleBack}
          className="mb-4 text-blue-500 hover:underline"
        >
          <ArrowLeft className="" />
        </button>
        <h1 className="text-2xl font-bold mb-4">Vendors</h1>
        <div className="text-center text-red-500">
          Error loading vendors: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={handleBack}
        className="mb-4 text-blue-500 hover:underline"
      >
        <ArrowLeft className="" />
      </button>
      <h1 className="text-2xl font-bold mb-4">Vendors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            onClick={() => handleVendorClick(vendor.id)}
            className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <img
              src={
                vendor.all_media_urls?.[0] ||
                "https://i.pinimg.com/736x/03/e9/84/03e984afeb479490cab605c39bfdac03.jpg"
              }
              alt={vendor.name}
              className="w-full h-56 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold">{vendor.name}</h2>
            <p className="text-gray-600">
              {vendor.description || "No description"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorsList;
