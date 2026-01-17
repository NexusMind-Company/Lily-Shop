import React, { useState, useEffect, useMemo } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCartItems,
  selectCart,
  updateCartItem,
  removeFromCart,
} from "../../../redux/cartSlice";
import { useNavigate } from "react-router-dom";

const CartModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cart = useSelector(selectCart);
  const cartItems = useSelector(selectCartItems) || [];
  const cartItemCount = cartItems.length;

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [updatingItems, setUpdatingItems] = useState(new Set());
  
  const areAllSelected =
    cartItems.length > 0 && selectedItems.size === cartItems.length;

  useEffect(() => {
    setSelectedItems((prevSelected) => {
      const newSelected = new Set(prevSelected);
      const cartItemIds = new Set(cartItems.map((item) => item.id));
      let changed = false;
      for (const id of newSelected) {
        if (!cartItemIds.has(id)) {
          newSelected.delete(id);
          changed = true;
        }
      }
      return changed ? newSelected : prevSelected;
    });
  }, [cartItems]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await dispatch(updateCartItem({ id: itemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      console.error("Update failed:", error);
      alert(error?.error || "Failed to update quantity");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      // Remove from selected items
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } catch (error) {
      console.error("Remove failed:", error);
      alert("Failed to remove item");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Calculate total based on selected items
  const selectedTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.has(item.id)) {
        return total + (item.subtotal_naira || 0);
      }
      return total;
    }, 0);
  }, [cartItems, selectedItems]);

  const handleCheckoutClick = () => {
    if (selectedItems.size === 0) {
      alert("Please select one or more items to checkout.");
      return;
    }
    onClose();
    navigate("/checkout", {
      state: { selectedItemIds: Array.from(selectedItems) },
    });
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleToggleAll = () => {
    if (areAllSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  };

  const handleToggleItem = (id) => {
    setSelectedItems((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex justify-center items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="w-full max-w-xl bg-white rounded-t-3xl shadow-2xl flex flex-col h-[80vh] mb-15"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-center font-bold text-lg text-gray-800">
                Cart ({cartItemCount})
              </h2>
              <button
                onClick={onClose}
                className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            {/* Select All Section */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <p className="text-center font-bold text-lg text-gray-800">
                Items ({selectedItems.size} selected)
              </p>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="appearance-none border border-gray-400 checked:bg-lily h-5 w-5 text-lily rounded-full"
                  checked={areAllSelected}
                  onChange={handleToggleAll}
                  disabled={cartItems.length === 0}
                />
                <span className="font-bold text-lg text-gray-800">
                  {areAllSelected ? "Deselect All" : "Select All"}
                </span>
              </label>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">
                  Your cart is empty.
                </p>
              ) : (
                cartItems.map((item) => {
                  const isUpdating = updatingItems.has(item.id);
                  const priceChanged = item.price_changed || (item.price_kobo_snapshot !== item.current_price_kobo);
                  
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center space-x-3 border-b border-gray-200 pb-4 ${
                        isUpdating ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-2 w-30 flex-shrink-0">
                        <p className="text-sm text-gray-500 break-words">
                          {item.product?.user || item.product?.shop_name || "Seller"}
                        </p>
                        <img
                          src={item.product?.media_url || item.product?.image_url || "/placeholder.png"}
                          alt={item.product?.name || "Product"}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-800">
                          {item.product?.name || "Product"}
                        </h3>

                        <p className="text-sm text-gray-600">
                          ₦{formatPrice(item.current_price_kobo / 100)}
                        </p>
                        
                        {priceChanged && (
                          <p className="text-xs text-amber-600">
                            ⚠️ Price changed from ₦{formatPrice(item.price_kobo_snapshot / 100)}
                          </p>
                        )}

                        {!item.product?.in_stock && (
                          <p className="text-xs text-red-600 font-semibold">
                            Out of stock
                          </p>
                        )}

                        <div className="flex items-center mt-2 space-x-2">
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={isUpdating || item.quantity <= 1}
                              className="p-1 text-white bg-gray-300 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-2 font-medium text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={isUpdating || item.quantity >= (item.product?.quantity_available || 99)}
                              className="p-1 text-white bg-gray-900 rounded-full hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {item.product?.quantity_available && (
                            <span className="text-xs text-gray-500">
                              ({item.product.quantity_available} available)
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          Subtotal: ₦{formatPrice(item.subtotal_naira)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-between h-35">
                        <input
                          type="checkbox"
                          className="appearance-none checked:bg-lily border border-gray-400 h-5 w-5 text-lily rounded-full flex-shrink-0"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleToggleItem(item.id)}
                          disabled={isUpdating}
                        />

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                          className="text-gray-900 hover:text-red-700 p-1 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer: Total and Checkout Button */}
            {cartItems.length > 0 && (
              <div className="flex gap-4 items-center p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex flex-col items-start mb-4 w-[40%]">
                  <span className="text-lg font-bold text-gray-800">
                    Total Payment:
                  </span>
                  <span className="text-lg font-bold text-gray-800">
                    ₦{formatPrice(selectedTotal.toFixed(2))}
                  </span>
                </div>
                <button
                  onClick={handleCheckoutClick}
                  disabled={selectedItems.size === 0}
                  className="w-[60%] bg-lily text-white py-3 rounded-full text-xl font-semibold hover:bg-darklily transition-colors disabled:bg-ash disabled:cursor-not-allowed"
                >
                  Checkout ({selectedItems.size})
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartModal;