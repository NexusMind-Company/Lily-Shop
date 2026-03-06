import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddAddressPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    landmark: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NOTE: As per the current Lily Shop API.yaml, there is no endpoint for user addresses.
    // Once the backend supports it, replace this console.log with your API POST request.
    // Example: await api.post('/user/addresses/', formData);
    console.log("Ready to submit address payload:", formData);

    // navigate(-1); // Navigate back upon successful submission
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-24">
      {/* Header */}
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
        {/* Contact Info Section */}
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
              Phone no
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234 80X XXX XXXX"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
          </div>
        </section>

        <div className="h-px w-full bg-gray-100"></div>

        {/* Delivery Address Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Delivery address</h2>

          <div className="space-y-1">
            <label htmlFor="address" className="text-sm text-gray-700">
              Address*
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Address"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="city" className="text-sm text-gray-700">
              City*
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="City"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="state" className="text-sm text-gray-700">
              State*
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              placeholder="State"
              className="w-full bg-gray-50 border border-transparent rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="zipCode" className="text-sm text-gray-700">
              Zip code*
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
              placeholder="ZIP code"
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

        {/* Description Section */}
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

        {/* Fixed Bottom Button Area */}
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100">
          <button
            type="submit"
            className="w-full bg-[#4CAF50] hover:bg-green-600 text-white font-medium text-base rounded-full py-4 transition-colors focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
          >
            Add address
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddressPage;
