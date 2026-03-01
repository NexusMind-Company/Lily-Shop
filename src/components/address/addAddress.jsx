import React, { useState } from "react";
import { ChevronLeft, MapPin, Home, Building, User, Phone, Save, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { addNewAddress } from "../services/api";

export default function AddAddress() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/cart";

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    addressType: "home", // home, office, other
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{11}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Enter a valid 11-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // const handleSave = async () => {
  //   if (!validateForm()) {
  //     return;
  //   }

  //   setSaving(true);

  //   try {
  //     // TODO: Replace with actual API call
  //     // await api.post("/user/addresses", formData);
      
  //     // Simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 1500));

  //     setSuccess(true);
      
  //     // Navigate back after short delay
  //     setTimeout(() => {
  //       navigate(from, { replace: true });
  //     }, 1000);
  //   } catch (error) {
  //     console.error("Failed to save address:", error);
  //     setErrors({ submit: "Failed to save address. Please try again." });
  //     setSaving(false);
  //   }
  // };


  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Import at the top of your file
      // import { addNewAddress } from "../services/api";
      
      // Format the complete address string
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}${formData.landmark ? ', Near ' + formData.landmark : ''}`;
      
      // Call the API with formatted address
      await addNewAddress(fullAddress);

      setSuccess(true);
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Failed to save address:", error);
      setErrors({ 
        submit: error.response?.data?.detail || "Failed to save address. Please try again." 
      });
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
                Add Delivery Address
              </h1>
              <p className="text-sm text-gray-600">Enter your delivery details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Error Alert */}
        <AnimatePresence>
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-error/10 border-2 border-error/20 rounded-2xl p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error">{errors.submit}</p>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-success/10 border-2 border-success/20 rounded-2xl p-4"
            >
              <div className="flex items-center space-x-3">
                <Save className="w-5 h-5 text-success" />
                <p className="text-sm text-success font-semibold">Address saved successfully!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-card p-6 space-y-5"
        >
          {/* Address Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Address Type
            </label>
            <div className="flex gap-3">
              {[
                { value: "home", icon: Home, label: "Home" },
                { value: "office", icon: Building, label: "Office" },
                { value: "other", icon: MapPin, label: "Other" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => handleChange("addressType", value)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${
                    formData.addressType === value
                      ? "bg-gradient-to-br from-lily-500 to-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                  errors.fullName
                    ? "border-error focus:border-error focus:ring-error/20"
                    : "border-gray-200 focus:border-lily-500 focus:ring-lily-100"
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.fullName && (
              <p className="text-sm text-error mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                  errors.phoneNumber
                    ? "border-error focus:border-error focus:ring-error/20"
                    : "border-gray-200 focus:border-lily-500 focus:ring-lily-100"
                }`}
                placeholder="080XXXXXXXX"
                maxLength={11}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-error mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Street Address <span className="text-error">*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all resize-none ${
                errors.address
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-gray-200 focus:border-lily-500 focus:ring-lily-100"
              }`}
              placeholder="House number, street name"
            />
            {errors.address && (
              <p className="text-sm text-error mt-1">{errors.address}</p>
            )}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                  errors.city
                    ? "border-error focus:border-error focus:ring-error/20"
                    : "border-gray-200 focus:border-lily-500 focus:ring-lily-100"
                }`}
                placeholder="e.g. Ikeja"
              />
              {errors.city && (
                <p className="text-sm text-error mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State <span className="text-error">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                  errors.state
                    ? "border-error focus:border-error focus:ring-error/20"
                    : "border-gray-200 focus:border-lily-500 focus:ring-lily-100"
                }`}
              >
                <option value="">Select State</option>
                {nigerianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-sm text-error mt-1">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Landmark (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => handleChange("landmark", e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-lily-500 focus:ring-4 focus:ring-lily-100 transition-all"
              placeholder="e.g. Near Shoprite"
            />
          </div>
        </motion.div>

        {/* Info Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4"
        >
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Note:</strong> Please ensure your address details are accurate
            to avoid delivery delays.
          </p>
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={!saving && !success ? { scale: 1.02 } : {}}
          whileTap={!saving && !success ? { scale: 0.98 } : {}}
          onClick={handleSave}
          disabled={saving || success}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
            saving || success
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-lily-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving Address...</span>
            </>
          ) : success ? (
            <>
              <Save className="w-5 h-5" />
              <span>Address Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Address</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
