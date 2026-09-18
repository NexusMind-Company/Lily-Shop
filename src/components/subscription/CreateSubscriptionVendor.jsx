import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSubscriptionVendor } from "../../redux/createSubscriptionVendorSlice";
import { fetchStates, fetchLgas } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiUpload, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import { ArrowRight, Store, MapPin, CreditCard, Loader2 } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const CreateSubscriptionVendor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const { user_data } = useSelector((state) => state.auth);
  const { data: profileData } = useSelector((state) => state.profile);

  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [apiError, setApiError] = useState("");

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    description: "",
    state: "",
    lga: "",
    address: "",
    contact_email: "",
    contact_phone: "",
  });

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [, setStatesLoading] = useState(false);
  const [lgasLoading, setLgasLoading] = useState(false);

  // If already a vendor, redirect immediately
  const isAlreadyVendor = Boolean(
    user_data?.vendor_id || profileData?.user?.vendor_id,
  );

  useEffect(() => {
    if (isAlreadyVendor) {
      navigate("/vendor/dashboard", { replace: true });
    }
  }, [isAlreadyVendor, navigate]);

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
      if (!formData.state) {
        setLgas([]);
        return;
      }
      const selectedState = states.find((s) => s.name === formData.state);
      if (!selectedState) return;

      setLgasLoading(true);
      try {
        const data = await fetchLgas(selectedState.id);
        setLgas(data);
      } catch (err) {
        console.error("Failed to load lgas:", err);
      } finally {
        setLgasLoading(false);
      }
    };
    loadLgas();
  }, [formData.state, states]);

  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    };
  }, [profilePreview]);

  const validateImage = (file) => {
    if (!file) return "Shop image is required";
    if (!ALLOWED_TYPES.includes(file.type)) return "Only JPEG and PNG images are allowed";
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `Image size must not exceed ${MAX_FILE_SIZE_MB}MB`;
    return "";
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    if (profilePreview) URL.revokeObjectURL(profilePreview);
    
    const error = validateImage(file);
    if (error) {
      setErrors((prev) => ({ ...prev, image: error }));
      setProfileFile(null);
      setProfilePreview(null);
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleNextStep = () => {
    let stepErrors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) stepErrors.name = "Vendor name is required";
      if (!formData.description.trim()) stepErrors.description = "Description is required";
      const imageErr = validateImage(profileFile);
      if (imageErr) stepErrors.image = imageErr;
    } else if (currentStep === 2) {
      if (!formData.state.trim()) stepErrors.state = "State is required";
      if (!formData.lga.trim()) stepErrors.lga = "City/LGA is required";
      if (!formData.address.trim()) stepErrors.address = "Street address is required";
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
    if (!formData.contact_phone.trim()) {
      stepErrors.contact_phone = "Phone number is required";
    } else {
      const phoneRegex = /^(\+234|0)[789]\d{9}$/;
      if (!phoneRegex.test(formData.contact_phone)) {
        stepErrors.contact_phone = "Enter a valid Nigerian phone number";
      }
    }
    
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      stepErrors.contact_email = "Enter a valid email address";
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});

    setSubmissionStatus("loading");
    setApiError("");

    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("address", formData.address.trim());
    if (formData.state.trim()) submitData.append("state", formData.state.trim());
    if (formData.lga.trim()) submitData.append("lga", formData.lga.trim());
    if (formData.cuisine.trim()) submitData.append("cuisine", formData.cuisine.trim());
    if (formData.description.trim()) submitData.append("description", formData.description.trim());
    if (formData.contact_email.trim()) submitData.append("contact_email", formData.contact_email.trim());
    if (formData.contact_phone.trim()) submitData.append("contact_phone", formData.contact_phone.trim());
    if (profileFile) submitData.append("profile_image", profileFile);

    try {
      const res = await dispatch(createSubscriptionVendor(submitData)).unwrap();
      if (res) {
        setSubmissionStatus("success");
        setTimeout(() => {
          window.location.href = "/vendor/dashboard";
        }, 1500);
      }
    } catch (err) {
      setSubmissionStatus("error");
      setApiError(err?.message || "Failed to create vendor account. Please check your inputs.");
      toast.error(err?.message || "Failed to create vendor account.");
    }
  };

  if (isAlreadyVendor) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 mt-20 mb-20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Become a <span className="text-lily">Food Vendor</span> 🍳</h1>
          <p className="text-gray-500">Start selling your meals to thousands of customers.</p>
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
            { step: 3, icon: CreditCard, label: "Contact" }
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
        {submissionStatus === "success" && (
          <div className="w-full p-4 mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md">
            <div className="flex items-center gap-2">
              <FiCheck size={20} />
              <div>
                <p className="font-medium">Vendor account created successfully!</p>
                <p className="text-sm">Redirecting to your dashboard...</p>
              </div>
            </div>
          </div>
        )}

        {submissionStatus === "error" && (
          <div className="w-full p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
            <div className="flex items-center gap-2">
              <FiAlertCircle size={20} />
              <div>
                <p className="font-medium">Failed to create account</p>
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value});
                      setErrors({...errors, name: ""});
                    }}
                    className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                    placeholder="E.g. Mama's Kitchen"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cuisine Specialty (Optional)</label>
                  <input
                    type="text"
                    value={formData.cuisine}
                    onChange={(e) => {
                      setFormData({...formData, cuisine: e.target.value});
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
                    placeholder="E.g. Nigerian, Vegan, Fast Food"
                  />
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
                    placeholder="Tell customers about your food..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Logo</label>
                  <div className={`border-2 border-dashed ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-2xl p-6 text-center`}>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={(e) => handleImageSelect(e.target.files[0])}
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                    />
                    {profilePreview ? (
                      <div className="relative inline-block">
                        <img src={profilePreview} alt="Preview" className="h-32 w-32 object-cover rounded-xl shadow-sm border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => {
                            setProfileFile(null);
                            setProfilePreview(null);
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
                        setFormData({...formData, state: e.target.value, lga: ""});
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
                      value={formData.lga}
                      onChange={(e) => {
                        setFormData({...formData, lga: e.target.value});
                        setErrors({...errors, lga: ""});
                      }}
                      disabled={!formData.state || lgasLoading}
                      className={`w-full bg-gray-50 border ${errors.lga ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all disabled:opacity-50`}
                    >
                      <option value="">Select City</option>
                      {lgas.map((lga) => (
                        <option key={lga.id} value={lga.name}>{lga.name}</option>
                      ))}
                    </select>
                    {errors.lga && <p className="text-red-500 text-xs mt-1">{errors.lga}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({...formData, address: e.target.value});
                      setErrors({...errors, address: ""});
                    }}
                    className={`w-full bg-gray-50 border ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                    placeholder="123 Market Road"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Contact Information</h3>
                  <p className="text-xs text-gray-500">Enter the contact details that will receive order alerts and payouts.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => {
                      setFormData({...formData, contact_phone: e.target.value});
                      setErrors({...errors, contact_phone: ""});
                    }}
                    className={`w-full bg-gray-50 border ${errors.contact_phone ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                    placeholder="+2348000000000"
                  />
                  {errors.contact_phone && <p className="text-red-500 text-xs mt-1">{errors.contact_phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => {
                      setFormData({...formData, contact_email: e.target.value});
                      setErrors({...errors, contact_email: ""});
                    }}
                    className={`w-full bg-gray-50 border ${errors.contact_email ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all`}
                    placeholder="vendor@example.com"
                  />
                  {errors.contact_email && <p className="text-red-500 text-xs mt-1">{errors.contact_email}</p>}
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
                    disabled={submissionStatus === "loading"}
                    className="flex-1 bg-lily text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {submissionStatus === "loading" ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Account"}
                    {submissionStatus !== "loading" && <FiCheck size={18} />}
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

export default CreateSubscriptionVendor;
