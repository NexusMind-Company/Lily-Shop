import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../redux/authSlice";
import { addNewAddress, fetchStates, fetchLgas } from "../services/api";
import InterestsSelector from "../components/profile/InterestsSelector";
import PageSEO from "../components/common/PageSEO";
import { ArrowRight, User, MapPin, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

const UserOnboardingWizard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user_data, isLoading: isUpdatingProfile } = useSelector((state) => state.auth);
  
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Basic Profile
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Step 2: Address
  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    country: "Nigeria"
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Initialize from user_data
  useEffect(() => {
    if (user_data) {
      setProfileData({
        firstName: user_data.first_name || "",
        lastName: user_data.last_name || "",
        phone: user_data.phone_number || "",
      });
    }
  }, [user_data]);

  // Fetch states for address
  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: fetchStates,
  });

  const selectedStateId = states.find((s) => s.name === addressData.state)?.id || null;

  const { data: lgas = [], isLoading: lgasLoading } = useQuery({
    queryKey: ["lgas", selectedStateId],
    queryFn: () => fetchLgas(selectedStateId),
    enabled: !!selectedStateId,
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.firstName.trim() || !profileData.lastName.trim() || !profileData.phone.trim()) {
      toast.error("Please fill in all basic details.");
      return;
    }

    try {
      // Clean phone number (strip non-numeric except +)
      let rawPhone = profileData.phone.replace(/[^\d+]/g, "");
      
      await dispatch(updateProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone_number: rawPhone
      })).unwrap();
      
      setCurrentStep(2);
    } catch (err) {
      toast.error(err?.message || "Failed to save profile details.");
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressData.street.trim() || !addressData.city.trim() || !addressData.state.trim()) {
      toast.error("Please complete your address details.");
      return;
    }

    setIsSavingAddress(true);
    try {
      await addNewAddress({
        label: "Home",
        street_address: addressData.street,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        phone_number: profileData.phone,
        is_default: true,
      });
      setCurrentStep(3);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save address.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("onboarded_interests", "true");
    if (user_data?.id) {
      localStorage.setItem(`onboarded_interests_${user_data.id}`, "true");
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
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
            { step: 3, icon: Sparkles, label: "Interests" }
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors duration-300 ${
                currentStep === s.step ? "bg-lily text-white ring-4 ring-lily/20" : 
                currentStep > s.step ? "bg-green-500 text-white" : "bg-white text-gray-400 border border-gray-200"
              }`}>
                {currentStep > s.step ? <CheckCircle2 size={20} /> : <s.icon size={18} />}
              </div>
              <span className={`text-xs font-bold ${currentStep >= s.step ? "text-gray-900" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {currentStep === 1 && (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-gray-900 mb-2">Welcome to LilyShop! 🎉</h1>
                <p className="text-gray-500">Let's set up your profile quickly.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
                    placeholder="+2348000000000"
                  />
                  <p className="text-xs text-gray-400 mt-1">We need this for successful deliveries.</p>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50 mt-4"
                >
                  {isUpdatingProfile ? <Loader2 className="animate-spin w-5 h-5" /> : "Continue"}
                  {!isUpdatingProfile && <ArrowRight size={18} />}
                </button>
              </form>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Where do we deliver? 📍</h2>
                <p className="text-gray-500">Add a default address to checkout faster later.</p>
              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Country</label>
                  <select
                    disabled
                    value={addressData.country}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed font-medium"
                  >
                    <option value="Nigeria">Nigeria</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                    <select
                      required
                      value={addressData.state}
                      onChange={(e) => setAddressData({...addressData, state: e.target.value, city: ""})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">City / LGA</label>
                    <select
                      required
                      value={addressData.city}
                      onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                      disabled={!selectedStateId || lgasLoading}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all disabled:opacity-50"
                    >
                      <option value="">Select City</option>
                      {lgas.map((lga) => (
                        <option key={lga.id} value={lga.name}>{lga.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addressData.street}
                    onChange={(e) => setAddressData({...addressData, street: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {isSavingAddress ? <Loader2 className="animate-spin w-5 h-5" /> : "Save Address"}
                    {!isSavingAddress && <ArrowRight size={18} />}
                  </button>
                </div>
                <div className="text-center mt-2">
                   <button type="button" onClick={() => setCurrentStep(3)} className="text-xs text-gray-400 font-bold hover:text-gray-600">Skip for now</button>
                </div>
              </form>
            </div>
          )}

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
