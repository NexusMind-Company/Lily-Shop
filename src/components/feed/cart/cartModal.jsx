import React, { useState, useEffect, useMemo } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCartItems,
  selectCart,
  updateCartItem,
  removeFromCart,
  fetchCart,
} from "../../../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const EMPTY_ARRAY = [];

const CartModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems) || EMPTY_ARRAY;
  const cartItemCount = cartItems.length;

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const areAllSelected =
    cartItems.length > 0 && selectedItems.size === cartItems.length;

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCart());
    }
  }, [isOpen, dispatch]);

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

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      await dispatch(
        updateCartItem({ id: itemId, quantity: newQuantity }),
      ).unwrap();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error?.error || "Failed to update quantity");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Remove this item from cart?")) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } catch (error) {
      console.error("Remove failed:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const selectedTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.has(item.id)) {
        const unitPrice =
          Number(item.price_naira) ||
          Number(item.product?.price_in_naira) ||
          (Number(item.total_price_naira)
            ? Number(item.total_price_naira) / (item.quantity || 1)
            : 0) ||
          (Number(item.subtotal_naira)
            ? Number(item.subtotal_naira) / (item.quantity || 1)
            : 0) ||
          (Number(item.price_kobo) ? Number(item.price_kobo) / 100 : 0) ||
          (Number(item.current_price_kobo)
            ? Number(item.current_price_kobo) / 100
            : 0) ||
          0;

        return total + unitPrice * item.quantity;
      }
      return total;
    }, 0);
  }, [cartItems, selectedItems]);

  const handleCheckoutClick = () => {
    if (selectedItems.size === 0) {
      toast.error("Please select one or more items to checkout.");
      return;
    }
    onClose();
    navigate("/checkout", {
      state: { selectedItemIds: Array.from(selectedItems) },
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || Number.isNaN(Number(price))) {
      return "0";
    }
    return Number(price)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

  const getProductImage = (product) => {
    if (!product) return "/feed-image.png";

    const rawMedia =
      product.all_media_urls?.length > 0
        ? product.all_media_urls
        : product.media?.length > 0
          ? product.media
          : product.media || product.media_url || product.image_url;

    if (Array.isArray(rawMedia) && rawMedia.length > 0) {
      const first = rawMedia[0];
      return typeof first === "string"
        ? first
        : first.src ||
            first.url ||
            first.image_url ||
            first.media_url ||
            "/feed-image.png";
    }

    if (typeof rawMedia === "string") return rawMedia;

    return "/feed-image.png";
  };

  // Early return prevents the component from rendering any DOM nodes when closed
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-70 bg-black/50 flex justify-center items-end pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col h-[80vh] mb-15 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-4 border-b border-gray-200 shrink-0">
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

        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">
              Your cart is empty.
            </p>
          ) : (
            cartItems.map((item) => {
              const isUpdating = updatingItems.has(item.id);

              const unitPrice =
                Number(item.price_naira) ||
                Number(item.product?.price_in_naira) ||
                (Number(item.total_price_naira)
                  ? Number(item.total_price_naira) / (item.quantity || 1)
                  : 0) ||
                (Number(item.subtotal_naira)
                  ? Number(item.subtotal_naira) / (item.quantity || 1)
                  : 0) ||
                (Number(item.price_kobo) ? Number(item.price_kobo) / 100 : 0) ||
                (Number(item.current_price_kobo)
                  ? Number(item.current_price_kobo) / 100
                  : 0) ||
                0;

              const derivedSubtotal = unitPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className={`flex items-center space-x-3 border-b border-gray-200 pb-4 ${
                    isUpdating ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <div className="flex flex-col gap-2 w-30 shrink-0">
                    <p className="text-sm text-gray-500 wrap-break-word">
                      {item.product?.user ||
                        item.product?.shop_name ||
                        "Seller"}
                    </p>
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product?.name || "Product"}
                      className="w-20 h-20 object-cover rounded-lg shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/feed-image.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-800">
                      {item.product?.name || "Product"}
                    </h3>

                    <p className="text-sm text-gray-600">
                      ₦{formatPrice(unitPrice)}
                    </p>

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
                          disabled={isUpdating}
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
                          disabled={
                            isUpdating ||
                            item.quantity >=
                              (item.product?.quantity_available || 99)
                          }
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
                      Subtotal: ₦{formatPrice(derivedSubtotal)}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-between h-35">
                    <input
                      type="checkbox"
                      className="appearance-none checked:bg-lily border border-gray-400 h-5 w-5 text-lily rounded-full shrink-0"
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

        {cartItems.length > 0 && (
          <div className="flex gap-4 items-center p-4 border-t border-gray-200 bg-white shrink-0">
            <div className="flex flex-col items-start mb-4 w-[40%]">
              <span className="text-lg font-bold text-gray-800">
                Total Payment:
              </span>
              <span className="text-lg font-bold text-gray-800">
                ₦{formatPrice(selectedTotal)}
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
      </div>
    </div>
  );
};

export default CartModal;
