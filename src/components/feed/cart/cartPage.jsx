import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  AlertCircle,
  X,
  MapPin,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  selectCartItems,
  fetchCart,
  clearCart,
  selectCartIsLoading,
  selectCartId,
} from "../../../redux/cartSlice";
import { fetchWallet } from "../../../redux/walletSlice";
import { createOrder } from "../../../redux/orderSlice";
import { useQuery } from "@tanstack/react-query";
import {
  fetchUserProfile,
  calculateCheckout,
  fetchDeliveryAddresses,
} from "../../../services/api";
import { usePayment } from "../../../hooks/usePayment";
import { formatPrice, formatDate } from "../../../utils/formatters";
import { toast } from "react-hot-toast";
import { getDeliveryQuote } from "../../../services/shopApi";

const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { paymentData, setPaymentData } = usePayment();
  const deliverySectionRef = useRef(null);
  const [showAddressError, setShowAddressError] = useState(false);

  const allCartItems = useSelector(selectCartItems);
  const isLoadingCart = useSelector(selectCartIsLoading);
  const { balance_naira: walletBalance } = useSelector(
    (state) => state.wallet || {},
  );

  const { user_data } = useSelector((state) => state.auth || {});

  const cartId = useSelector(selectCartId);

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  const isDirectBuy = location.state?.directBuy;
  const directProduct = location.state?.product;
  const directQuantity = location.state?.quantity || 1;

  const [selectedItemIds] = useState(() => {
    const locStateIds = location.state?.selectedItemIds;
    if (locStateIds) {
      localStorage.setItem("checkout_ids", JSON.stringify(locStateIds));
      return locStateIds;
    }
    try {
      return JSON.parse(localStorage.getItem("checkout_ids")) || [];
    } catch {
      return [];
    }
  });

  const { createOrderLoading: isCreatingOrder, createOrderError } = useSelector(
    (state) => state.orders || state.order || {},
  );

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: addresses } = useQuery({
    queryKey: ["deliveryAddresses"],
    queryFn: fetchDeliveryAddresses,
  });

  // Auto-select default address if none is selected in paymentData
  // Also validate that the selected address still exists
  useEffect(() => {
    const addressList = addresses?.results || addresses;
    if (!addressList || !Array.isArray(addressList)) return;

    const selectedId = paymentData?.selectedAddress?.id;
    const stillExists = selectedId
      ? addressList.some((addr) => addr.id === selectedId)
      : false;

    if (!paymentData?.selectedAddress || !stillExists) {
      const defaultAddr = addressList.find((addr) => addr.is_default);
      if (defaultAddr) {
        setPaymentData((prev) => ({
          ...prev,
          selectedAddress: defaultAddr,
        }));
      } else if (addressList.length > 0) {
        // Fallback to first address if no default is explicitly marked
        setPaymentData((prev) => ({
          ...prev,
          selectedAddress: addressList[0],
        }));
      } else if (selectedId && !stillExists) {
        // If it was selected but now it's gone and no replacements found
        setPaymentData((prev) => ({
          ...prev,
          selectedAddress: null,
        }));
      }
    }
  }, [addresses, paymentData?.selectedAddress, setPaymentData]);

  useEffect(() => {
    if (!isDirectBuy) {
      dispatch(fetchCart());
    }
  }, [dispatch, isDirectBuy]);

  // Helper to reliably get the exact unit price without random multiplication
  const getUnitPrice = (item) => {
    return (
      Number(item.price_naira) ||
      Number(item.product?.price_in_naira) ||
      Number(item.product?.price) ||
      (Number(item.total_price_naira)
        ? Number(item.total_price_naira) / (item.quantity || 1)
        : 0) ||
      (Number(item.subtotal_naira)
        ? Number(item.subtotal_naira) / (item.quantity || 1)
        : 0) ||
      Number(item.current_price_kobo) ||
      0
    );
  };

  const itemsToCheckout = useMemo(() => {
    if (isDirectBuy && directProduct) {
      const unitPrice =
        Number(directProduct.price_in_naira) ||
        Number(directProduct.price) ||
        0;
      return [
        {
          id: directProduct.id,
          product_id: directProduct.id,
          product: directProduct,
          productName: directProduct.name,
          quantity: directQuantity,
          // No more * 100 multiplication!
          current_price_kobo: unitPrice,
          subtotal_naira: unitPrice * directQuantity,
          mediaSrc: directProduct.image_url || directProduct.media_url,
          username:
            directProduct.shop_name ||
            directProduct.shop?.name ||
            directProduct.username ||
            directProduct.user?.username ||
            "Vendor",
          deliveryCharge:
            directProduct.delivery_fee_naira !== undefined
              ? Number(directProduct.delivery_fee_naira)
              : (directProduct.deliveryCharge || 0),
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

  // Fallback Local Calculations
  const localDeliveryCharge = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce((sum, item) => {
      const fee =
        item.product?.delivery_fee_naira !== undefined
          ? Number(item.product.delivery_fee_naira)
          : item.delivery_fee_naira !== undefined
          ? Number(item.delivery_fee_naira)
          : item.product?.deliveryCharge !== undefined
          ? Number(item.product.deliveryCharge)
          : item.deliveryCharge !== undefined
          ? Number(item.deliveryCharge)
          : 0;
      return sum + fee;
    }, 0);
  }, [itemsToCheckout]);

  const itemCount = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce((count, item) => count + item.quantity, 0);
  }, [itemsToCheckout]);

  const localSubtotal = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce((total, item) => {
      const unitPrice = getUnitPrice(item);
      return total + unitPrice * item.quantity;
    }, 0);
  }, [itemsToCheckout]);

  const localEstimatedDeliveryTime = useMemo(() => {
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
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceModalMessage, setBalanceModalMessage] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Authoritative backend calculation states
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const selectedDelivery = paymentData?.selectedAddress;
  const selectedPickup = paymentData?.selectedPickup;

  // Shipping profiles delivery quote state
  const [deliveryQuotes, setDeliveryQuotes] = useState({});

  useEffect(() => {
    const fetchQuotes = async () => {
      if (
        deliveryType !== "delivery" ||
        !selectedDelivery ||
        !itemsToCheckout ||
        itemsToCheckout.length === 0
      ) {
        setDeliveryQuotes({});
        return;
      }

      const quotes = {};
      try {
        await Promise.all(
          itemsToCheckout.map(async (item) => {
            const productId = item.product?.id || item.product_id;
            if (!productId) return;

            try {
               const quote = await getDeliveryQuote({
                product_id: productId,
                buyer_country: selectedDelivery.country || "Nigeria",
                buyer_state: selectedDelivery.state,
              });
              quotes[item.id] = quote;
            } catch (err) {
              console.error(`Failed to get delivery quote for product ${productId}:`, err);
            }
          })
        );
        setDeliveryQuotes(quotes);
      } catch (err) {
        console.error("Error fetching delivery quotes:", err);
      }
    };

    fetchQuotes();
  }, [selectedDelivery, itemsToCheckout, deliveryType]);

  const quoteDeliveryCharge = useMemo(() => {
    let total = 0;
    let hasQuotes = false;
    Object.keys(deliveryQuotes).forEach((itemId) => {
      const q = deliveryQuotes[itemId];
      if (q) {
        const fee = q.fee_naira ?? q.fee ?? 0;
        total += fee;
        hasQuotes = true;
      }
    });
    return { total, hasQuotes };
  }, [deliveryQuotes]);

  const quoteEstimatedTime = useMemo(() => {
    const validMins = [];
    const validMaxs = [];
    Object.keys(deliveryQuotes).forEach((itemId) => {
      const q = deliveryQuotes[itemId];
      if (q) {
        const minDays = q.est_days_min ?? q.est_days;
        const maxDays = q.est_days_max ?? q.est_days;
        if (minDays !== undefined && minDays !== null) validMins.push(Number(minDays));
        if (maxDays !== undefined && maxDays !== null) validMaxs.push(Number(maxDays));
      }
    });

    if (validMins.length === 0 || validMaxs.length === 0) return null;
    const minVal = Math.min(...validMins);
    const maxVal = Math.max(...validMaxs);
    if (minVal === maxVal) {
      return `Arrives in ${minVal} day${minVal !== 1 ? "s" : ""}`;
    }
    return `Arrives in ${minVal}-${maxVal} days`;
  }, [deliveryQuotes]);

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

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait a bit longer to ensure all initial loads are finished
    if (!isLoadingProfile && !isLoadingCart) {
      const timer = setTimeout(() => setIsInitialized(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProfile, isLoadingCart]);

  useEffect(() => {
    if (isDirectBuy && directProduct) return;

    if (
      isInitialized &&
      (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0)
    ) {
      const timer = setTimeout(() => {
        if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
          navigate("/");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [itemsToCheckout, isInitialized, navigate, isDirectBuy, directProduct]);

  // Fetch authoritative checkout details from the backend
  useEffect(() => {
    const fetchCheckoutDetails = async () => {
      // Don't fetch if items are not ready
      if (!itemsToCheckout || itemsToCheckout.length === 0) return;

      // Ensure we have a valid identifier for each item
      const hasValidItems = itemsToCheckout.every(
        (item) => item.product_id || item.product?.id || item.id,
      );
      if (!hasValidItems) return;

      // We no longer block on address/pickup IDs to allow subtotal/platform fee calculation for new users
      setIsCalculating(true);
      try {
        const payload = {
          delivery_type: deliveryType,
        };

        // For direct buy, we send order_items. For cart buy, we send cart_id.
        if (isDirectBuy) {
          payload.order_items = itemsToCheckout.map((item) => ({
            product_id: item.product_id || item.product?.id || item.id,
            quantity: parseInt(item.quantity, 10) || 1,
          }));
        } else {
          // If we don't have cartId yet for a cart buy, we can't calculate via backend
          if (!cartId) {
            setIsCalculating(false);
            return;
          }
          payload.cart_id = cartId;
        }

        // Only add location IDs if they exist
        if (deliveryType === "delivery" && selectedDelivery?.id) {
          payload.delivery_address_id = selectedDelivery.id;
        } else if (deliveryType === "pickup" && selectedPickup?.id) {
          payload.pickup_location_id = selectedPickup.id;
        }

        const data = await calculateCheckout(payload);
        setCheckoutDetails(data);
      } catch (error) {
        console.error("Failed to calculate checkout details:", error);
      } finally {
        setIsCalculating(false);
      }
    };

    fetchCheckoutDetails();
  }, [
    cartId,
    deliveryType,
    selectedDelivery?.id,
    selectedPickup?.id,
    isDirectBuy,
    itemsToCheckout,
  ]);

  const handleDeliveryTypeSelect = (type) => {
    setDeliveryType(type);
    setPaymentData((prev) => ({ ...prev, deliveryType: type }));
  };

  const handleApplyVoucher = () => {
    const targetSubtotal = checkoutDetails?.subtotal_naira || localSubtotal;
    if (voucherCode === "SAVE10") {
      setAppliedDiscount(targetSubtotal * 0.1);
      toast.success("Voucher Applied!");
    } else {
      setAppliedDiscount(0);
      toast.error("Invalid voucher code");
    }
  };

  // Resolve final values (Prefer Backend -> Fallback to Local)
  const finalSubtotal = checkoutDetails?.subtotal_naira || localSubtotal;
  const finalDeliveryFee =
    deliveryType === "delivery" && quoteDeliveryCharge.hasQuotes
      ? quoteDeliveryCharge.total
      : checkoutDetails?.delivery_fee_naira !== undefined
      ? checkoutDetails.delivery_fee_naira
      : localDeliveryCharge;
  const finalPlatformFee = checkoutDetails?.platform_fee_naira || 0;
  const finalEstimatedTime =
    deliveryType === "delivery" && quoteEstimatedTime
      ? quoteEstimatedTime
      : checkoutDetails?.estimated_delivery_time || localEstimatedDeliveryTime;

  // Calculate Grand Total
  const estimatedTotal =
    finalSubtotal + finalDeliveryFee + finalPlatformFee - appliedDiscount;

  // EXACT value passed directly
  const backendTotal = estimatedTotal;

  const handleProceedToPayment = async () => {
    if (deliveryType === "delivery") {
      if (!selectedDelivery?.id && !userProfile?.deliveryAddress) {
        setShowAddressError(true);
        deliverySectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        toast.error("Please add a delivery address to proceed", {
          icon: "📍",
          duration: 4000,
        });
        return;
      }
    } else {
      if (!selectedPickup?.id && !userProfile?.pickupAddress) {
        setShowAddressError(true);
        deliverySectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        toast.error("Please select a pickup location to proceed", {
          icon: "🏪",
          duration: 4000,
        });
        return;
      }
    }

    if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
      console.error("Cannot proceed, no items to checkout.");
      return;
    }

    const orderItems = itemsToCheckout
      .map((item) => {
        // For direct buy: product_id is explicitly set on the item object in itemsToCheckout.
        // For cart items: item.product.id is the actual Product UUID.
        // NEVER fall back to item.id — that is the CartItem or post/content UUID, not the Product UUID.
        const productId =
          item.product?.id || // cart items: nested product object has the real UUID
          item.product_id || // direct buy: explicitly set when building itemsToCheckout
          null; // no item.id fallback — it resolves to the wrong ID

        if (!productId) {
          console.warn("Missing product ID for item:", item);
        }

        return {
          product_id: productId,
          quantity: parseInt(item.quantity, 10) || 1,
        };
      })
      .filter((item) => item.product_id); // Filter out any items that failed to resolve a product ID

    if (orderItems.length === 0) {
      toast.error("No valid items found for checkout. Please try again.");
      return;
    }

    let apiPaymentMethod = "paystack";
    if (paymentMethod === "wallet") {
      apiPaymentMethod = "wallet";
      if (walletBalance < backendTotal) {
        setBalanceModalMessage(
          `Insufficient wallet balance. You need NGN ${formatPrice(backendTotal)} but you have NGN ${formatPrice(walletBalance)}. Please top up your wallet to proceed.`,
        );
        setIsBalanceModalOpen(true);
        return;
      }
    }

    // Surgical payload construction
    const orderData = {
      order_items: orderItems,
      total_amount_kobo: Math.round(backendTotal * 100),
      payment_method: apiPaymentMethod,
      delivery_type: deliveryType,
      delivery_fee_naira: Number(finalDeliveryFee) || 0,
      platform_fee_naira: Number(finalPlatformFee) || 0,
    };

    // ONLY send the relevant ID to prevent backend confusion/500s.
    // Guard: only set if the ID is actually resolved — never send undefined to the backend.
    if (deliveryType === "delivery") {
      if (!selectedDelivery?.id) {
        setShowAddressError(true);
        deliverySectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        toast.error(
          "Please select a valid delivery address before proceeding.",
          {
            icon: "📍",
            duration: 4000,
          },
        );
        return;
      }
      orderData.delivery_address_id = selectedDelivery.id;
    } else if (deliveryType === "pickup") {
      if (!selectedPickup?.id) {
        setShowAddressError(true);
        deliverySectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        toast.error(
          "Please select a valid pickup location before proceeding.",
          {
            icon: "🏪",
            duration: 4000,
          },
        );
        return;
      }
      orderData.pickup_location_id = selectedPickup.id;
    }

    if (cartId) {
      orderData.cart_id = cartId;
    }

    try {
      const actionResult = await dispatch(createOrder(orderData)).unwrap();
      const newOrder = actionResult;
      const authorizationUrl =
        newOrder.authorization_url ||
        newOrder.payment_result?.authorization_url;

      setPaymentData((prev) => ({
        ...prev,
        amount: estimatedTotal,
        vendorName: itemsToCheckout[0]?.username || "Lily Vendor",
        orderId: newOrder.id,
        amountPaid: 0,
      }));

      if (apiPaymentMethod === "wallet") {
        if (!isDirectBuy) {
          await dispatch(clearCart());
        }
        localStorage.removeItem("checkout_ids");
        localStorage.removeItem("lily_pending_order");
        navigate("/order-success", {
          state: {
            order: newOrder,
            paymentMethod: "wallet",
          },
        });
      } else {
        if (authorizationUrl) {
          localStorage.setItem("lily_pending_order", JSON.stringify(newOrder));
          window.location.href = authorizationUrl;
        } else {
          console.warn("No authorization URL returned for Paystack payment");
          toast.error("Payment initialization failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      const errorMessage =
        err.message ||
        err.detail ||
        createOrderError?.detail ||
        "Failed to initiate payment. Please try again.";

      if (errorMessage.toLowerCase().includes("insufficient")) {
        setBalanceModalMessage(errorMessage);
        setIsBalanceModalOpen(true);
      } else if (err.response?.status === 500) {
        toast.error(
          "The server encountered an error (500). The backend rejected the payload. Please ensure you have selected a valid address.",
        );
      } else {
        toast.error(errorMessage);
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
    user_data?.username ||
    (user_data?.email && user_data.email.split("@")[0]) ||
    "Recipient";

  const userPhone =
    userProfile?.phone_number || userProfile?.phone || "No phone provided";

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
            {itemsToCheckout.map((item) => {
              const unitPrice = getUnitPrice(item);
              const vendorName =
                item.username ||
                item.product?.shop_name ||
                item.product?.shop?.name ||
                item.product?.username ||
                item.product?.user?.username ||
                "Vendor";
              return (
                <div key={item.id} className="flex flex-col">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    {vendorName}
                  </p>
                  <div className="flex space-x-4">
                    <img
                      src={
                        item.mediaSrc ||
                        item.product?.image_url ||
                        item.product?.media_url ||
                        "/feed-image.png"
                      }
                      alt={item.productName || item.product?.name || "Product"}
                      className="w-24 h-24 object-cover rounded-xl bg-gray-100 shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/feed-image.png";
                      }}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-gray-900">
                        {item.productName || item.product?.name || "Product"}
                      </p>
                      <p className="text-sm font-semibold text-pink">
                        NGN {formatPrice(unitPrice)}
                      </p>
                      <p className="text-sm text-black">
                        Qty: {item.quantity}
                      </p>
                      {item.color && (
                        <p className="text-sm text-gray-600">
                          Color: {item.color}
                        </p>
                      )}
                      {item.size && (
                        <p className="text-sm text-gray-600">
                          Size: {item.size}
                        </p>
                      )}

                      {deliveryQuotes[item.id] ? (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-sm text-black">
                            Delivery Price: NGN {formatPrice(deliveryQuotes[item.id].fee_naira ?? deliveryQuotes[item.id].fee ?? 0)}
                          </p>
                          {(deliveryQuotes[item.id].est_days_min !== null || deliveryQuotes[item.id].est_days_max !== null) && (
                            <p className="text-sm text-black">
                              Arrives in: {deliveryQuotes[item.id].est_days_min}-{deliveryQuotes[item.id].est_days_max} days
                            </p>
                          )}
                        </div>
                      ) : item.product?.delivery_info ? (
                        <div className="mt-1">
                          <p className="text-sm text-black">
                            Delivery Info: {item.product.delivery_info}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          ref={deliverySectionRef}
          className={`bg-white p-4 mb-2 border-y transition-all duration-300 ${
            showAddressError
              ? "border-red-200 bg-red-50/30 ring-1 ring-red-100 shadow-sm shadow-red-50"
              : "border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-md text-gray-900">
              Delivery details
            </h3>
            {showAddressError && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider animate-pulse bg-red-100 px-2 py-0.5 rounded-full">
                Selection Required
              </span>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex items-start">
              <button
                onClick={() => {
                  handleDeliveryTypeSelect("delivery");
                  setShowAddressError(false);
                }}
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
                onClick={() => {
                  handleDeliveryTypeSelect("pickup");
                  setShowAddressError(false);
                }}
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
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Lily wallet
                    </p>
                    <Link
                      to="/wallet"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-semibold text-pink mt-1 hover:underline"
                    >
                      NGN {formatPrice(walletBalance)}
                    </Link>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/wallet");
                    }}
                    className="flex items-center text-pink font-medium text-sm hover:opacity-80 transition-opacity focus:outline-none"
                  >
                    <Plus size={14} className="mr-0.5" strokeWidth={3} /> Top up
                  </button>
                </div>
                {paymentMethod === "wallet" && walletBalance < backendTotal && (
                  <p className="text-[10px] text-pink font-medium mt-1 flex items-center">
                    <AlertCircle size={10} className="mr-1" /> Insufficient
                    balance for this order
                  </p>
                )}
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
              {isCalculating ? (
                <span className="animate-pulse bg-gray-200 h-4 w-16 rounded"></span>
              ) : (
                <span>NGN {formatPrice(finalSubtotal)}</span>
              )}
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- NGN {formatPrice(appliedDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-800">
              <span>Delivery fee</span>
              {isCalculating ? (
                <span className="animate-pulse bg-gray-200 h-4 w-16 rounded"></span>
              ) : (
                <span>NGN {formatPrice(finalDeliveryFee)}</span>
              )}
            </div>
            {checkoutDetails?.has_feed_items ? (
              <div className="space-y-1">
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Platform fee</span>
                  {isCalculating ? (
                    <span className="animate-pulse bg-gray-200 h-4 w-12 rounded"></span>
                  ) : (
                    <span>Free</span>
                  )}
                </div>
                {!isCalculating && (
                  <div className="flex items-center gap-1.5 text-[11px] text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100/50 mt-1">
                    <CheckCircle2 size={12} className="text-green-600 shrink-0" />
                    <span>₦0 platform fee applied for feed purchase!</span>
                  </div>
                )}
              </div>
            ) : (
              finalPlatformFee > 0 && (
                <div className="flex justify-between text-gray-800">
                  <span>Platform fee</span>
                  {isCalculating ? (
                    <span className="animate-pulse bg-gray-200 h-4 w-12 rounded"></span>
                  ) : (
                    <span>NGN {formatPrice(finalPlatformFee)}</span>
                  )}
                </div>
              )
            )}
            <div className="flex justify-between text-gray-900 font-bold border-t border-gray-100 pt-3 mt-1">
              <span>Total</span>
              {isCalculating ? (
                <span className="animate-pulse bg-gray-200 h-4 w-20 rounded"></span>
              ) : (
                <span>NGN {formatPrice(estimatedTotal)}</span>
              )}
            </div>
            <div className="flex justify-between text-gray-500 pt-2">
              <span>Estimated Delivery Time</span>
              {isCalculating ? (
                <span className="animate-pulse bg-gray-200 h-4 w-24 rounded"></span>
              ) : (
                <span>{finalEstimatedTime}</span>
              )}
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
              {isCalculating ? (
                <span className="animate-pulse bg-gray-200 h-6 w-24 rounded inline-block mt-1"></span>
              ) : (
                `NGN ${formatPrice(estimatedTotal)}`
              )}
            </span>
          </div>
          <button
            onClick={handleProceedToPayment}
            className="flex-1 bg-lily text-white py-3.5 rounded-full text-md font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !itemsToCheckout ||
              itemsToCheckout.length === 0 ||
              isCreatingOrder ||
              isCalculating
            }
          >
            {isCreatingOrder || isCalculating ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              "Proceed"
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isBalanceModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-pink" />

              <button
                onClick={() => setIsBalanceModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center pt-2">
                <div className="w-16 h-16 bg-pink/10 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-pink" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Insufficient Balance
                </h3>

                <p className="text-gray-600 leading-relaxed mb-8">
                  {balanceModalMessage}
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={() => {
                      setIsBalanceModalOpen(false);
                      navigate("/wallet");
                    }}
                    className="w-full bg-lily text-white py-3.5 rounded-2xl font-bold hover:bg-opacity-90 transition-colors shadow-lg shadow-lily/20"
                  >
                    Top up now
                  </button>

                  <button
                    onClick={() => setIsBalanceModalOpen(false)}
                    className="w-full bg-gray-50 text-gray-600 py-3.5 rounded-2xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
