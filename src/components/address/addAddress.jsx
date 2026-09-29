import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { addNewAddress, searchAddressLocations } from "../../services/api";
import {
  MapPin,
  Search,
  Loader2,
  Building,
  ChevronLeft,
  X,
} from "lucide-react";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const AddAddressPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user_data } = useSelector((state) => state.auth || {});

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    houseNumber: "",
    landmark: "",
    description: "",
  });

  const [selectedState, setSelectedState] = useState("Lagos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const debouncedQuery = useDebounce(searchQuery, 400);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Initialize with user profile if available
  useEffect(() => {
    if (user_data) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || `${user_data.first_name || ""} ${user_data.last_name || ""}`.trim() || user_data.username || "",
        phone: prev.phone || user_data.phone_number || "",
      }));
    }
  }, [user_data]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Proxy-backed Nominatim Autocomplete Query
  const { data: suggestions = [], isFetching: isSearching } = useQuery({
    queryKey: ["nominatimAddressSearch", debouncedQuery, selectedState],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 3) return [];
      return await searchAddressLocations(debouncedQuery.trim(), selectedState);
    },
    enabled: debouncedQuery.trim().length >= 3 && !selectedLocation,
    staleTime: 60000,
  });

  const handleSelectSuggestion = (suggestion) => {
    const addressObj = suggestion.address || {};
    const detectedCity =
      addressObj.city ||
      addressObj.town ||
      addressObj.suburb ||
      addressObj.county ||
      addressObj.city_district ||
      "";
    const detectedState = addressObj.state || selectedState;

    setSelectedLocation({
      displayName: suggestion.display_name,
      lat: suggestion.lat,
      lon: suggestion.lon,
      city: detectedCity,
      state: detectedState,
    });

    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);

    if (fieldErrors.address) {
      setFieldErrors((prev) => ({ ...prev, address: false }));
    }
  };

  const handleClearSelectedLocation = () => {
    setSelectedLocation(null);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = true;
    }

    const currentStreet = selectedLocation?.displayName || searchQuery.trim();
    if (!currentStreet) {
      newErrors.address = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      if (newErrors.address) {
        toast.error("Please search and select a delivery address.");
      } else {
        toast.error("Please fill in your contact phone number.");
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build full formatted street address string
      const addressParts = [];
      if (formData.houseNumber.trim()) addressParts.push(formData.houseNumber.trim());
      addressParts.push(currentStreet);
      if (formData.landmark.trim()) addressParts.push(`(Near ${formData.landmark.trim()})`);
      if (formData.description.trim()) addressParts.push(`[${formData.description.trim()}]`);

      const finalAddressString = addressParts.join(", ");

      const payload = {
        label: formData.landmark.trim() || formData.name.trim() || "Home",
        street_address: finalAddressString,
        street_name: currentStreet,
        house_number: formData.houseNumber.trim() || undefined,
        landmark: formData.landmark.trim() || undefined,
        city: selectedLocation?.city || undefined,
        state: selectedLocation?.state || selectedState,
        country: "Nigeria",
        phone_number: formData.phone.trim(),
        latitude: selectedLocation?.lat ? Number(Number(selectedLocation.lat).toFixed(6)) : undefined,
        longitude: selectedLocation?.lon ? Number(Number(selectedLocation.lon).toFixed(6)) : undefined,
        is_default: true,
      };

      await addNewAddress(payload);

      // Invalidate cache so cart, choose-address, and profile update immediately
      queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });

      toast.success("Address saved successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error adding address:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to add address. Please check your inputs.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-display text-gray-900 pb-24 md:py-12">
      <div className="max-w-2xl mx-auto md:bg-white md:shadow-xl md:rounded-3xl md:border md:border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 bg-white border-b border-gray-100 md:px-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Add Delivery Address</h1>
          <div className="w-8"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 md:px-8 py-6 space-y-7 bg-white md:bg-transparent">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* CONTACT INFO */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Recipient Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08012345678 or +234..."
                  className={`w-full bg-gray-50 border ${
                    fieldErrors.phone ? "border-red-400 ring-2 ring-red-100" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                />
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-gray-100"></div>

          {/* LOCATION DETAILS */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Delivery Location
            </h2>

            {/* State Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                State*
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedLocation(null);
                }}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
              >
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Nominatim Street Search */}
            <div className="space-y-1.5 relative" ref={searchContainerRef}>
              <label htmlFor="searchQuery" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Search Street Address*
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedLocation(null);
                    setShowSuggestions(true);
                    if (fieldErrors.address) {
                      setFieldErrors((prev) => ({ ...prev, address: false }));
                    }
                  }}
                  onFocus={() => {
                    if (!selectedLocation && searchQuery.trim().length >= 3) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Type street, landmark, or area (e.g. Admiralty Way, Lekki)..."
                  className={`w-full bg-gray-50 border ${
                    fieldErrors.address ? "border-red-400 ring-2 ring-red-100" : "border-gray-200"
                  } rounded-xl pl-11 pr-10 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                  autoComplete="off"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSelectedLocation}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && debouncedQuery.trim().length >= 3 && !selectedLocation && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-64 overflow-y-auto z-50 divide-y divide-gray-50">
                  {isSearching ? (
                    <div className="p-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 text-lily animate-spin" /> Searching locations...
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left px-4 py-3.5 hover:bg-lily/5 text-sm text-gray-700 flex items-start gap-3 transition-colors group"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 group-hover:text-lily shrink-0 mt-0.5" />
                        <div className="flex-1 break-words">
                          <span className="font-semibold text-gray-900 block group-hover:text-lily">
                            {item.display_name.split(",")[0]}
                          </span>
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {item.display_name}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      No matching addresses found in {selectedState}. Try searching an area name.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* House Number & Landmark */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="houseNumber" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  House / Building / Flat No. <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  id="houseNumber"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  placeholder="e.g. Block 4, Flat 2B"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="landmark" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Nearest Landmark <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Opposite Zenith Bank"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
                />
              </div>
            </div>

            {/* Description / Delivery Instructions */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Delivery Instructions <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Ring the bell at the black gate, call upon arrival"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || (!selectedLocation && !searchQuery.trim())}
              className="w-full bg-lily text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-darklily transition-colors disabled:opacity-50 text-sm shadow-md shadow-lily/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Saving Address...
                </>
              ) : (
                "Save Address"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddressPage;
