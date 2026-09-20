import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api, addNewAddress } from "../../services/api";
import { MapPin, Search, Loader2 } from "lucide-react";

const AddAddressPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    countryCode: "+234",
    phone: "",
    stateId: "",
    stateName: "",
    lgaId: "",
    lgaName: "",
    cityId: "",
    cityName: "",
    address: "",
    houseNumber: "",
    landmark: "",
    description: "",
    lat: null,
    lon: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Queries for Cascading Flow
  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const res = await api.get("/locations/states/");
      return res.data;
    },
    staleTime: 60000 * 60,
  });

  const { data: lgas = [], isFetching: isLoadingLgas } = useQuery({
    queryKey: ["lgas", formData.stateId],
    queryFn: async () => {
      if (!formData.stateId) return [];
      const res = await api.get(`/locations/lgas/?state_id=${formData.stateId}`);
      return res.data;
    },
    enabled: !!formData.stateId,
    staleTime: 60000 * 60,
  });

  const { data: cities = [], isFetching: isLoadingCities } = useQuery({
    queryKey: ["cities", formData.lgaId],
    queryFn: async () => {
      if (!formData.lgaId) return [];
      const res = await api.get(`/locations/cities/?lga_id=${formData.lgaId}`);
      return res.data;
    },
    enabled: !!formData.lgaId,
    staleTime: 60000 * 60,
  });

  // Proxy-backed Nominatim Autocomplete Query
  const { data: suggestions = [], isFetching: isSearching } = useQuery({
    queryKey: ["nominatim", debouncedQuery, formData.lgaName, formData.stateName],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) return [];
      const res = await api.get(`/locations/search/`, {
        params: {
          query: debouncedQuery,
          lga: formData.lgaName,
          state: formData.stateName,
        },
      });
      return res.data;
    },
    enabled: debouncedQuery.length >= 3 && !!formData.stateName && !!formData.lgaName,
    staleTime: 60000,
  });

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    const stateName = states.find((s) => s.id.toString() === stateId)?.name || "";
    setFormData((prev) => ({
      ...prev,
      stateId,
      stateName,
      lgaId: "",
      lgaName: "",
      cityId: "",
      cityName: "",
    }));
  };

  const handleLgaChange = (e) => {
    const lgaId = e.target.value;
    const lgaName = lgas.find((l) => l.id.toString() === lgaId)?.name || "";
    setFormData((prev) => ({
      ...prev,
      lgaId,
      lgaName,
      cityId: "",
      cityName: "",
    }));
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    const cityName = cities.find((c) => c.id.toString() === cityId)?.name || "";
    setFormData((prev) => ({
      ...prev,
      cityId,
      cityName,
    }));
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.display_name,
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
    if (!formData.stateId || !formData.lgaId) {
      toast.error("Please select a State and LGA");
      return;
    }
    const currentAddress = formData.address || searchQuery;
    if (!currentAddress && !formData.landmark) {
      newErrors.address = true;
      if (!firstErrorRef) firstErrorRef = searchRef;
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      if (newErrors.address) {
        toast.error("Please provide a street address or landmark", { icon: "📍" });
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
      let rawPhone = formData.phone.replace(/\D/g, "");
      if (formData.countryCode === "+234" && rawPhone.startsWith("0")) {
        rawPhone = rawPhone.substring(1);
      }
      const formattedPhoneNumber = `${formData.countryCode}${rawPhone}`;

      const currentAddress = formData.address || searchQuery;
      const finalAddressString = [
        currentAddress,
        formData.description ? `(${formData.description})` : ""
      ].filter(Boolean).join(" - ");

      const payload = {
        label: formData.landmark || "Home",
        street_address: finalAddressString || formData.landmark || "Manual Address",
        street_name: currentAddress,
        house_number: formData.houseNumber,
        landmark: formData.landmark,
        city: formData.cityId || null,
        custom_city_name: (!formData.cityId && formData.cityName) ? formData.cityName : null,
        lga: formData.lgaId,
        state: formData.stateId,
        country: "Nigeria",
        phone_number: formattedPhoneNumber,
        latitude: formData.lat || null,
        longitude: formData.lon || null,
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24 md:py-12">
      <div className="max-w-2xl mx-auto md:bg-white md:shadow-sm md:rounded-2xl md:border md:border-gray-100 overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-center relative px-4 py-5 bg-white border-b border-gray-100 md:bg-transparent md:px-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 md:left-8 p-2 focus:outline-none hover:bg-gray-50 rounded-full transition-colors"
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
          <h1 className="text-lg font-bold text-gray-800">Add new address</h1>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-5 md:px-8 py-6 space-y-8 bg-white md:bg-transparent">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* CONTACT INFO */}
          <section className="space-y-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Contact Info</h2>

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone no*
              </label>
              <div 
                ref={phoneRef} 
                className={`flex space-x-2 transition-all duration-300 rounded-xl ${fieldErrors.phone ? "ring-2 ring-red-500 bg-red-50/30" : ""}`}
              >
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className={`w-[120px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all ${fieldErrors.phone ? "border-red-300" : ""}`}
                >
                  <option value="+234">NG (+234)</option>
                  <option value="+1">US (+1)</option>
                  <option value="+44">UK (+44)</option>
                  <option value="+233">GH (+233)</option>
                </select>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="80X XXX XXXX"
                  className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all ${fieldErrors.phone ? "border-red-300" : ""}`}
                />
              </div>
              {fieldErrors.phone && <span className="text-red-500 text-xs mt-1 block">Phone number is required</span>}
            </div>
          </section>

          <div className="h-px w-full bg-gray-100"></div>

          {/* HIERARCHICAL LOCATION */}
          <section className="space-y-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Location Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* STATE */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">State*</label>
                <select
                  value={formData.stateId}
                  onChange={handleStateChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* LGA */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">LGA*</label>
                <div className="relative">
                  <select
                    value={formData.lgaId}
                    onChange={handleLgaChange}
                    disabled={!formData.stateId}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  {isLoadingLgas && <Loader2 className="w-4 h-4 text-gray-400 animate-spin absolute right-10 top-4 pointer-events-none" />}
                </div>
              </div>
            </div>

            {/* CITY (Optional) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">City / Town (Optional)</label>
              <div className="relative">
                {cities.length > 0 ? (
                  <select
                    value={formData.cityId}
                    onChange={handleCityChange}
                    disabled={!formData.lgaId}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter your city/town (Optional)"
                    value={formData.cityName || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cityName: e.target.value, cityId: "" }))}
                    disabled={!formData.lgaId}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                )}
                {isLoadingCities && <Loader2 className="w-4 h-4 text-gray-400 animate-spin absolute right-10 top-4 pointer-events-none" />}
              </div>
            </div>
            
            {/* STREET SEARCH */}
            <div className="space-y-1.5 relative" ref={searchRef}>
              <label htmlFor="searchQuery" className="text-sm font-medium text-gray-700">
                Street Address Search*
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
                  disabled={!formData.lgaId}
                  placeholder={formData.lgaId ? "Search your street name..." : "Select State and LGA first"}
                  className={`w-full bg-gray-50 border ${fieldErrors.address ? "border-red-300" : "border-gray-200"} rounded-xl pl-11 pr-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  autoComplete="off"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Loader2 className="h-5 w-5 text-[#4eb75e] animate-spin" />
                  </div>
                )}
              </div>
              {fieldErrors.address && <span className="text-red-500 text-xs mt-1 block">Please select a valid street address from the dropdown</span>}

              {/* Suggestions Dropdown */}
              {showSuggestions && searchQuery.length >= 3 && (
                <div 
                  ref={suggestionContainerRef}
                  className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-64 overflow-y-auto"
                >
                  {!isSearching && suggestions.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      No matching addresses found in {formData.lgaName || "selected LGA"}
                    </div>
                  ) : (
                    <ul className="py-1">
                      {suggestions.map((suggestion) => (
                        <li 
                          key={suggestion.place_id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="p-3.5 border-b border-gray-50 last:border-0 hover:bg-[#f6f8f6] cursor-pointer transition-colors flex items-start gap-3"
                        >
                          <MapPin className="w-4 h-4 text-[#4eb75e] shrink-0 mt-0.5" />
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
                  <p className="text-xs text-gray-500 font-medium mb-1">Precise Location Set</p>
                  <p className="text-sm text-gray-900 leading-snug line-clamp-2">{formData.address}</p>
                </div>
              </div>
            )}
            
            {/* HOUSE NUMBER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="houseNumber" className="text-sm font-medium text-gray-700">
                  House / Building No.
                </label>
                <input
                  type="text"
                  id="houseNumber"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  placeholder="e.g. 15A"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all"
                />
              </div>

              {/* LANDMARK */}
              <div className="space-y-1.5">
                <label htmlFor="landmark" className="text-sm font-medium text-gray-700">
                  Nearest Landmark
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Home, Next to bank"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all"
                />
              </div>
            </div>
            
            {/* DESCRIPTION */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description / Instructions (Optional)
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g building type, gate color"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4eb75e]/20 focus:border-[#4eb75e] transition-all"
              />
            </div>

          </section>

          {/* SUBMIT BUTTON */}
          <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-40 md:static md:bg-transparent md:border-0 md:p-0 md:pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full md:w-auto md:min-w-[200px] md:float-right font-medium text-base rounded-xl py-4 transition-all focus:outline-none focus:ring-4 focus:ring-[#4eb75e]/30 ${
                isLoading
                  ? "bg-green-400 cursor-not-allowed text-white"
                  : "bg-[#4eb75e] hover:bg-[#3da64d] text-white shadow-lg shadow-green-500/20"
              }`}
            >
              {isLoading ? "Saving Address..." : "Save Address"}
            </button>
            {/* Clear floats on desktop */}
            <div className="clear-both"></div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddressPage;
