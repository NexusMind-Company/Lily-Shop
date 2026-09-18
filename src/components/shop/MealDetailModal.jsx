import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Flame, Info, Check } from 'lucide-react';

const MealDetailModal = ({ isOpen, onClose, meal, onConfirmOrder, shopName }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setIsAnimatingOut(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !isAnimatingOut) return null;

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // match transition duration
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleCheckout = () => {
    onConfirmOrder(meal, quantity);
  };

  const imageUrl = meal?.image_url || meal?.media;
  const hasMacros = meal?.calories || meal?.protein || meal?.carbs || meal?.fat;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isAnimatingOut ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Modal content */}
      <div 
        className={`relative w-full sm:w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-transform duration-300 ${isAnimatingOut ? 'translate-y-full sm:translate-y-4 sm:opacity-0' : 'translate-y-0 sm:opacity-100'}`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 custom-scrollbar pb-28">
          {/* Hero Image */}
          <div className="w-full h-64 sm:h-72 bg-gray-200 relative shrink-0">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={meal?.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                No image available
              </div>
            )}
            {/* Gradient overlay to smoothly blend image into content */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </div>

          {/* Details Section */}
          <div className="px-6 -mt-2 relative z-10 space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex justify-between items-start gap-4 mb-1">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {meal?.name}
                </h2>
                <p className="text-xl font-bold text-lily shrink-0">
                  ₦{meal?.price?.toLocaleString()}
                </p>
              </div>
              {shopName && (
                <p className="text-gray-500 font-medium">From {shopName}</p>
              )}
            </div>

            {/* Description */}
            {meal?.description && (
              <div className="text-gray-600 leading-relaxed text-[15px]">
                {meal.description}
              </div>
            )}

            {/* Nutritional Info (Macros) */}
            {hasMacros && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
                  <Flame size={18} className="text-orange-500" />
                  <h3>Nutritional Facts</h3>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {meal.calories && (
                    <div className="flex flex-col items-center justify-center py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                      <span className="text-[15px] font-bold text-gray-800">{meal.calories}</span>
                      <span className="text-[11px] text-gray-500 font-medium uppercase mt-0.5 tracking-wide">kcal</span>
                    </div>
                  )}
                  {meal.protein && (
                    <div className="flex flex-col items-center justify-center py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                      <span className="text-[15px] font-bold text-gray-800">{meal.protein}g</span>
                      <span className="text-[11px] text-gray-500 font-medium uppercase mt-0.5 tracking-wide">Protein</span>
                    </div>
                  )}
                  {meal.carbs && (
                    <div className="flex flex-col items-center justify-center py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                      <span className="text-[15px] font-bold text-gray-800">{meal.carbs}g</span>
                      <span className="text-[11px] text-gray-500 font-medium uppercase mt-0.5 tracking-wide">Carbs</span>
                    </div>
                  )}
                  {meal.fat && (
                    <div className="flex flex-col items-center justify-center py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                      <span className="text-[15px] font-bold text-gray-800">{meal.fat}g</span>
                      <span className="text-[11px] text-gray-500 font-medium uppercase mt-0.5 tracking-wide">Fat</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {meal?.ingredients && meal.ingredients.length > 0 && (
              <div className="pt-2">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info size={18} className="text-gray-400" />
                  Ingredients
                </h3>
                <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                  {meal.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <div className="mt-1 bg-green-100 p-0.5 rounded-full shrink-0">
                        <Check size={10} className="text-green-600" />
                      </div>
                      <span className="capitalize">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 sm:p-5 pb-8 sm:pb-5 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-gray-100 rounded-2xl p-1 h-14 w-36 shrink-0">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-600 transition-all active:scale-95"
                disabled={quantity <= 1}
              >
                <Minus size={20} className={quantity <= 1 ? "opacity-30" : ""} />
              </button>
              
              <span className="font-bold text-gray-900 text-lg w-6 text-center">{quantity}</span>
              
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-600 transition-all active:scale-95"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={!meal?.is_available}
              className={`flex-1 h-14 rounded-2xl font-bold text-[15px] transition-all active:scale-95 flex items-center justify-center gap-2 ${
                meal?.is_available 
                  ? "bg-lily text-white shadow-lg shadow-lily/25 hover:bg-darklily"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {meal?.is_available ? (
                <>
                  <span>Add to Order</span>
                  <span className="font-normal opacity-80 text-sm mx-1">•</span>
                  <span>₦{((meal?.price || 0) * quantity).toLocaleString()}</span>
                </>
              ) : (
                "Sold Out"
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MealDetailModal;
