import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChevronLeft, Loader2, CreditCard, Wallet, MapPin } from "lucide-react";
import { selectCartItems, clearCart } from "../../../redux/cartSlice";
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

  // UI State
  const [deliveryAddress, setDeliveryAddress] = useState("Loading address...");
  const [pickupAddressDisplay, setPickupAddressDisplay] =
    useState("Loading pickup...");
  const [paymentMethod, setPaymentMethod] = useState("paystack"); // Default to Paystack
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Load User Profile Data
  useEffect(() => {
    if (userProfile) {
      // Use 'location' from API or fallback to 'address' or 'deliveryAddress'
      setDeliveryAddress(
        userProfile.location ||
          userProfile.address ||
          userProfile.deliveryAddress ||
          "No delivery address set"
      );
      setPickupAddressDisplay(
        userProfile.pickupAddress || "No preferred pickup set"
      );
    } else if (profileError) {
      setDeliveryAddress("Error loading address");
      setPickupAddressDisplay("Error loading pickup");
    }
  }, [userProfile, profileError]);

  // Redirect if empty
  useEffect(() => {
    if (
      !isLoadingProfile &&
      (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0)
    ) {
      const timer = setTimeout(() => {
        if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
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
    } else {
      setAppliedDiscount(0);
      alert("Invalid voucher code");
    }
  };

  const handleProceedToPayment = async () => {
    if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
      return;
    }

    if (deliveryAddress === "No delivery address set" || !deliveryAddress) {
      return alert("Please add a delivery address.");
    }

    const orderItems = itemsToCheckout.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      color: item.color || null,
      size: item.size || null,
    }));

    const orderData = {
      items: orderItems,
      total_amount_kobo: estimatedTotalKobo,
      payment_method: paymentMethod, // 'paystack' or 'wallet'
    };

    if (paymentMethod === "wallet") {
      // For Wallet: Verify password FIRST, then create order
      navigate("/password", { state: { orderPayload: orderData } });
    } else {
      // For Paystack: Create order immediately to get the Payment URL
      try {
        const actionResult = await dispatch(createOrder(orderData)).unwrap();

        // Save minimal payment data context just in case
        setPaymentData({
          amount: estimatedTotal,
          vendorName: itemsToCheckout[0]?.username || "Lily Vendor",
          orderId: actionResult.id,
        });

        // Redirect to Paystack
        if (actionResult.authorization_url) {
          dispatch(clearCart()); // Optional: Clear cart now or after success
          window.location.href = actionResult.authorization_url;
        } else {
          alert("Error: No payment link received from server.");
        }
      } catch (err) {
        console.error("Failed to create order:", err);
        alert(createError || "Could not create your order. Please try again.");
      }
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

  if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
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
          Cart is empty.
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Items Summary */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-3">
            Items ({itemCount})
          </h3>
          <div className="space-y-3">
            {itemsToCheckout.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg"
              >
                <div className="flex flex-col gap-2 items-start">
                  <img
                    src={item.mediaSrc}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0 border border-gray-200"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/64";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 line-clamp-1">
                    {item.productName}
                  </p>
                  <p className="text-sm font-bold text-pink">
                    N{formatPrice(item.price * item.quantity)}
                  </p>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    <span>Qty: {item.quantity}</span>
                    {item.color && <span>• {item.color}</span>}
                    {item.size && <span>• {item.size}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-md text-gray-800">
              Delivery address
            </h3>
            <button
              onClick={() =>
                navigate("/add-address", { state: { from: location.pathname } })
              }
              className="text-pink text-xs font-bold uppercase hover:underline"
            >
              Change / Add
            </button>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-sm flex items-start gap-2">
            <MapPin size={18} className="text-gray-400 mt-0.5" />
            <p className="font-medium text-gray-700">{deliveryAddress}</p>
          </div>
        </div>

        {/* Delivery Time */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-2">
            Delivery time
          </h3>
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
            Estimated Delivery:{" "}
            <span className="font-medium">{estimatedDeliveryTime}</span>
          </div>
        </div>

        {/* Pickup (Optional) */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-md text-gray-800">Pickup</h3>
            <button
              onClick={() =>
                navigate("/choose-pickup", {
                  state: { from: location.pathname },
                })
              }
              className="text-pink text-xs font-bold uppercase hover:underline"
            >
              Change
            </button>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-700">{pickupAddressDisplay}</p>
          </div>
        </div>

        {/* Payment Method - SIMPLIFIED */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-3">
            Payment Method
          </h3>
          <div className="space-y-3">
            {/* Paystack Option (Card, Bank, USSD) */}
            <label
              className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer border-2 transition-all ${
                paymentMethod === "paystack"
                  ? "border-pink bg-pink-50"
                  : "border-gray-100"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="paystack"
                checked={paymentMethod === "paystack"}
                onChange={() => setPaymentMethod("paystack")}
                className="form-radio text-pink focus:ring-pink"
              />
              <div className="flex-1 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <span className="text-gray-800 font-bold block">
                    Paystack
                  </span>
                  <span className="text-xs text-gray-500">
                    Card, Bank Transfer, USSD
                  </span>
                </div>
              </div>
            </label>

            {/* Lily Wallet Option */}
            <label
              className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer border-2 transition-all ${
                paymentMethod === "wallet"
                  ? "border-pink bg-pink-50"
                  : "border-gray-100"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="wallet"
                checked={paymentMethod === "wallet"}
                onChange={() => setPaymentMethod("wallet")}
                className="form-radio text-pink focus:ring-pink"
              />
              <div className="flex-1 flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <Wallet size={20} />
                </div>
                <div>
                  <span className="text-gray-800 font-bold block">
                    Lily Wallet
                  </span>
                  <span className="text-xs text-gray-500">
                    Pay from your balance
                  </span>
                  <p className="text-xs text-gray-700">Coming soon</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Voucher Code */}
        <div>
          <h3 className="font-semibold text-md text-gray-800 mb-2">
            Voucher code
          </h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-pink"
            />
            <button
              onClick={handleApplyVoucher}
              className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
              disabled={!voucherCode}
            >
              Apply
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Items total ({itemCount})</span>
            <span>N{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Discount</span>
            <span className="text-red-500">
              -N{formatPrice(appliedDiscount)}
            </span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Delivery fee</span>
            <span>N{formatPrice(totalDeliveryCharge)}</span>
          </div>
        </div>

        {/* Legal Text */}
        <div className="text-xs text-gray-400 space-y-1 text-start">
          <p>
            Your payment is held in escrow till order has been confirmed has
            delivered. Orders maybe returned within 7 days of purchase.
          </p>
          <p>
            Learn more about our{" "}
            <Link to="/about" className="text-pink">Return Policy</Link>.
          </p>
          <p>
            By clicking &quot;proceed&quot;, you confirm you have read agree to
            our <Link to="/about" className="text-pink">Terms of services</Link>
          </p>
        </div>
      </div>

      {/* Footer Button */}
      <div className="flex justify-between p-4 border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex-col border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-gray-900 text-lg">
          <span>Total Payment</span>
          <span className="text-lily">N{formatPrice(estimatedTotal)}</span>
        </div>
        <button
          onClick={handleProceedToPayment}
          disabled={!itemsToCheckout.length || isCreatingOrder}
          className="w-1/2 bg-lily text-white py-4 rounded-full text-lg font-bold hover:bg-darklily transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isCreatingOrder ? (
            <>
              <Loader2 size={24} className="animate-spin" /> Processing...
            </>
          ) : (
            `Proceed`
          )}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
