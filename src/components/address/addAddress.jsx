import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addNewAddress } from "../../services/api";
import { MapPin, Search, Loader2 } from "lucide-react";

const AddAddressPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    countryCode: "+234",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    landmark: "",
    description: "",
    lat: null,
    lon: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const phoneRef = useRef(null);
  const searchRef = useRef(null);
  const suggestionContainerRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionContainerRef.current &&
        !suggestionContainerRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Nominatim Autocomplete Query
  const { data: suggestions = [], isFetching: isSearching } = useQuery({
    queryKey: ["nominatim", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 3) return [];
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ng&q=${encodeURIComponent(
          searchQuery
        )}&addressdetails=1`
      );
      return res.json();
    },
    enabled: searchQuery.length >= 3,
    staleTime: 60000,
  });

  const handleSuggestionClick = (suggestion) => {
    const addressDetails = suggestion.address || {};
    
    setFormData((prev) => ({
      ...prev,
      address: suggestion.display_name,
      city: addressDetails.city || addressDetails.town || addressDetails.village || addressDetails.county || "",
      state: addressDetails.state || "",
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    }));
    
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    
    if (fieldErrors.address) {
      setFieldErrors((prev) => ({ ...prev, address: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Custom Validation
    const newErrors = {};
    let firstErrorRef = null;

    if (!formData.phone) {
      newErrors.phone = true;
      if (!firstErrorRef) firstErrorRef = phoneRef;
    }
    if (!formData.address || !formData.lat || !formData.lon) {
      newErrors.address = true;
      if (!firstErrorRef) firstErrorRef = searchRef;
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      if (newErrors.address && !formData.lat) {
        toast.error("Please select a valid address from the search suggestions", { icon: "📍" });
      } else {
        toast.error("Please fill in all required fields", { icon: "📍" });
      }
      firstErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // 1. Format the description into the street address
      const streetAddress = formData.description
        ? `${formData.address} (${formData.description})`
        : formData.address;

      // 2. Format the phone number strictly for the backend
      let rawPhone = formData.phone.replace(/\D/g, ""); // Strip non-numeric characters

      // Auto-remove leading zero for Nigerian numbers
      if (formData.countryCode === "+234" && rawPhone.startsWith("0")) {
        rawPhone = rawPhone.substring(1);
      }

      const formattedPhoneNumber = `${formData.countryCode}${rawPhone}`;

      // 3. Construct payload matching backend model
      const payload = {
        label: formData.landmark || "Home",
        street_address: streetAddress,
        city: formData.city || "Unknown City",
        state: formData.state || "Unknown State",
        country: "Nigeria",
        postal_code: formData.zipCode || null,
        phone_number: formattedPhoneNumber,
        latitude: formData.lat,
        longitude: formData.lon,
        is_default: true,
      };

      await addNewAddress(payload);
      toast.success("Address saved successfully");
      navigate(-1);
    } catch (err) {
      console.error("Error adding address:", err);
      if (err.response?.data?.phone_number) {
        setError(`Phone Number Error: ${err.response.data.phone_number[0]}`);
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to add address. Please check your inputs and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-24">
      <div className="flex items-center justify-center relative px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 p-2 focus:outline-none"
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Add new address</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 mt-6 space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* CONTACT SECTION */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Contact info</h2>

          <div className="space-y-1">
            <label htmlFor="name" className="text-sm text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e] focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="text-sm text-gray-700">
              Phone no*
            </label>
            <div 
              ref={phoneRef} 
              className={`flex space-x-2 transition-all duration-300 rounded-full ${fieldErrors.phone ? "ring-2 ring-red-500 bg-red-50/30" : ""}`}
            >
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className={`w-1/3 bg-gray-50 border border-transparent rounded-full px-3 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e] focus:bg-white transition-colors ${fieldErrors.phone ? "bg-red-50" : ""}`}
              >
                <option value="+234">NG (+234)</option>
                <option value="+1">US (+1)</option>
                <option value="+44">UK (+44)</option>
                <option value="+233">GH (+233)</option>
                <option value="+27">ZA (+27)</option>
                <option value="+254">SA (+254)</option>
              </select>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="80X XXX XXXX"
                className={`w-2/3 bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e] focus:bg-white transition-colors ${fieldErrors.phone ? "bg-red-50" : ""}`}
              />
            </div>
            {fieldErrors.phone && <span className="text-red-500 text-xs mt-1 block px-2">Phone number is required</span>}
          </div>
        </section>

        <div className="h-px w-full bg-gray-100"></div>

        {/* DELIVERY ADDRESS SECTION (Nominatim) */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Delivery address</h2>

          <div className="space-y-1 relative" ref={searchRef}>
            <label htmlFor="searchQuery" className="text-sm text-gray-700">
              Search Address / Street*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: false }));
                }}
                onFocus={() => {
                  if (searchQuery.length >= 3) setShowSuggestions(true);
                }}
                placeholder="Start typing your street..."
                className={`w-full bg-gray-50 border border-transparent rounded-full pl-11 pr-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e] focus:bg-white transition-colors ${fieldErrors.address ? "ring-2 ring-red-500 bg-red-50/30" : ""}`}
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
            {fieldErrors.address && <span className="text-red-500 text-xs mt-1 block px-2">Please select a valid address from the dropdown</span>}

            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery.length >= 3 && (
              <div 
                ref={suggestionContainerRef}
                className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-64 overflow-y-auto"
              >
                {!isSearching && suggestions.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No matching addresses found in Nigeria
                  </div>
                ) : (
                  <ul>
                    {suggestions.map((suggestion) => (
                      <li 
                        key={suggestion.place_id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-4 border-b border-gray-50 hover:bg-[#f6f8f6] cursor-pointer transition-colors flex items-start gap-3"
                      >
                        <MapPin className="w-5 h-5 text-[#4eb75e] shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 leading-tight">
                          {suggestion.display_name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          {formData.address && formData.lat && (
            <div className="bg-[#f6f8f6] p-4 rounded-xl border border-green-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#4eb75e]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Selected Location</p>
                <p className="text-sm text-gray-900 line-clamp-2">{formData.address}</p>
                <p className="text-xs text-gray-500 mt-1">Coordinates stored successfully</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="zipCode" className="text-sm text-gray-700">
              Zip code (Optional)
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="e.g. 100001"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e] focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="landmark" className="text-sm text-gray-700">
              Address Label / Nearest Landmark
            </label>
            <input
              type="text"
              id="landmark"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="e.g. Home, Office, Next to filling station"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e] focus:bg-white transition-colors"
            />
          </div>
        </section>

        <div className="h-px w-full bg-gray-100"></div>

        {/* DESCRIPTION SECTION */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900">
            Describe your location to help the rider
          </h2>

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm text-gray-700">
              Description (Optional)
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g building type, gate color, flat number"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e] focus:bg-white transition-colors"
            />
          </div>
        </section>

        {/* SUBMIT BUTTON */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-5 bg-white border-t border-gray-100 z-40">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-medium text-base rounded-full py-4 transition-colors focus:outline-none focus:ring-4 focus:ring-[#4eb75e] focus:ring-opacity-50 ${
              isLoading
                ? "bg-green-400 cursor-not-allowed text-white"
                : "bg-[#4eb75e] hover:bg-[#3da64d] text-white shadow-lg shadow-green-500/20"
            }`}
          >
            {isLoading ? "Saving Address..." : "Save Address"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddressPage;

