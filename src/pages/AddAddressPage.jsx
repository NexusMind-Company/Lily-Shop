import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addNewAddress } from "../api/checkoutApi";
import { ChevronLeft, Loader2 } from "lucide-react";

const AddAddressPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "John Doe",
    phone: "+234 80X XXX XXXX",
    address: "",
    city: "",
    state: "",
    zip: "",
    landmark: "",
    description: "",
  });

  const mutation = useMutation({
    mutationFn: addNewAddress,
    onSuccess: () => {
      // Invalidate and refetch the addresses list
      queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });
      navigate("/choose-address"); // Go back to the list
    },
    // TODO: Add onError handler
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple validation
    if (!formData.address || !formData.city || !formData.state) {
      alert("Please fill in all required fields.");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate("/choose-address")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Add new address</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h3 className="font-semibold text-md text-gray-800">Contact Info</h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Phone no</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+234 80X XXX XXXX"
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
          />
        </div>

        <h3 className="font-semibold text-md text-gray-800 pt-4">
          Delivery address
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
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Nearest Landmark
          </label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            placeholder="Nearest Landmark"
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g building type, gate color etc"
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-lily"
          />
        </div>
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
            "Add address"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddAddressPage;
