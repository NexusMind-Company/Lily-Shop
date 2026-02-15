import React, { useState } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import { FaCheck } from 'react-icons/fa';


const PickupAddress = () => {
  const [selectedAddress, setSelectedAddress] = useState(1);

  const addresses = [
    {
      id: 1,
      type: 'Pickup',
      address: '4 Sandoli Shopping complex, Ikoyi, Lagos, Nigeria'
    },
    {
      id: 2,
      type: 'Pickup',
      address: '4 Sandoli Shopping complex, Ikoyi, Lagos, Nigeria'
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-md mx-auto bg-white h-screen">
        {/* Header */}
        <div className="flex items-center gap-12 px-4 py-4 border-b border-gray-200">
          <button className="p-1 -ml-1">
             <BiChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-lg font-semibold">Choose pickup address</h1>
        </div>

        {/* Address List */}
        <div className="p-4">
          {addresses.map((address) => (
            <div key={address.id} className="mb-4">
              <label className="flex items-start cursor-pointer">
                <div className="flex items-center h-6 mt-1">
                  {selectedAddress === address.id ? (
                    <div className="w-6 h-6 rounded-full bg-[#4caf50] flex items-center justify-center">
                        <FaCheck className='text-white w-4'/>
                    </div>
                  ) : (
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === address.id}
                      onChange={() => setSelectedAddress(address.id)}
                      className="w-6 h-6 border-2 border-gray-300 rounded-full appearance-none cursor-pointer"
                    />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-base font-semibold text-black">{address.type}</div>
                  <div className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {address.address}
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PickupAddress
