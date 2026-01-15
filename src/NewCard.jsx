import React, { useState } from 'react'
import { BiChevronLeft } from 'react-icons/bi';
import { GoShieldCheck } from 'react-icons/go';

const NewCard = () => {
      const [isDefault, setIsDefault] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center  gap-12 px-4 py-4 border-b border-gray-200">
          <button className="p-1 -ml-1">
             <BiChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="ml-3 text-base font-medium">New card</h1>
        </div>

        {/* Form */}
        <div className="p-4">
          {/* Card Holder */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Card holder</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-gray-100 rounded-full text-base outline-none"
            />
          </div>

          {/* Card Number */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Card no</label>
            <input
              type="text"
              placeholder="5399**************"
              className="w-full px-4 py-3 bg-gray-100 rounded-full text-base outline-none"
            />
          </div>

          {/* Expiry and CVV */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-2">Expiry</label>
              <input
                type="text"
                placeholder="01/25"
                className="w-full px-4 py-3 bg-gray-100 rounded-full text-base outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-2">CVV</label>
              <input
                type="text"
                placeholder="XXX"
                className="w-full px-4 py-3 bg-gray-100 rounded-full text-base outline-none"
              />
            </div>
          </div>

          {/* Billing Address Title */}
          <div className="text-base font-semibold text-gray-900 mb-4 mt-6">Billing address</div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Address*</label>
            <input
              type="text"
              placeholder="Address"
              className="w-full px-4 py-3 bg-gray-100 rounded-full text-base outline-none"
            />
          </div>

          {/* City */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">City*</label>
            <input
              type="text"
              placeholder="City"
              className="w-full px-4 py-3 bg-gray-100 rounded-full text-base outline-none"
            />
          </div>

          {/* State */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">State*</label>
            <input
              type="text"
              placeholder="State"
              className="w-full px-4 py-3 bg-gray-100 rounded-full text-base outline-none"
            />
          </div>

          {/* ZIP Code */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">Zip code*</label>
            <input
              type="text"
              placeholder="ZIP code"
              className="w-full px-4 py-3 bg-gray-100 rounded-full text-base outline-none"
            />
          </div>

          {/* Set as Default Card */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-semibold text-gray-900">Set as default card</span>
            <button
              onClick={() => setIsDefault(!isDefault)}
              className={`w-12 h-6 rounded-full border-2 flex items-center transition-colors ${
                isDefault ? 'bg-[#4caf50] border-[#4caf50]' : 'bg-white border-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  isDefault ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Security Info */}
          <div className="flex items-start mb-6">
            <div className="flex items-center justify-center w-4 h-4 rounded-full mt-0.5 mr-2 flex-shrink-0">
               <GoShieldCheck/>
            </div>
            <span className="text-xs text-gray-600 leading-relaxed">
              Your payment info is safe with us
            </span>
          </div>

          {/* Add Card Button */}
          <button className="w-full bg-[#4caf50] hover:bg-[#58ce5c] text-white py-4 rounded-full text-base font-semibold transition-colors">
            Add card
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewCard
