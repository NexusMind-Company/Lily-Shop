import React from "react";
import { BiChevronLeft } from "react-icons/bi";

const AddAddress = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white  shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-12 px-4 py-4 border-b border-gray-200">
          <button className="p-1 -ml-1">
            <BiChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="ml-3 text-lg font-semibold">Add new address</h1>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Contact Info Section */}
          <div>
            <h2 className="text-sm font-medium mb-3">Contact info</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-full text-sm focus:outline-none "
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Phone no</label>
                <input
                  type="tel"
                  name="phone"
                   className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-full text-sm focus:outline-none "
                />
              </div>
            </div>
          </div>

          {/* Delivery Address Section */}
          <div>
            <h2 className="text-sm font-medium mb-3">Delivery address</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                   className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-full text-sm focus:outline-none "
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  City<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city" 
                  className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-full text-sm focus:outline-none "
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  State<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-full text-sm focus:outline-none "
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Zip code<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zipCode"
                   className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-full text-sm focus:outline-none "
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Nearest Landmark</label>
                <input
                  type="text"
                  name="landmark"
                   className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-full text-sm focus:outline-none "
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <p className="text-sm font-medium  mb-1.5">Describe your location as simple as possible</p>
            <label className="block text-sm text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-3 py-2.5 bg-gray-50 border-0 resize-none rounded-full text-sm focus:outline-none "
            
            />
          </div>

          {/* Submit Button */}
          <button
            
            className="w-full bg-[#4caf50] hover:bg-[#58ce5c] text-white font-medium py-3 rounded-full transition-colors mt-6"
          >
            Add address
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;
