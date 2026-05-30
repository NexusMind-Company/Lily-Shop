import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddCardPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDefault = () => {
    setFormData((prev) => ({
      ...prev,
      isDefault: !prev.isDefault,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Note: No card saving endpoint exists in the provided Lily Shop API docs.
    // Insert your payment gateway tokenization logic (e.g., Paystack) here.
    console.log("Submitting card details:", formData);

    // Simulate successful save and navigate back
    setTimeout(() => {
      navigate(-1);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-8">
      {/* Header */}
      <header className="flex items-center px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-800"
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold pr-8">
          New card
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="px-5 pt-6">
        {/* Card Details Section */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="cardHolder"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Card holder
            </label>
            <input
              type="text"
              id="cardHolder"
              name="cardHolder"
              placeholder="John Doe"
              value={formData.cardHolder}
              onChange={handleChange}
              className="w-full bg-gray-50 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>

          <div>
            <label
              htmlFor="cardNumber"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Card no
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              placeholder="5399****************"
              value={formData.cardNumber}
              onChange={handleChange}
              maxLength="19"
              className="w-full bg-gray-50 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="expiry"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Expiry
              </label>
              <input
                type="text"
                id="expiry"
                name="expiry"
                placeholder="01/25"
                value={formData.expiry}
                onChange={handleChange}
                maxLength="5"
                className="w-full bg-gray-50 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </div>
            <div>
              <label
                htmlFor="cvv"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                placeholder="XXX"
                value={formData.cvv}
                onChange={handleChange}
                maxLength="4"
                className="w-full bg-gray-50 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-8 -mx-5"></div>

        {/* Billing Address Section */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Billing address
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Address*
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-gray-50 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                City*
              </label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-gray-50 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                State*
              </label>
              <input
                type="text"
                id="state"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className="w-full bg-gray-50 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </div>

            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Zip code*
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                placeholder="ZIP code"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full bg-gray-50 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-8 -mx-5"></div>

        {/* Footer Options */}
        <div>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={toggleDefault}
          >
            <span className="font-medium text-gray-900 text-sm">
              Set as default card
            </span>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.isDefault ? "border-green-500" : "border-gray-300"}`}
            >
              {formData.isDefault && (
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-gray-500">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
            <span className="text-xs font-medium">
              Your payment info is safe with us
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white font-medium text-lg rounded-full py-4 mt-8 transition-colors active:scale-[0.98]"
        >
          Add card
        </button>
      </form>
    </div>
  );
};

export default AddCardPage;
