import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Phone,
  User,
  Building2,
  CheckSquare,
  Square,
} from "lucide-react";

const AddAddressPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    state: "",
    city: "",
  });
  const [isDefault, setIsDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Replace with actual API dispatch (e.g., dispatch(addAddress(formData)))
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const previousPage = location.state?.from || "/cart";
      navigate(previousPage);
    } catch (error) {
      console.error("Failed to add address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.fullName.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.street.trim() !== "" &&
    formData.state.trim() !== "" &&
    formData.city.trim() !== "";

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="relative p-4 border-b border-gray-100 bg-white flex items-center justify-center flex-shrink-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 focus:outline-none"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-semibold text-lg text-gray-900">Add New Address</h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-28">
        <form
          id="add-address-form"
          onSubmit={handleSubmit}
          className="p-4 space-y-6"
        >
          {/* Contact Information Section */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-md text-gray-900 mb-2">
              Contact Information
            </h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Receiver's full name"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-lily/20 focus:border-lily text-sm transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+234 800 000 0000"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-lily/20 focus:border-lily text-sm transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Address Details Section */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-md text-gray-900 mb-2">
              Address Details
            </h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">
                Street Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="House number, Street name, Area"
                  rows="3"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-lily/20 focus:border-lily text-sm transition-all outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  State
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Lagos"
                    className="w-full pl-9 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-lily/20 focus:border-lily text-sm transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  City / LGA
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Ikeja"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-lily/20 focus:border-lily text-sm transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div
            className="flex items-center space-x-3 p-2 cursor-pointer group"
            onClick={() => setIsDefault(!isDefault)}
          >
            <button type="button" className="flex-shrink-0 focus:outline-none">
              {isDefault ? (
                <CheckSquare className="text-lily w-6 h-6" />
              ) : (
                <Square className="text-gray-400 group-hover:text-gray-600 transition-colors w-6 h-6" />
              )}
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Set as default delivery address
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                We'll use this address for future orders
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 w-full max-w-xl mx-auto z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <button
          type="submit"
          form="add-address-form"
          className="w-full bg-lily text-white py-3.5 rounded-full text-md font-semibold hover:bg-opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            "Save Address"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddAddressPage;
