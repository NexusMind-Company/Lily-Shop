import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addNewCard } from "../api/checkoutApi";
import { ChevronLeft, Loader2, Lock } from "lucide-react";

const AddCardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    cardHolder: "John Doe",
    cardNumber: "5399************",
    expiry: "01/25",
    cvv: "XXX",
    address: "",
    city: "",
    state: "",
    zip: "",
    isDefault: true,
  });

  const mutation = useMutation({
    mutationFn: addNewCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedCards"] });
      navigate("/choose-card");
    },
    // TODO: Add onError handler
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate("/choose-card")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">New card</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Card holder
          </label>
          <input
            type="text"
            name="cardHolder"
            value={formData.cardHolder}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Card no</label>
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="5399************"
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
          />
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2 space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Expiry</label>
            <input
              type="text"
              name="expiry"
              value={formData.expiry}
              onChange={handleChange}
              placeholder="01/25"
              className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
            />
          </div>
          <div className="w-1/2 space-y-1.5">
            <label className="text-sm font-medium text-gray-700">CVV</label>
            <input
              type="text"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              placeholder="XXX"
              className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
            />
          </div>
        </div>

        <h3 className="font-semibold text-md text-gray-800 pt-4">
          Billing address
        </h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Address*</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">City*</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">State*</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Zip code*</label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            placeholder="ZIP code"
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <label htmlFor="isDefault" className="font-medium text-gray-700">
            Set as default card
          </label>
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="h-5 w-5 rounded text-lily focus:ring-lily"
          />
        </div>
        <p className="text-sm text-gray-500 flex items-center">
          <Lock size={14} className="mr-1" /> Your payment info is safe with us
        </p>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? (
            <Loader2 size={24} className="animate-spin mx-auto" />
          ) : (
            "Add card"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddCardPage;

