import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2, Save, Camera, MapPin, Search } from "lucide-react";
import toast from "react-hot-toast";
import {
  updateFoodVendor,
  fetchStates,
  fetchLgas,
  fetchVendorProfileFormData,
} from "../../services/api";
import { fetchProfile } from "../../redux/profileSlice";

const EditVendorProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vendorData, setVendorData] = useState(null);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [lgasLoading, setLgasLoading] = useState(false);

  const [form, setForm] = useState({
    shop_name: "",
    description: "",
    address: "",
    houseNumber: "",
    landmark: "",
    lat: null,
    lon: null,
    category: "",
    contact_email: "",
    contact_phone: "",
    state: "",
    lga: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  // Find LGA and State names
  const selectedStateName = states.find((s) => s.id == form.state)?.name || "";
  const selectedLgaName = lgas.find((l) => l.id == form.lga)?.name || "";

  // Proxy-backed Nominatim Autocomplete Query
  const { data: suggestions = [], isFetching: isSearching } = useQuery({
    queryKey: ["nominatim", debouncedQuery, selectedLgaName, selectedStateName],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) return [];
      
      const res = await api.get("/locations/search/address/", {
        params: {
          q: debouncedQuery,
          lga: selectedLgaName,
          state: selectedStateName,
        }
      });
      return res.data;
    },
    enabled: debouncedQuery.length >= 3,
    staleTime: 60000 * 5,
  });

  const handleSelectAddress = (suggestion) => {
    setForm((prev) => ({
      ...prev,
      address: suggestion.display_name,
      lat: suggestion.lat,
      lon: suggestion.lon,
    }));
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
  };


  const loadVendorData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVendorProfileFormData();
      setVendorData(data);
      setForm({
        shop_name: data.name || "",
        description: data.description || "",
        address: data.address || data.street_address || "",
        houseNumber: "", // backend doesn't store this separated
        landmark: "",
        lat: data.latitude || null,
        lon: data.longitude || null,
        category: data.cuisine || "",
        contact_email: data.contact_email || "",
        contact_phone: data.contact_phone || "",
        state: data.state || "",
        lga: data.lga || "",
      });
      setSearchQuery(data.address || data.street_address || "");
      setProfileImagePreview(data.profile_image || data.profile_pic || "");
      setBannerImagePreview(data.banner_image || "");
    } catch (error) {
      console.error("Error loading vendor data:", error);
      toast.error("Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendorData();
  }, [loadVendorData]);

  useEffect(() => {
    const loadStates = async () => {
      setStatesLoading(true);
      try {
        const data = await fetchStates();
        setStates(data);
      } catch (err) {
        console.error("Failed to load states:", err);
      } finally {
        setStatesLoading(false);
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    const loadLgas = async () => {
      if (!form.state) {
        setLgas([]);
        return;
      }
      setLgasLoading(true);
      try {
        const data = await fetchLgas(form.state);
        setLgas(data);
      } catch (err) {
        console.error("Failed to load LGAs:", err);
      } finally {
        setLgasLoading(false);
      }
    };
    loadLgas();
  }, [form.state]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImageFile(file);
      setBannerImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!form.state || !form.lga || !form.address) {
      toast.error("State, LGA and Address are required");
      return;
    }
    setSaving(true);
    try {
      const finalAddressString = [
        form.address,
        form.houseNumber ? `House/Apt: ${form.houseNumber}` : null,
        form.landmark ? `Near: ${form.landmark}` : null
      ].filter(Boolean).join(", ");

      await updateFoodVendor({
        shop_name: form.shop_name,
        description: form.description,
        address: finalAddressString,
        latitude: form.lat,
        longitude: form.lon,
        state: form.state,
        lga: form.lga,
        category: form.category,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        profile_image:
          profileImageFile ||
          vendorData?.profile_image ||
          vendorData?.image_url ||
          null,
        banner_image: bannerImageFile || vendorData?.banner_image || null,
      });
      toast.success("Vendor profile updated successfully!");
      dispatch(fetchProfile());
      navigate(-1);
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      toast.error("Failed to update vendor profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white ">
        <Loader2 className="w-8 h-8 animate-spin text-lily" />
      </div>
    );
  }

  return (
    <div className="bg-white  min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 ">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} className="text-gray-800 " />
        </button>
        <h2 className="font-semibold text-lg text-gray-800 ">
          Edit Vendor Profile
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-lily font-semibold disabled:text-gray-400"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Image
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {bannerImagePreview ? (
                <img
                  src={bannerImagePreview}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No banner image
                </div>
              )}
              <label
                htmlFor="banner-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera size={24} className="text-white" />
              </label>
              <input
                id="banner-upload"
                type="file"
                onChange={handleBannerImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Profile Image
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 ">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              <label
                htmlFor="profile-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera size={20} className="text-white" />
              </label>
              <input
                id="profile-upload"
                type="file"
                onChange={handleProfileImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 ">
              Click to change profile picture
            </p>
          </div>
        </div>

        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Shop Name
          </label>
          <input
            type="text"
            value={form.shop_name}
            onChange={(e) => handleChange("shop_name", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition"
            placeholder="Enter shop name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* State Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              value={form.state}
              onChange={(e) => {
                setForm({ ...form, state: e.target.value, lga: "" });
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-lily transition"
              disabled={statesLoading}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* LGA Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LGA
            </label>
            <select
              value={form.lga}
              onChange={(e) => handleChange("lga", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-lily transition"
              disabled={lgasLoading || !form.state}
            >
              <option value="">Select LGA</option>
              {lgas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition resize-none"
            placeholder="Describe your food business"
          />
        </div>

        {/* Address Search */}
        <div className="relative" ref={searchRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address Search*
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                // Also update form address so it matches the typing
                setForm(prev => ({...prev, address: e.target.value}));
              }}
              onFocus={() => {
                if (searchQuery.length >= 3) setShowSuggestions(true);
              }}
              className="w-full pl-11 pr-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-lily transition"
              placeholder="Search for your street or area..."
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Loader2 className="h-4 w-4 animate-spin text-lily" />
              </div>
            )}
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && (debouncedQuery.length >= 3) && (
            <div 
              ref={suggestionContainerRef}
              className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto"
            >
              {suggestions.length > 0 ? (
                <ul className="py-2">
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index}
                      onClick={() => handleSelectAddress(suggestion)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors"
                    >
                      <MapPin className="h-5 w-5 text-lily mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{suggestion.display_name.split(',')[0]}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{suggestion.display_name}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : !isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No matching addresses found in {selectedLgaName || "selected LGA"}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* House / Apt Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              House/Apt No.
            </label>
            <input
              type="text"
              value={form.houseNumber}
              onChange={(e) => handleChange("houseNumber", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-lily transition"
              placeholder="e.g. 12"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nearby Landmark
            </label>
            <input
              type="text"
              value={form.landmark}
              onChange={(e) => handleChange("landmark", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-lily transition"
              placeholder="e.g. Opposite AP Filling Station"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Category
          </label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition"
            placeholder="e.g., Nigerian, Italian, Fast Food"
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={form.contact_email}
            onChange={(e) => handleChange("contact_email", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition"
            placeholder="Enter contact email"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={form.contact_phone}
            onChange={(e) => handleChange("contact_phone", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition"
            placeholder="Enter contact phone"
          />
        </div>
      </div>
    </div>
  );
};

export default EditVendorProfilePage;
