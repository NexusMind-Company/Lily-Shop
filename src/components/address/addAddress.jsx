import React, { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addNewAddress, fetchStates, fetchLgas } from "../../services/api";

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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  const { data: states = [], isLoading: statesLoading } = useQuery({
    queryKey: ["states"],
    queryFn: fetchStates,
  });

  const selectedStateId = useMemo(() => {
    const selectedState = states.find((s) => s.name === formData.state);
    return selectedState?.id ?? null;
  }, [states, formData.state]);

  const { data: lgas = [], isLoading: lgasLoading } = useQuery({
    queryKey: ["lgas", selectedStateId],
    queryFn: () => fetchLgas(selectedStateId),
    enabled: !!selectedStateId,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      ...(name === "state" ? { city: "" } : {}),
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
    if (!formData.address) {
      newErrors.address = true;
      if (!firstErrorRef) firstErrorRef = addressRef;
    }
    if (!formData.state) {
      newErrors.state = true;
      if (!firstErrorRef) firstErrorRef = stateRef;
    }
    if (!formData.city) {
      newErrors.city = true;
      if (!firstErrorRef) firstErrorRef = cityRef;
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error("Please fill in all required fields", { icon: "📍" });
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

      // 3. Construct payload matching API.yaml schema
      const payload = {
        label: formData.landmark || "Home",
        street_address: streetAddress,
        city: formData.city,
        state: formData.state,
        country: "Nigeria",
        postal_code: formData.zipCode || null,
        phone_number: formattedPhoneNumber,
        is_default: true,
      };

      await addNewAddress(payload);
      navigate(-1);
    } catch (err) {
      console.error("Error adding address:", err);
      // Display backend validation error if available, else fallback
      if (err.response?.data?.phone_number) {
        setError(`Phone Number Error: ${err.response.data.phone_number[0]}`);
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to add address. Please check your inputs and try again.",
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
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
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
                className={`w-1/3 bg-gray-50 border border-transparent rounded-full px-3 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors ${fieldErrors.phone ? "bg-red-50" : ""}`}
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
                className={`w-2/3 bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors ${fieldErrors.phone ? "bg-red-50" : ""}`}
              />
            </div>
            {fieldErrors.phone && <span className="text-red-500 text-xs mt-1 block px-2">Phone number is required</span>}
          </div>
        </section>

        <div className="h-px w-full bg-gray-100"></div>

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Delivery address</h2>

          <div className="space-y-1" ref={addressRef}>
            <label htmlFor="address" className="text-sm text-gray-700">
              Address*
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className={`w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors ${fieldErrors.address ? "ring-2 ring-red-500 bg-red-50/30" : ""}`}
            />
            {fieldErrors.address && <span className="text-red-500 text-xs mt-1 block px-2">Address is required</span>}
          </div>

          <div className="space-y-1" ref={stateRef}>
            <label htmlFor="state" className="text-sm text-gray-700">
              State*
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={statesLoading}
              className={`w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors disabled:opacity-50 ${fieldErrors.state ? "ring-2 ring-red-500 bg-red-50/30" : ""}`}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            {fieldErrors.state && <span className="text-red-500 text-xs mt-1 block px-2">State is required</span>}
          </div>

          <div className="space-y-1" ref={cityRef}>
            <label htmlFor="city" className="text-sm text-gray-700">
              LGA / City*
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={lgasLoading || !formData.state}
              className={`w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors disabled:opacity-50 ${fieldErrors.city ? "ring-2 ring-red-500 bg-red-50/30" : ""}`}
            >
              <option value="">Select LGA / City</option>
              {lgas.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            {fieldErrors.city && <span className="text-red-500 text-xs mt-1 block px-2">City is required</span>}
          </div>

          <div className="space-y-1">
            <label htmlFor="zipCode" className="text-sm text-gray-700">
              Zip code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="ZIP code (Optional)"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="landmark" className="text-sm text-gray-700">
              Nearest Landmark
            </label>
            <input
              type="text"
              id="landmark"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="Nearest Landmark"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
          </div>
        </section>

        <div className="h-px w-full bg-gray-100"></div>

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900">
            Describe your location as simple as possible
          </h2>

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g building type, gate color etc"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
          </div>
        </section>

        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-5 bg-white border-t border-gray-100">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-medium text-base rounded-full py-4 transition-colors focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 ${
              isLoading
                ? "bg-green-400 cursor-not-allowed text-white"
                : "bg-[#4CAF50] hover:bg-green-600 text-white"
            }`}
          >
            {isLoading ? "Saving..." : "Add address"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddressPage;
