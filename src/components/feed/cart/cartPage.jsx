import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Circle,
  ChevronRight,
  Ticket,
  ShieldCheck,
  Undo2,
  Plus,
} from "lucide-react";
import {
  selectCartItems,
  fetchCart,
  selectCartIsLoading,
} from "../../../redux/cartSlice";
import { createOrder } from "../../../redux/orderSlice";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../../../services/api";
import { usePayment } from "../../../context/paymentContext";
import { formatPrice, formatDate } from "../../../utils/formatters";

const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { paymentData, setPaymentData } = usePayment();

  const allCartItems = useSelector(selectCartItems);
  const isLoadingCart = useSelector(selectCartIsLoading);

  const isDirectBuy = location.state?.directBuy;
  const directProduct = location.state?.product;
  const directQuantity = location.state?.quantity || 1;

  const [selectedItemIds, setSelectedItemIds] = useState(() => {
    const locStateIds = location.state?.selectedItemIds;
    if (locStateIds) {
      sessionStorage.setItem("checkout_ids", JSON.stringify(locStateIds));
      return locStateIds;
    }
    try {
      return JSON.parse(sessionStorage.getItem("checkout_ids")) || [];
    } catch {
      return [];
    }
  });

  const { creating: isCreatingOrder, createError } = useSelector(
    (state) => state.orders,
  );

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  useEffect(() => {
    if (!isDirectBuy) {
      dispatch(fetchCart());
    }
  }, [dispatch, isDirectBuy]);

  const itemsToCheckout = useMemo(() => {
    if (isDirectBuy && directProduct) {
      return [
        {
          id: directProduct.id,
          product_id: directProduct.id,
          product: directProduct,
          productName: directProduct.name,
          quantity: directQuantity,
          current_price_kobo:
            directProduct.price_in_kobo ||
            (directProduct.price_in_naira
              ? directProduct.price_in_naira * 100
              : 0),
          subtotal_naira:
            (directProduct.price_in_naira ||
              (directProduct.price_in_kobo
                ? directProduct.price_in_kobo / 100
                : 0)) * directQuantity,
          mediaSrc: directProduct.image_url || directProduct.media_url,
          username:
            directProduct.shop?.name ||
            directProduct.user?.username ||
            "Vendor",
          deliveryCharge: directProduct.deliveryCharge || 0,
        },
      ];
    }

    if (selectedItemIds && Array.isArray(selectedItemIds)) {
      if (!allCartItems) return [];
      return allCartItems.filter((item) => selectedItemIds.includes(item.id));
    }
    return [];
  }, [
    allCartItems,
    selectedItemIds,
    isDirectBuy,
    directProduct,
    directQuantity,
  ]);

  // Frontend Calculations
  const totalDeliveryCharge = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce(
      (sum, item) => sum + (item.deliveryCharge || 0),
      0,
    );
  }, [itemsToCheckout]);

  const itemCount = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce((count, item) => count + item.quantity, 0);
  }, [itemsToCheckout]);

  const subtotal = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce((total, item) => {
      const itemSubtotal =
        Number(item.subtotal_naira) ||
        ((Number(item.current_price_kobo) || 0) / 100) * item.quantity ||
        (Number(item.product?.price_in_naira) || 0) * item.quantity ||
        0;
      return total + itemSubtotal;
    }, 0);
  }, [itemsToCheckout]);

  const estimatedDeliveryTime = useMemo(() => {
    if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
      return "Calculating...";
    }
    try {
      const allMinTimestamps = itemsToCheckout.map((item) =>
        new Date(item.estimatedDeliveryMinDate || Date.now()).getTime(),
      );
      const allMaxTimestamps = itemsToCheckout.map((item) =>
        new Date(item.estimatedDeliveryMaxDate || Date.now()).getTime(),
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
      return "N/A";
    }
  }, [itemsToCheckout]);

  const [deliveryAddress, setDeliveryAddress] = useState("Loading address...");
  const [pickupAddressDisplay, setPickupAddressDisplay] =
    useState("Loading pickup...");
  const [deliveryType, setDeliveryType] = useState(
    paymentData?.deliveryType || "delivery",
  );
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const selectedDelivery = paymentData?.selectedAddress;
  const selectedPickup = paymentData?.selectedPickup;

  useEffect(() => {
    if (selectedDelivery) {
      setDeliveryAddress(
        `${selectedDelivery.street_address}, ${selectedDelivery.city}, ${selectedDelivery.state}`,
      );
    } else if (userProfile) {
      setDeliveryAddress(
        userProfile.deliveryAddress || "No delivery address set",
      );
    } else if (profileError) {
      setDeliveryAddress("Error loading address");
    }
  }, [userProfile, profileError, selectedDelivery]);

  useEffect(() => {
    if (selectedPickup) {
      setPickupAddressDisplay(
        `${selectedPickup.name} - ${selectedPickup.address}, ${selectedPickup.city}`,
      );
    } else if (userProfile) {
      setPickupAddressDisplay(
        userProfile.pickupAddress || "No preferred pickup set",
      );
    } else if (profileError) {
      setPickupAddressDisplay("Error loading pickup");
    }
  }, [userProfile, profileError, selectedPickup]);

  useEffect(() => {
    if (isDirectBuy && directProduct) return;

    if (
      !isLoadingProfile &&
      !isLoadingCart &&
      (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0)
    ) {
      const timer = setTimeout(() => {
        if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
          navigate("/");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    itemsToCheckout,
    isLoadingProfile,
    isLoadingCart,
    navigate,
    isDirectBuy,
    directProduct,
  ]);

  const handleDeliveryTypeSelect = (type) => {
    setDeliveryType(type);
    setPaymentData((prev) => ({ ...prev, deliveryType: type }));
  };

  const handleApplyVoucher = () => {
    if (voucherCode === "SAVE10") {
      setAppliedDiscount(subtotal * 0.1);
      alert("Voucher Applied!");
    } else {
      setAppliedDiscount(0);
      alert("Invalid voucher code");
    }
  };

  const estimatedTotal = subtotal + totalDeliveryCharge - appliedDiscount;
  const backendTotalKobo = Math.round(estimatedTotal * 100);

  const handleProceedToPayment = async () => {
    if (deliveryType === "delivery") {
      if (!selectedDelivery?.id && !userProfile?.deliveryAddress) {
        alert(
          "Please add or select a valid delivery address before proceeding.",
        );
        return;
      }
    } else {
      if (!selectedPickup?.id && !userProfile?.pickupAddress) {
        alert("Please select a valid pickup location before proceeding.");
        return;
      }
    }

    if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
      console.error("Cannot proceed, no items to checkout.");
      return;
    }

    const orderItems = itemsToCheckout.map((item) => ({
      product_id: item.product?.id || item.product_id || item.id,
      quantity: parseInt(item.quantity, 10),
    }));

    let apiPaymentMethod = "paystack";
    if (paymentMethod === "wallet") {
      apiPaymentMethod = "wallet";
    }

    // STRICT API COMPLIANCE: Sending only items, total_amount_kobo, and payment_method.
    // Removing delivery_address_id and fees to bypass the 500 Integrity Error.
    const orderData = {
      items: orderItems,
      total_amount_kobo: backendTotalKobo,
      payment_method: apiPaymentMethod,
    };

    try {
      const actionResult = await dispatch(createOrder(orderData)).unwrap();
      const newOrder = actionResult;

      setPaymentData((prev) => ({
        ...prev,
        amount: estimatedTotal,
        vendorName: itemsToCheckout[0]?.username || "Lily Vendor",
        orderId: newOrder.id,
        amountPaid: 0,
      }));

      if (apiPaymentMethod === "wallet") {
        navigate("/password");
      } else {
        if (newOrder.authorization_url) {
          window.location.href = newOrder.authorization_url;
        } else {
          console.warn("No authorization URL returned for Paystack payment");
          navigate("/payment-loading");
        }
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      if (err.response?.status === 500) {
        alert(
          "The server encountered an error (500). Please notify the backend developer to check the error logs for POST /orders/create/",
        );
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

  if (
    !isLoadingProfile &&
    !isLoadingCart &&
    (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) &&
    !isDirectBuy
  ) {
    return (
      <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
        <div className="relative p-4 border-b border-gray-100 flex items-center justify-center shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-semibold text-lg text-gray-900">Confirm Order</h2>
        </div>
        <p className="text-center text-gray-500 mt-8 flex-1 p-4">
          No items selected for checkout, or cart is empty.
        </p>
      </div>
    );
  }

  const userFullName =
    [userProfile?.first_name, userProfile?.last_name]
      .filter(Boolean)
      .join(" ") ||
    userProfile?.fullName ||
    userProfile?.name ||
    userProfile?.username ||
    (userProfile?.email && userProfile.email.split("@")[0]) ||
    "Recipient";

  const userPhone =
    userProfile?.phone_number || userProfile?.phone || "No phone provided";

  const savedCard = userProfile?.cards?.[0] || userProfile?.card;
  const walletBalance = userProfile?.wallet_balance || 0;

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-gray-50 border-x border-gray-100">
      <div className="relative p-4 border-b border-gray-100 bg-white flex items-center justify-center shrink-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 focus:outline-none"
        >
          <ChevronLeft size={28} />
        </button>
        <h2 className="font-semibold text-lg text-gray-900">Confirm Order</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="bg-white p-4 mb-2 border-b border-gray-100">
          <div className="space-y-6">
            {itemsToCheckout.map((item) => (
              <div key={item.id} className="flex flex-col">
                <p className="text-sm font-medium text-gray-600 mb-3">
                  {item.username || item.product?.shop?.name || "Vendor"}
                </p>
                <div className="flex space-x-4">
                  <img
                    src={
                      item.mediaSrc ||
                      item.product?.image_url ||
                      item.product?.media_url ||
                      "/placeholder-image.png"
                    }
                    alt={item.productName || item.product?.name || "Product"}
                    className="w-24 h-24 object-cover rounded-xl bg-gray-100 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-gray-900">
                      {item.productName || item.product?.name || "Product"}
                    </p>
                    <p className="text-sm font-semibold text-pink">
                      ₦
                      {formatPrice(
                        (Number(item.current_price_kobo)
                          ? Number(item.current_price_kobo) / 100
                          : 0) ||
                          Number(item.product?.price_in_naira) ||
                          (Number(item.subtotal_naira)
                            ? Number(item.subtotal_naira) / (item.quantity || 1)
                            : 0) ||
                          0,
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    {item.color && (
                      <p className="text-sm text-gray-600">
                        Color: {item.color}
                      </p>
                    )}
                    {item.size && (
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Delivery fee: ₦{formatPrice(item.deliveryCharge || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 mb-2 border-y border-gray-100">
          <h3 className="font-semibold text-md text-gray-900 mb-4">
            Delivery details
          </h3>

          <div className="space-y-5">
            <div className="flex items-start">
              <button
                onClick={() => handleDeliveryTypeSelect("delivery")}
                className="mt-1 shrink-0 focus:outline-none"
              >
                {deliveryType === "delivery" ? (
                  <CheckCircle2 className="text-white fill-lily w-6 h-6" />
                ) : (
                  <Circle className="text-gray-400 w-6 h-6" />
                )}
              </button>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {selectedDelivery
                    ? selectedDelivery.label || "Delivery Address"
                    : "Default Address"}
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {userFullName}{" "}
                  <span className="font-normal text-gray-600">
                    {selectedDelivery?.phone_number || userPhone}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-0.5 pr-6 leading-relaxed">
                  {deliveryAddress}
                </p>
                <button
                  onClick={() =>
                    navigate("/add-address", {
                      state: { from: location.pathname },
                    })
                  }
                  className="flex items-center text-pink font-medium text-sm mt-2 hover:opacity-80 transition-opacity focus:outline-none"
                >
                  <Plus size={16} className="mr-1" strokeWidth={3} /> Add new
                  address
                </button>
              </div>
              <button
                onClick={() =>
                  navigate("/choose-address", {
                    state: { from: location.pathname },
                  })
                }
                className="text-gray-400 mt-2 hover:text-gray-700"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="flex items-start">
              <button
                onClick={() => handleDeliveryTypeSelect("pickup")}
                className="mt-1 shrink-0 focus:outline-none"
              >
                {deliveryType === "pickup" ? (
                  <CheckCircle2 className="text-white fill-lily w-6 h-6" />
                ) : (
                  <Circle className="text-gray-400 w-6 h-6" />
                )}
              </button>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Pickup Station
                </p>
                <p className="text-sm text-gray-600 mt-1 pr-6 leading-relaxed">
                  {pickupAddressDisplay}
                </p>
              </div>
              <button
                onClick={() =>
                  navigate("/choose-pickup", {
                    state: { from: location.pathname },
                  })
                }
                className="text-gray-400 mt-2 hover:text-gray-700"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 mb-2 border-y border-gray-100">
          <h3 className="font-semibold text-md text-gray-900 mb-4">
            Payment method
          </h3>
          <div className="space-y-5">
            <div className="flex items-start">
              <button
                onClick={() => setPaymentMethod("card")}
                className="mt-1 shrink-0 focus:outline-none"
              >
                {paymentMethod === "card" ? (
                  <CheckCircle2 className="text-white fill-lily w-6 h-6" />
                ) : (
                  <Circle className="text-gray-400 w-6 h-6" />
                )}
              </button>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Card</p>
                {savedCard ? (
                  <>
                    <p className="text-sm text-gray-900 mt-1">
                      **** **** **** {savedCard.last4}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Exp: {savedCard.exp_month}/{savedCard.exp_year}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">No card added</p>
                )}
                <button
                  onClick={() =>
                    navigate("/add-card", {
                      state: { from: location.pathname },
                    })
                  }
                  className="flex items-center text-pink font-medium text-sm mt-2 hover:opacity-80 transition-opacity focus:outline-none"
                >
                  <Plus size={16} className="mr-1" strokeWidth={3} /> Add new
                  card
                </button>
              </div>
              <button
                onClick={() =>
                  navigate("/choose-card", {
                    state: { from: location.pathname },
                  })
                }
                className="text-gray-400 mt-2 hover:text-gray-700"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div
              className="flex items-center cursor-pointer"
              onClick={() => setPaymentMethod("bank")}
            >
              <button className="shrink-0 focus:outline-none">
                {paymentMethod === "bank" ? (
                  <CheckCircle2 className="text-white fill-lily w-6 h-6" />
                ) : (
                  <Circle className="text-gray-400 w-6 h-6" />
                )}
              </button>
              <span className="ml-3 text-sm font-medium text-gray-900">
                Bank Transfer
              </span>
            </div>

            <div
              className="flex items-start cursor-pointer"
              onClick={() => setPaymentMethod("wallet")}
            >
              <button className="mt-0.5 shrink-0 focus:outline-none">
                {paymentMethod === "wallet" ? (
                  <CheckCircle2 className="text-white fill-lily w-6 h-6" />
                ) : (
                  <Circle className="text-gray-400 w-6 h-6" />
                )}
              </button>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Lily wallet</p>
                <p className="text-xs font-semibold text-pink mt-1">
                  ₦{formatPrice(walletBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border-y border-gray-100">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Voucher code
            </h3>
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Ticket className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="XXXXXX"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-lily focus:bg-white text-sm transition-colors"
                />
              </div>
              <button
                onClick={handleApplyVoucher}
                className="bg-lily text-white px-8 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={!voucherCode}
              >
                Apply
              </button>
            </div>
          </div>

          <h3 className="font-semibold text-md text-gray-900 mb-4">
            Order summary
          </h3>

          <div className="space-y-3 text-sm mb-8">
            <div className="flex justify-between text-gray-800">
              <span>Item's total ({itemCount})</span>
              <span>₦{formatPrice(subtotal)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- ₦{formatPrice(appliedDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-800">
              <span>Delivery fee</span>
              <span>₦{formatPrice(totalDeliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-gray-900 font-bold border-t border-gray-100 pt-3 mt-1">
              <span>Total</span>
              <span>₦{formatPrice(estimatedTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500 pt-2">
              <span>Estimated Delivery Time</span>
              <span>{estimatedDeliveryTime}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-2 text-gray-900">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-gray-500" />
              <p className="text-xs leading-relaxed text-gray-600">
                Your payment is held in escrow till order has been confirmed as
                delivered
              </p>
            </div>
            <div className="flex items-start space-x-2 text-gray-900">
              <Undo2 className="w-5 h-5 shrink-0 mt-0.5 text-gray-500" />
              <p className="text-xs leading-relaxed text-gray-600">
                Orders may be returned within <strong>48 hrs</strong> of
                purchase. Learn more about our{" "}
                <a
                  href="/about"
                  className="text-pink font-medium hover:underline"
                >
                  return policy
                </a>
              </p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mt-4 border-t border-gray-100 pt-4">
              By clicking "proceed", you confirm you have read and agree to our{" "}
              <a
                href="/about"
                className="text-pink font-medium hover:underline"
              >
                terms of services
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-20 md:left-64 max-w-xl mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <div className="flex flex-col min-w-32">
            <span className="font-medium text-sm text-gray-500">
              Total Payment
            </span>
            <span className="font-bold text-xl text-gray-900">
              ₦{formatPrice(estimatedTotal)}
            </span>
          </div>
          <button
            onClick={handleProceedToPayment}
            className="flex-1 bg-lily text-white py-3.5 rounded-full text-md font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !itemsToCheckout ||
              itemsToCheckout.length === 0 ||
              isCreatingOrder
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
    </div>
  );
};

export default CartPage;
