import React, { useState } from 'react'
import { BiChevronLeft } from 'react-icons/bi';

const ChooseCard = () => {
      const [selectedCard, setSelectedCard] = useState(null);
    
      const cards = [
        {
          id: 1,
          name: 'John Doe',
          number: '5399**********48',
          expiry: '09/26',
          isDefault: true
        },
        {
          id: 2,
          name: 'John Doe',
          number: '5399**********72',
          expiry: '04/28',
          isDefault: false
        }
      ];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white h-screen">
        {/* Header */}
        <div className="flex items-center  gap-12 px-4 py-4 border-b border-gray-200">
          <button className="p-1 -ml-1">
             <BiChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="ml-3 text-base font-medium">Choose card</h1>
        </div>

        {/* Card List */}
        <div className="p-4">
          {cards.map((card) => (
            <div key={card.id} className="mb-4">
              <label className="flex items-start cursor-pointer">
                <div className="flex items-center h-6 mt-1">
                  <input
                    type="radio"
                    name="card"
                    checked={selectedCard === card.id}
                    onChange={() => setSelectedCard(card.id)}
                    className="w-5 h-5 border-2 bg-[#fffff] rounded-full appearance-none checked:border-8 checked:border-[#4caf50] cursor-pointer"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-normal text-black">{card.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">{card.number}</span>
                    {card.isDefault && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">Default</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Exp: {card.expiry}</div>
                </div>
              </label>
            </div>
          ))}

          {/* Add New Card */}
          <button className="flex items-center mt-6 text-[#d75dae] ">
            <span className="text-xl mr-2">+</span>
            <span className="text-base">Add new card</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChooseCard
