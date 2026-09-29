import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addNewAddress, searchAddressLocations, updateProfile } from "../services/api";
import InterestsSelector from "../components/profile/InterestsSelector";
import PageSEO from "../components/common/PageSEO";
import {
  ArrowRight,
  User,
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  Search,
  X,
  Building,
} from "lucide-react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

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

const UserOnboardingWizard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user_data, is_authenticated } = useSelector((state) => state.auth || {});

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Basic Profile
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Step 2: Address with Nominatim search
  const [selectedState, setSelectedState] = useState("Lagos");
  const [addressQuery, setAddressQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [apartmentOrLandmark, setApartmentOrLandmark] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const debouncedAddressQuery = useDebounce(addressQuery, 400);

  // Initialize profile data from user_data
  useEffect(() => {
    if (user_data) {
      setProfileData({
        firstName: user_data.first_name || user_data.firstName || "",
        lastName: user_data.last_name || user_data.surname || "",
        phone: user_data.phone_number || user_data.phone || "",
      });
    }
  }, [user_data]);

  // Nominatim Address Suggestions
  const { data: addressSuggestions = [], isFetching: isSearchingLocation } = useQuery({
    queryKey: ["nominatimAddressOnboarding", debouncedAddressQuery, selectedState],
    queryFn: async () => {
      if (!debouncedAddressQuery || debouncedAddressQuery.trim().length < 3) return [];
      return await searchAddressLocations(debouncedAddressQuery.trim(), selectedState);
    },
    enabled: debouncedAddressQuery.trim().length >= 3 && !selectedLocation,
    staleTime: 60000,
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.firstName.trim() || !profileData.lastName.trim() || !profileData.phone.trim()) {
      toast.error("Please fill in all basic details.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const rawPhone = profileData.phone.replace(/[^\d+]/g, "");

      await updateProfile({
        first_name: profileData.firstName.trim(),
        last_name: profileData.lastName.trim(),
        phone_number: rawPhone,
      });

      setCurrentStep(2);
    } catch (err) {
      toast.error(err?.message || "Failed to save profile details.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSelectLocation = (item) => {
    const addressObj = item.address || {};
    const detectedCity =
      addressObj.city ||
      addressObj.town ||
      addressObj.suburb ||
      addressObj.county ||
      addressObj.city_district ||
      "";
    const detectedState = addressObj.state || selectedState;

    setSelectedLocation({
      displayName: item.display_name,
      lat: item.lat,
      lon: item.lon,
      city: detectedCity,
      state: detectedState,
    });
    setAddressQuery(item.display_name);
    setShowSuggestions(false);
  };

  const handleClearSelectedLocation = () => {
    setSelectedLocation(null);
    setAddressQuery("");
    setShowSuggestions(false);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    const fullStreet = selectedLocation?.displayName || addressQuery.trim();
    if (!fullStreet) {
      toast.error("Please search and select your address.");
      return;
    }

    const finalStreetAddress = apartmentOrLandmark.trim()
      ? `${apartmentOrLandmark.trim()}, ${fullStreet}`
      : fullStreet;

    setIsSavingAddress(true);
    try {
      await addNewAddress({
        label: "Home",
        street_address: finalStreetAddress,
        landmark: apartmentOrLandmark.trim() || undefined,
        city: selectedLocation?.city || undefined,
        state: selectedLocation?.state || selectedState,
        country: "Nigeria",
        phone_number: profileData.phone || user_data?.phone_number || undefined,
        latitude: selectedLocation?.lat || undefined,
        longitude: selectedLocation?.lon || undefined,
        is_default: true,
      });

      toast.success("Delivery address saved successfully!");
      setCurrentStep(3);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to save delivery address.";
      toast.error(errMsg);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleFinish = () => {
    localStorage.removeItem("is_new_registration");
    localStorage.setItem("onboarded_interests", "true");
    if (user_data) {
      if (user_data.id) localStorage.setItem(`onboarded_interests_${user_data.id}`, "true");
      if (user_data.email) localStorage.setItem(`onboarded_interests_${user_data.email}`, "true");
      if (user_data.username) localStorage.setItem(`onboarded_interests_${user_data.username}`, "true");
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-display">
      <PageSEO title="Welcome to LilyShop" />

      <div className="w-full max-w-xl">
        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-lily -z-10 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>

          {[
            { step: 1, icon: User, label: "Profile" },
            { step: 2, icon: MapPin, label: "Address" },
            { step: 3, icon: Sparkles, label: "Interests" },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors duration-300 ${
                  currentStep === s.step
                    ? "bg-lily text-white ring-4 ring-lily/20"
                    : currentStep > s.step
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-400 border border-gray-200"
                }`}
              >
                {currentStep > s.step ? <CheckCircle2 size={20} /> : <s.icon size={18} />}
              </div>
              <span
                className={`text-xs font-bold ${
                  currentStep >= s.step ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* STEP 1: Basic Profile */}
          {currentStep === 1 && (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-gray-900 mb-2">
                  Welcome to LilyShop! 🎉
                </h1>
                <p className="text-gray-500 text-sm">
                  Let's personalize your experience with your name and contact details.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, firstName: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all text-sm font-medium"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, lastName: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all text-sm font-medium"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all text-sm font-medium"
                    placeholder="08012345678 or +234..."
                  />

                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-lily text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-darklily transition-colors disabled:opacity-50 mt-6 shadow-md shadow-lily/20"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    "Continue to Address"
                  )}
                  {!isUpdatingProfile && <ArrowRight size={18} />}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Address with Nominatim Search */}
          {currentStep === 2 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-lily/10 text-lily flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">
                  Where should we deliver? 📍
                </h2>

              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-5">
                {/* State Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedLocation(null);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-lily/20 focus:border-lily block p-3.5 font-medium outline-none transition-colors"
                  >
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nominatim Search Input */}
                <div className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Search Street Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={addressQuery}
                      onChange={(e) => {
                        setAddressQuery(e.target.value);
                        setSelectedLocation(null);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => {
                        if (!selectedLocation && addressQuery.trim().length >= 3) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="Type street, landmark, or area (e.g. Admiralty Way, Lekki)..."
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-lily/20 focus:border-lily block p-3.5 pl-10 pr-10 font-medium outline-none transition-colors"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    {addressQuery && (
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
                  {showSuggestions && debouncedAddressQuery.trim().length >= 3 && !selectedLocation && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50 divide-y divide-gray-50">
                      {isSearchingLocation ? (
                        <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-lily" /> Searching address suggestions...
                        </div>
                      ) : addressSuggestions.length > 0 ? (
                        addressSuggestions.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLocation(item)}
                            className="w-full text-left px-4 py-3 hover:bg-lily/5 text-sm text-gray-700 flex items-start gap-2.5 transition-colors group"
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
                        <div className="p-4 text-center text-sm text-gray-500">
                          No locations found in {selectedState}. Try searching another area or typing more details.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Optional Apartment / Suite / Landmark Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    Apartment / Suite / Landmark <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={apartmentOrLandmark}
                    onChange={(e) => setApartmentOrLandmark(e.target.value)}
                    placeholder="e.g. Flat 3B, Blue Gate, Opposite Zenith Bank"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-lily/20 focus:border-lily block p-3.5 font-medium outline-none transition-colors"
                  />

                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAddress || (!selectedLocation && !addressQuery.trim())}
                    className="flex-1 bg-lily text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-darklily transition-colors disabled:opacity-50 text-sm shadow-md shadow-lily/20"
                  >
                    {isSavingAddress ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      "Save Address & Continue"
                    )}
                    {!isSavingAddress && <ArrowRight size={18} />}
                  </button>
                </div>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors"
                  >
                    Skip address for now
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Interests Selector */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 p-2 sm:p-6 pb-20">
              <InterestsSelector
                mode="onboarding"
                onComplete={handleFinish}
                onSkip={handleFinish}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOnboardingWizard;
