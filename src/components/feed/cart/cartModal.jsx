import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCartItems,
  updateItemQuantity,
  removeItemFromCart,
  selectCartItemCount,
} from "../../../redux/cartSlice";
import { useNavigate } from "react-router-dom";

const CartModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartItemCount = useSelector(selectCartItemCount);

  const [selectedItems, setSelectedItems] = useState(new Set());
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

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeItemFromCart(id));
    } else {
      dispatch(updateItemQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (id) => {
    dispatch(removeItemFromCart(id));
  };

  // Calculate total based on selected items
  const selectedTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.has(item.id)) {
        return total + item.price * item.quantity;
      }
      return total;
    }, 0);
  }, [cartItems, selectedItems]);

  //  handleCheckoutClick now passes selected IDs
  const handleCheckoutClick = () => {
    if (selectedItems.size === 0) {
      alert("Please select one or more items to checkout.");
      return;
    }
    onClose(); // Close the modal
    // Pass the selected IDs as an array in the navigation state
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
            className="w-full max-w-xl bg-white rounded-t-3xl shadow-2xl flex flex-col h-[90vh] mb-15"
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
                  className="appearance-none border border-gray-400 checked:bg-lily h-5 w-5 text-lily rounded-full" // Removed form-checkbox and ring
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
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 border-b border-gray-200 pb-4"
                  >
                    <div className="flex flex-col gap-2 w-30 flex-shrink-0">
                      <p className="text-sm text-gray-500 break-words">
                        {item.username}
                      </p>
                      <img
                        src={item.mediaSrc}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-800">
                        {item.productName}
                      </h3>

                      <p className="text-sm text-gray-600">
                        N{formatPrice(item.price)}
                      </p>
                      {item.color && (
                        <p className="text-sm text-gray-500">
                          Color: {item.color}
                        </p>
                      )}
                      {item.size && (
                        <p className="text-sm text-gray-500">
                          Size: {item.size}
                        </p>
                      )}
                      <div className="flex items-center mt-2 space-x-2">
                        <div className="flex items-center ">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 text-white bg-gray-300 rounded-full hover:bg-gray-700"
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
                            className="p-1 text-white bg-gray-900 rounded-full hover:bg-gray-500"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-between h-35">
                      <input
                        type="checkbox"
                        className="appearance-none checked:bg-lily border border-gray-400 h-5 w-5 text-lily rounded-full flex-shrink-0" // Removed form-checkbox and ring
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleToggleItem(item.id)}
                      />

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-900 hover:text-red-700 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer: Total and Checkout Button */}
            {cartItems.length > 0 && (
              <div className="flex gap-4 items-center p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex flex-col items-start mb-4 w-[40%]">
                  <span className="text-lg font-bold text-gray-800">
                    Total Payment:
                  </span>
                  {/*  Use selectedTotal */}
                  <span className="text-lg font-bold text-gray-800">
                    N{formatPrice(selectedTotal)}
                  </span>
                </div>
                <button
                  onClick={handleCheckoutClick}
                  //  Added disabled state
                  disabled={selectedItems.size === 0}
                  className="w-[60%] bg-lily text-white py-3 rounded-full text-xl font-semibold hover:bg-darklily transition-colors disabled:bg-ash"
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
