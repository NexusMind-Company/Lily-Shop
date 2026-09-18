import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createShop, resetCreateShopState } from "../../redux/createShopSlice";
import { FiUpload, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import { ArrowRight, ArrowLeft, Store, MapPin, CreditCard, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchStates, fetchLgas } from "../../services/api";

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const CreateShop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const {
    status,
    error: apiError,
    success,
  } = useSelector((state) => state.createShop);

  const isLoading = status === "loading";

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    state: "",
    city: "",
    street: "",
    phone: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch states for address
  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: fetchStates,
  });

  const selectedStateId = states.find((s) => s.name === formData.state)?.id || null;

  const { data: lgas = [], isLoading: lgasLoading } = useQuery({
    queryKey: ["lgas", selectedStateId],
    queryFn: () => fetchLgas(selectedStateId),
    enabled: !!selectedStateId,
  });

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(resetCreateShopState());
        navigate("/myShop");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate, dispatch]);

  const validateImage = (file) => {
    if (!file) return "Shop image is required";
    if (!ALLOWED_TYPES.includes(file.type)) return "Only JPEG and PNG images are allowed";
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `Image size must not exceed ${MAX_FILE_SIZE_MB}MB`;
    return "";
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    
    const error = validateImage(file);
    if (error) {
      setErrors((prev) => ({ ...prev, image: error }));
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleNextStep = () => {
    let stepErrors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) stepErrors.name = "Shop name is required";
      if (!formData.category.trim()) stepErrors.category = "Category is required";
      if (!formData.description.trim()) stepErrors.description = "Description is required";
      const imageErr = validateImage(imageFile);
      if (imageErr) stepErrors.image = imageErr;
    } else if (currentStep === 2) {
      if (!formData.state.trim()) stepErrors.state = "State is required";
      if (!formData.city.trim()) stepErrors.city = "City is required";
      if (!formData.street.trim()) stepErrors.street = "Street address is required";
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let stepErrors = {};
    if (!formData.phone.trim()) {
      stepErrors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^(\+234|0)[789]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        stepErrors.phone = "Enter a valid Nigerian phone number";
      }
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});

    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("address", `${formData.street.trim()}, ${formData.city.trim()}, ${formData.state.trim()}`);
    submitData.append("category", formData.category.trim());
    submitData.append("description", formData.description.trim());
    submitData.append("owner_phone", formData.phone.trim());
    submitData.append("image", imageFile);

    await dispatch(createShop(submitData));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 mt-20 mb-20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Create your <span className="text-lily">Shop</span> 🏪</h1>
          <p className="text-gray-500">Reach thousands of customers on LilyShop.</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-8 relative px-4">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-10 rounded-full"></div>
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-lily -z-10 rounded-full transition-all duration-500"
            style={{ width: `calc(${((currentStep - 1) / 2) * 100}% - 24px)` }}
          ></div>
          
          {[
            { step: 1, icon: Store, label: "Shop Info" },
            { step: 2, icon: MapPin, label: "Location" },
            { step: 3, icon: CreditCard, label: "Payout" }
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-2 bg-gray-50">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors duration-300 ${
                currentStep === s.step ? "bg-lily text-white ring-4 ring-lily/20" : 
                currentStep > s.step ? "bg-green-500 text-white" : "bg-white text-gray-400 border border-gray-200"
              }`}>
                {s.icon && <s.icon size={18} />}
              </div>
              <span className={`text-xs font-bold ${currentStep >= s.step ? "text-gray-900" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Success / Error Messages */}
        {success && (
          <div className="w-full p-4 mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md">
            <div className="flex items-center gap-2">
              <FiCheck size={20} />
              <div>
                <p className="font-medium">Shop created successfully!</p>
                <p className="text-sm">Redirecting to your dashboard...</p>
              </div>
            </div>
          </div>
        )}

        {apiError && !success && (
          <div className="w-full p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
            <div className="flex items-center gap-2">
              <FiAlertCircle size={20} />
              <div>
                <p className="font-medium">Failed to create shop</p>
                <p className="text-sm">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value});
                      setErrors({...errors, name: ""});
                    }}
                    className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                    placeholder="E.g. Lily's Fashion"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({...formData, category: e.target.value});
                      setErrors({...errors, category: ""});
                    }}
                    className={`w-full bg-gray-50 border ${errors.category ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                  >
                    <option value="">Select Category</option>
                    <option value="fashion">Fashion & Clothing</option>
                    <option value="electronics">Electronics</option>
                    <option value="food">Food & Groceries</option>
                    <option value="beauty">Beauty & Cosmetics</option>
                    <option value="home">Home & Furniture</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({...formData, description: e.target.value});
                      setErrors({...errors, description: ""});
                    }}
                    className={`w-full bg-gray-50 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                    placeholder="Tell customers what you sell..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Shop Logo / Image</label>
                  <div className={`border-2 border-dashed ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-2xl p-6 text-center`}>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={(e) => handleImageSelect(e.target.files[0])}
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                    />
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-xl shadow-sm border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-lily transition-colors"
                      >
                        <FiUpload size={24} className="mb-2" />
                        <span className="text-sm font-medium">Click to upload image</span>
                        <span className="text-xs mt-1">JPEG, PNG up to 5MB</span>
                      </button>
                    )}
                  </div>
                  {errors.image && <p className="text-red-500 text-xs mt-1 text-center">{errors.image}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors mt-4"
                >
                  Next Step <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => {
                        setFormData({...formData, state: e.target.value, city: ""});
                        setErrors({...errors, state: ""});
                      }}
                      className={`w-full bg-gray-50 border ${errors.state ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">City / LGA</label>
                    <select
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({...formData, city: e.target.value});
                        setErrors({...errors, city: ""});
                      }}
                      disabled={!selectedStateId || lgasLoading}
                      className={`w-full bg-gray-50 border ${errors.city ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all disabled:opacity-50`}
                    >
                      <option value="">Select City</option>
                      {lgas.map((lga) => (
                        <option key={lga.id} value={lga.name}>{lga.name}</option>
                      ))}
                    </select>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => {
                      setFormData({...formData, street: e.target.value});
                      setErrors({...errors, street: ""});
                    }}
                    className={`w-full bg-gray-50 border ${errors.street ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                    placeholder="123 Market Road"
                  />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
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
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors"
                  >
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="bg-lily/5 border border-lily/20 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Payout Information</h3>
                  <p className="text-xs text-gray-500">Enter the contact number that will receive order alerts and payouts.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Owner Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({...formData, phone: e.target.value});
                      setErrors({...errors, phone: ""});
                    }}
                    className={`w-full bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                    placeholder="+2348000000000"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Optional Bank Details for visual completion of step 3, though not sent to API yet */}
                <div className="pt-4 border-t border-gray-100 opacity-60">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bank Details (Coming Soon)</p>
                  <div className="space-y-3">
                    <input disabled type="text" placeholder="Bank Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-not-allowed" />
                    <input disabled type="text" placeholder="Account Number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-not-allowed" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-lily text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Shop"}
                    {!isLoading && <FiCheck size={18} />}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateShop;
