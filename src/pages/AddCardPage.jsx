import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  CreditCard,
  Calendar,
  Lock,
  User,
  CheckSquare,
  Square,
} from "lucide-react";

const AddCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });
  const [isDefault, setIsDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      // Strip all non-digits and limit to 16 characters
      const stripped = value.replace(/\D/g, "").slice(0, 16);
      // Add a space after every 4 digits
      const formatted = stripped.replace(/(\d{4})(?=\d)/g, "$1 ");
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "expiryDate") {
      // Strip non-digits and limit to 4 characters
      const stripped = value.replace(/\D/g, "").slice(0, 4);
      // Add slash after 2nd digit
      let formatted = stripped;
      if (stripped.length >= 3) {
        formatted = `${stripped.slice(0, 2)}/${stripped.slice(2)}`;
      }
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "cvv") {
      // Strip non-digits and limit to 3 digits (or 4 for some cards)
      const stripped = value.replace(/\D/g, "").slice(0, 3);
      setFormData((prev) => ({ ...prev, [name]: stripped }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call for saving card details
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const previousPage = location.state?.from || "/cart";
      navigate(previousPage);
    } catch (error) {
      console.error("Failed to add card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Basic validation for UI button state
  const isFormValid =
    formData.cardNumber.replace(/\s/g, "").length === 16 &&
    formData.cardholderName.trim() !== "" &&
    formData.expiryDate.length === 5 &&
    formData.cvv.length === 3;

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="relative p-4 border-b border-gray-100 bg-white flex items-center justify-center flex-shrink-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 focus:outline-none"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-semibold text-lg text-gray-900">Add New Card</h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-28">
        <form
          id="add-card-form"
          onSubmit={handleSubmit}
          className="p-4 space-y-6"
        >
          {/* Card Details Section */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">
                Card Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="0000 0000 0000 0000"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-lily/20 focus:border-lily text-sm transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">
                Cardholder Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  placeholder="Name on card"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-lily/20 focus:border-lily text-sm transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Expiry Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className="w-full pl-10 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-lily/20 focus:border-lily text-sm transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  CVV
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="w-full pl-10 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-lily/20 focus:border-lily text-sm transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div
            className="flex items-center space-x-3 p-2 cursor-pointer group"
            onClick={() => setIsDefault(!isDefault)}
          >
            <button type="button" className="flex-shrink-0 focus:outline-none">
              {isDefault ? (
                <CheckSquare className="text-lily w-6 h-6" />
              ) : (
                <Square className="text-gray-400 group-hover:text-gray-600 transition-colors w-6 h-6" />
              )}
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Save card details
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Securely save this card for a faster checkout next time
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 w-full max-w-xl mx-auto z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <button
          type="submit"
          form="add-card-form"
          className="w-full bg-lily text-white py-3.5 rounded-full text-md font-semibold hover:bg-opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            "Save Card"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddCardPage;
