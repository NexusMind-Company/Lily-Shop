import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { selectCartItems } from "../../../redux/cartSlice";
import { useQuery } from "@tanstack/react-query";

// Placeholder - replace with your actual API call and auth logic
const fetchUserProfile = async () => {
  // const token = localStorage.getItem('authToken');
  // const res = await fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } });
  // if (!res.ok) throw new Error('Failed to fetch profile');
  // return res.json();
  // Mock data for example:
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  return {
    deliveryAddress: "15, Adeola Odeku Street, VI, Lagos",
    pickupAddress: "Shop C5, Ikeja City Mall, Lagos",
    // You would also fetch saved card details here
    // savedCard: {
    //   last4: "1145",
    //   expiry: "09/28",
    //   isDefault: true
    // }
  };
};

const formatDate = (date) => {
  if (!date || isNaN(new Date(date).getTime())) {
    return "";
  }
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const allCartItems = useSelector(selectCartItems);
  const selectedItemIds = location.state?.selectedItemIds;

  // Fetch User Profile Data
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const itemsToCheckout = useMemo(() => {
    if (!selectedItemIds) {
      return [];
    }
    return allCartItems.filter((item) => selectedItemIds.includes(item.id));
  }, [allCartItems, selectedItemIds]);

  // Calculate total fees by summing across ALL selected items
  const totalDeliveryCharge = useMemo(() => {
    return itemsToCheckout.reduce(
      (sum, item) => sum + (item.deliveryCharge || 0),
      0
    );
  }, [itemsToCheckout]);

  const itemCount = useMemo(
    () => itemsToCheckout.reduce((count, item) => count + item.quantity, 0),
    [itemsToCheckout]
  );

  const subtotal = useMemo(
    () =>
      itemsToCheckout.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [itemsToCheckout]
  );

  const estimatedDeliveryTime = useMemo(() => {
    if (!itemsToCheckout || itemsToCheckout.length === 0) {
      return "Calculating...";
    }

    // --- ASSUMPTION ---
    // This logic assumes your item data from the "feed api" (in Redux)
    // provides fields like:
    // item.estimatedDeliveryMinDate = "2025-10-28" (string)
    // item.estimatedDeliveryMaxDate = "2025-10-30" (string)

    try {
      // Get all min/max dates and convert them to numeric timestamps
      const allMinTimestamps = itemsToCheckout.map((item) =>
        new Date(item.estimatedDeliveryMinDate || Date.now()).getTime()
      );
      const allMaxTimestamps = itemsToCheckout.map((item) =>
        new Date(item.estimatedDeliveryMaxDate || Date.now()).getTime()
      );

      // Find the earliest min date and latest max date
      const earliestMinDate = new Date(Math.min(...allMinTimestamps));
      const latestMaxDate = new Date(Math.max(...allMaxTimestamps));

      const formattedMin = formatDate(earliestMinDate);
      const formattedMax = formatDate(latestMaxDate);

      // Handle case where dates are the same or invalid
      if (!formattedMin || !formattedMax) {
        return "N/A";
      }
      if (formattedMin === formattedMax) {
        return formattedMax;
      }

      return `${formattedMin} - ${formattedMax}`;
    } catch (error) {
      console.error("Error parsing delivery dates:", error);
      return "N/A"; // Fallback
    }
  }, [itemsToCheckout]); // Now depends on the items

  // State
  const [deliveryAddress, setDeliveryAddress] = useState("Loading address..."); // Initial state while fetching
  const [pickupAddressDisplay, setPickupAddressDisplay] =
    useState("Loading pickup..."); // Initial state while fetching
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Update state when profile data loads
  useEffect(() => {
    if (userProfile) {
      setDeliveryAddress(
        userProfile.deliveryAddress || "No delivery address set"
      );
      setPickupAddressDisplay(
        userProfile.pickupAddress || "No preferred pickup set"
      );
      // TODO: Set saved card details here from userProfile
    } else if (profileError) {
      setDeliveryAddress("Error loading address");
      setPickupAddressDisplay("Error loading pickup");
    }
  }, [userProfile, profileError]);

  // Redirect if no items
  useEffect(() => {
    // Only redirect if NOT loading profile and items are definitely empty or missing
    if (
      !isLoadingProfile &&
      (!selectedItemIds || selectedItemIds.length === 0)
    ) {
      navigate("/"); // Redirect to home
    }
  }, [selectedItemIds, isLoadingProfile, navigate]);

  const estimatedTotal = subtotal + totalDeliveryCharge + -appliedDiscount;

  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return "N/A";
    }
    return numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleApplyVoucher = () => {
    if (voucherCode === "SAVE10") {
      setAppliedDiscount(subtotal * 0.1);
      alert("Voucher applied successfully!");
    } else {
      setAppliedDiscount(0);
      alert("Invalid voucher code.");
    }
  };

  const handleProceedToPayment = () => {
    // Use an alert or console.log for debugging, not both usually
    console.log("Proceeding to payment with:", {
      // Switched to console.log
      itemsToCheckout,
      deliveryAddress,
      paymentMethod,
      estimatedTotal,
    });
    // TODO: Dispatch action to remove items from cart after successful order
    navigate("/order-confirmation"); // Navigate to next step
  };

  // Helper object for payment method labels
  const paymentLabels = {
    card: "Card (Default)",
    bank: "Bank Transfer",
    wallet: "Lily Wallet",
  };

  // Handle loading state for profile
  if (isLoadingProfile) {
    return (
      <div className="bg-white min-h-screen max-w-xl mx-auto shadow-md flex flex-col justify-center items-center">
        <p>Loading user details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen max-w-xl mx-auto shadow-md flex flex-col">
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
      {itemsToCheckout.length === 0 && !isLoadingProfile ? ( // Check loading state here too
        <p className="text-center text-gray-500 mt-8 flex-1">
          No items selected for checkout.
        </p>
      ) : (
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
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {item.productName}
                    </p>
                    <p className="text-sm font-semibold text-pink">
                      N{formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    {item.color && (
                      <p className="text-sm text-gray-500">
                        Color: {item.color}
                      </p>
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
                  navigate("/select-address", {
                    state: { from: location.pathname },
                  })
                }
                className="text-pink text-sm hover:underline"
              >
                + Add/Change address
              </button>
            </div>
          </div>

          {/* Pickup Option */}
          <div>
            <h3 className="font-semibold text-md text-gray-800 mb-3">Pickup</h3>
            <div className="p-3 rounded-lg text-sm space-y-2">
              <p className="font-medium">{pickupAddressDisplay}</p>
              <button
                onClick={() =>
                  navigate("/select-pickup", {
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
            {/* --- UI AND LOGIC IMPLEMENTED As Per Figma Design --- */}
            <div className="space-y-3">
              {/* Card Option */}
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
                    {/* Placeholder text based on the design. Replace with dynamic data. */}
                    <p className="text-xs text-gray-500">
                      S**** **********45 (Default)
                    </p>
                    <p className="text-xs text-gray-500">Exp: 09/28</p>
                  </div>
                </label>
                <button
                  onClick={() =>
                    navigate("/select-payment", {
                      state: { from: location.pathname },
                    })
                  }
                  className="text-pink text-sm hover:underline"
                >
                  Add new card
                </button>
              </div>

              {/* Bank Transfer Option */}
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

              {/* Lily Wallet Option */}
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
                disabled={!voucherCode} // Disable if no code entered
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
              <img src="/icons/shield-tick.svg" alt="" className="size-5" />
              <p className="text-sm">
                Your payment is held in escrow till order has been confirmed as
                delivered
              </p>
            </div>
            <div className="flex space-x-2 items-center text-gray-500">
              <img src="/icons/undo.svg" alt="" className="size-5" />
              <p className="text-sm break-words">
                Orders may be returned within 7 days of purchase. Learn more
                about our {"  "}
                <a href="#" className="text-pink">
                  return policy
                </a>
              </p>
            </div>
            <div className="text-sm text-gray-500">
              By clicking &ldquo;proceed&ldquo;, you confirm you have read and
              agree to our{" "}
              <a href="#" className="text-pink">
                terms of services
              </a>
              .
            </div>
          </div>
        </div>
      )}
      {itemsToCheckout.length > 0 && (
        <div className="flex w-full justify-between p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex flex-col w-[40%] justify-between font-bold text-md pt-2 mt-2">
            <span>Total Payment</span>
            <span className="text-xl">N{formatPrice(estimatedTotal)}</span>
          </div>

          <button
            onClick={handleProceedToPayment}
            className="w-[60%] bg-lily text-white py-3 rounded-full text-lg font-semibold hover:bg-darklily transition-colors"
          >
            Proceed
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;