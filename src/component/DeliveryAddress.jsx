import React, { useState } from 'react';
import { BiChevronLeft, BiPlus } from 'react-icons/bi';
import { FaCheck } from 'react-icons/fa';
const DeliveryAddress = () => {
      const [selectedAddress, setSelectedAddress] = useState('default');
     const addresses = [
    {
      id: 'default',
      label: 'Default Address',
      name: 'Balogun Adeolu',
      phone: '+234 800 123 4567',
      address: '22 Olowalu Street, Ikeja, Lagos, Nigeria'
    },
    {
      id: 'secondary',
      label: null,
      name: 'Balogun Adeolu',
      phone: '+234 800 123 4567',
      address: '22 Ademola Tokunbo, Victoria Island, Lagos, Nigeria'
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50  flex items-start justify-center">
      <div className="w-full max-w-md bg-white h-screen">
        {/* Header */}
        <div className="flex items-center  gap-12 px-4 py-4 border-b border-gray-200">
          <button className="p-1 -ml-1">
             <BiChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="ml-3 text-base font-medium">Choose delivery address</h1>
        </div>

        {/* Address List */}
        <div className="p-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="mb-4 cursor-pointer"
              onClick={() => setSelectedAddress(addr.id)}
            >
              <div className="flex items-start">
                {/* Radio Button */}
                <div className="flex-shrink-0 mt-0.5">
                  {selectedAddress === addr.id ? (
                    <div className="w-5 h-5 rounded-full  bg-[#4caf50]  flex items-center justify-center">
                      <FaCheck className='text-white w-3'/>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                  )}
                </div>

                {/* Address Details */}
                <div className="ml-3 flex-1">
                  {addr.label && (
                    <div className="text-xs font-medium text-gray-900 mb-1">
                      {addr.label}
                    </div>
                  )}
                  <div className="text-sm font-medium text-gray-900">
                    {addr.name} {addr.phone}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {addr.address}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Address Button */}
          <button className="flex items-center text-[#d75dae] cursor-pointer text-sm font-medium mt-2">
            <BiPlus className="w-4 h-4 mr-1" />
            Add new address
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeliveryAddress
