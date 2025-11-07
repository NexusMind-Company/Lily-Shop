import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { selectCartItems } from "../../../redux/cartSlice";
import { createOrder } from "../../../redux/orderSlice";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../../../services/api";
import { usePayment } from "../../../context/paymentContext";
import { formatPrice, formatDate } from "../../../utils/formatters";

const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { setPaymentData } = usePayment();
  const allCartItems = useSelector(selectCartItems);
  const selectedItemIds = location.state?.selectedItemIds;

  const { creating: isCreatingOrder, createError } = useSelector(
    (state) => state.orders
  );

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const itemsToCheckout = useMemo(() => {
    if (selectedItemIds && Array.isArray(selectedItemIds)) {
      if (!allCartItems) return [];
      return allCartItems.filter((item) => selectedItemIds.includes(item.id));
    }
    return allCartItems || [];
  }, [allCartItems, selectedItemIds]);

  const totalDeliveryCharge = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce(
      (sum, item) => sum + (item.deliveryCharge || 0),
      0
    );
  }, [itemsToCheckout]);

  const itemCount = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce((count, item) => count + item.quantity, 0);
  }, [itemsToCheckout]);

  const subtotal = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [itemsToCheckout]);

  const estimatedDeliveryTime = useMemo(() => {
    if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
      return "Calculating...";
    }
    try {
      const allMinTimestamps = itemsToCheckout.map((item) =>
        new Date(item.estimatedDeliveryMinDate || Date.now()).getTime()
      );
      const allMaxTimestamps = itemsToCheckout.map((item) =>
        new Date(item.estimatedDeliveryMaxDate || Date.now()).getTime()
      );
      const validMinTimestamps = allMinTimestamps.filter((ts) => !isNaN(ts));
      const validMaxTimestamps = allMaxTimestamps.filter((ts) => !isNaN(ts));

      if (validMinTimestamps.length === 0 || validMaxTimestamps.length === 0) {
        return "N/A";
      }

      const earliestMinDate = new Date(Math.min(...validMinTimestamps));
      const latestMaxDate = new Date(Math.max(...validMaxTimestamps));
      const formattedMin = formatDate(earliestMinDate);
      const formattedMax = formatDate(latestMaxDate);
      if (!formattedMin || !formattedMax) return "N/A";
      if (formattedMin === formattedMax) return formattedMax;
      return `${formattedMin} - ${formattedMax}`;
    } catch (error) {
      console.error("Error parsing delivery dates:", error);
      return "N/A";
    }
  }, [itemsToCheckout]);

  const [deliveryAddress, setDeliveryAddress] = useState("Loading address...");
  const [pickupAddressDisplay, setPickupAddressDisplay] =
    useState("Loading pickup...");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    if (userProfile) {
      setDeliveryAddress(
        userProfile.deliveryAddress || "No delivery address set"
      );
      setPickupAddressDisplay(
        userProfile.pickupAddress || "No preferred pickup set"
      );
    } else if (profileError) {
      console.error("Failed to load user profile:", profileError);
      setDeliveryAddress("Error loading address");
      setPickupAddressDisplay("Error loading pickup");
    }
  }, [userProfile, profileError]);

  useEffect(() => {
    if (
      !isLoadingProfile &&
      (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0)
    ) {
      const timer = setTimeout(() => {
        if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
          console.log("No items to checkout, redirecting...");
          navigate("/");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [itemsToCheckout, isLoadingProfile, navigate]);

  const estimatedTotal = subtotal + totalDeliveryCharge - appliedDiscount;
  const estimatedTotalKobo = Math.round(estimatedTotal * 100);

  const handleApplyVoucher = () => {
    if (voucherCode === "SAVE10") {
      setAppliedDiscount(subtotal * 0.1);
      console.log("Voucher applied");
    } else {
      setAppliedDiscount(0);
      console.log("Invalid voucher");
    }
  };

  const handleProceedToPayment = async () => {
    if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
      console.error("Cannot proceed, no items to checkout.");
      return;
    }

    const orderItems = itemsToCheckout.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      // Add any other fields the API order item requires
      // e.g., price: item.price
    }));

    const orderData = {
      items: orderItems,
      total_amount_kobo: estimatedTotalKobo,
      payment_method: paymentMethod,
    };

    try {
      const actionResult = await dispatch(createOrder(orderData)).unwrap();
      const newOrder = actionResult;

      setPaymentData({
        amount: estimatedTotal,
        vendorName: itemsToCheckout[0]?.username || "Lily Vendor",
        orderId: newOrder.id,
        amountPaid: 0,
      });

      if (paymentMethod === "card") {
        navigate("/password");
      } else if (paymentMethod === "bank") {
        navigate("/bank-transfer");
      } else if (paymentMethod === "wallet") {
        navigate("/password");
      } else {
        console.warn && alert("Unhandled payment method:", paymentMethod);
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      alert(`Error: ${createError || "Could not create your order."}`);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen max-w-xl mx-auto bg-white">
        <Loader2 size={32} className="text-lily animate-spin" />
        <p className="text-gray-500 mt-3">Loading details...</p>
      </div>
    );
  }

  if (
    !isLoadingProfile &&
    (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0)
  ) {
    return (
      <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white shadow-md">
        <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-bold text-lg text-gray-800">Confirm Order</h2>
        </div>
        <p className="text-center text-gray-500 mt-8 flex-1 p-4">
          No items selected for checkout, or cart is empty.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white shadow-md">
      {/* Header */}
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Confirm Order</h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Items in Cart Summary */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-3">
            Items ({itemCount})
          </h3>
          <div className="space-y-3">
            {itemsToCheckout.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <div className="flex flex-col gap-2 items-start">
                  <p className="text-sm text-gray-500">{item.username}</p>
                  <img
                    src={item.mediaSrc}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/64x64/eee/ccc?text=Error";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {item.productName}
                  </p>
                  <p className="text-sm font-semibold text-pink">
                    N{formatPrice(item.price * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  {item.color && (
                    <p className="text-sm text-gray-500">Color: {item.color}</p>
                  )}
                  {item.size && (
                    <p className="text-xs text-gray-500">Size: {item.size}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-3">
            Delivery address
          </h3>
          <div className="p-3 rounded-lg text-sm space-y-2">
            <p className="font-medium">{deliveryAddress}</p>
            <button
              onClick={() =>
                navigate("/add-address", {
                  state: { from: location.pathname },
                })
              }
              className="text-pink text-sm hover:underline"
            >
              + Add address
            </button>
          </div>
        </div>

        {/* Delivery Time */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-3">
            Delivery time
          </h3>
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
            <p className="font-medium">
              Estimated Delivery: {estimatedDeliveryTime}
            </p>
          </div>
        </div>

        {/* Pickup Option */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-3">Pickup</h3>
          <div className="p-3 rounded-lg text-sm space-y-2">
            <p className="font-medium">{pickupAddressDisplay}</p>
            <button
              onClick={() =>
                navigate("/choose-pickup", {
                  state: { from: location.pathname },
                })
              }
              className="text-pink text-sm hover:underline"
            >
              Change preferred pickup
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-3">
            Payment Method
          </h3>
          <div className="space-y-3">
            <div className="flex flex-col items-start justify-between p-3 rounded-lg">
              <label
                htmlFor="payment-card"
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  id="payment-card"
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="form-radio text-lily focus:ring-lily"
                />
                <div>
                  <span className="text-gray-700 font-medium">Card</span>
                  <p className="text-xs text-gray-500">
                    S**** **********45 (Default)
                  </p>
                  <p className="text-xs text-gray-500">Exp: 09/28</p>
                </div>
              </label>
              <button
                onClick={() =>
                  navigate("/add-card", {
                    state: { from: location.pathname },
                  })
                }
                className="text-pink text-sm hover:underline pl-8 pt-1"
              >
                + Add new card
              </button>
            </div>
            <label className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={() => setPaymentMethod("bank")}
                className="form-radio text-lily focus:ring-lily"
              />
              <span className="text-gray-700 font-medium">Bank Transfer</span>
            </label>
            <label className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="wallet"
                checked={paymentMethod === "wallet"}
                onChange={() => setPaymentMethod("wallet")}
                className="form-radio text-lily focus:ring-lily"
              />
              <span className="text-gray-700 font-medium">Lily Wallet</span>
            </label>
          </div>
        </div>

        {/* Voucher Code */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-3">
            Voucher code
          </h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg w-[50%] p-3 focus:ring-lily focus:border-lily"
            />
            <button
              onClick={handleApplyVoucher}
              className="bg-lily w-[50%] text-white px-5 py-3 rounded-lg font-medium hover:bg-darklily transition-colors disabled:bg-ash"
              disabled={!voucherCode}
            >
              Apply
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-3">
            Order summary
          </h3>
          <div className="p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Items total ({itemCount})</span>
              <span>N{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="text-red-500">
                -N{formatPrice(appliedDiscount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span>N{formatPrice(totalDeliveryCharge)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery time</span>
              <span>{estimatedDeliveryTime}</span>
            </div>
          </div>
          {/* Legal Text */}
          <div className="flex space-x-2 items-center text-gray-500 mt-2">
            <p className="text-sm">
              Your payment is held in escrow till order has been confirmed as
              delivered
            </p>
          </div>
          <div className="flex space-x-2 items-center text-gray-500">
            <p className="text-sm break-words">
              Orders may be returned within 7 days of purchase. Learn more about
              our {"  "}
              <a href="#" className="text-pink hover:underline">
                return policy
              </a>
            </p>
          </div>
          <div className="text-sm text-gray-500">
            By clicking &ldquo;proceed&ldquo;, you confirm you have read and
            agree to our{" "}
            <a href="#" className="text-pink hover:underline">
              terms of services
            </a>
            .
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex w-full justify-between p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex flex-col w-[40%] justify-between font-bold text-md pt-2 mt-2">
          <span>Total Payment</span>
          <span className="text-xl text-lily">
            N{formatPrice(estimatedTotal)}
          </span>
        </div>
        <button
          onClick={handleProceedToPayment}
          className="w-[60%] bg-lily text-white py-3 rounded-full text-lg font-semibold hover:bg-darklily transition-colors flex items-center justify-center"
          disabled={
            !itemsToCheckout || itemsToCheckout.length === 0 || isCreatingOrder
          }
        >
          {isCreatingOrder ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            "Proceed"
          )}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
