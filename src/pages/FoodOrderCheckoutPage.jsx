import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  createFoodOrder,
  fetchFoodVendor,
  shopaCalculateFee,
  fetchDeliveryAddresses,
} from "../services/api";
import { fetchWallet } from "../redux/walletSlice";
import { formatPrice } from "../utils/formatters";
import { usePayment } from "../hooks/usePayment";
import toast from "react-hot-toast";

const FoodOrderCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, quantity, vendorId } = location.state || {};
  
  const { balance_naira: walletBalance, isLoading: isLoadingWallet } = useSelector(
    (state) => state.wallet || {}
  );
  
  const { user_data } = useSelector((state) => state.auth || {});
  const { paymentData, setPaymentData } = usePayment();
  const selectedAddress = paymentData?.selectedAddress;

  const { data: addressesData } = useQuery({
    queryKey: ["deliveryAddresses"],
    queryFn: fetchDeliveryAddresses,
  });

  const addressList = useMemo(() => {
    return addressesData?.results || addressesData || [];
  }, [addressesData]);

  // Auto-select default address if none is currently selected
  useEffect(() => {
    if (!selectedAddress && addressList.length > 0) {
      const defaultAddr = addressList.find((a) => a.is_default) || addressList[0];
      setPaymentData((prev) => ({
        ...prev,
        selectedAddress: defaultAddr,
        selectedAddressId: defaultAddr.id,
      }));
    }
  }, [selectedAddress, addressList, setPaymentData]);

  const resolveRecipientName = () => {
    return (
      selectedAddress?.name ||
      selectedAddress?.recipient_name ||
      selectedAddress?.label ||
      (user_data?.first_name
        ? `${user_data.first_name} ${user_data.last_name || ""}`.trim()
        : "") ||
      user_data?.username ||
      ""
    );
  };

  const resolvePhone = () => {
    return (
      selectedAddress?.phone_number ||
      selectedAddress?.phone ||
      user_data?.phone_number ||
      ""
    );
  };

  const [customerName, setCustomerName] = useState(resolveRecipientName());
  const [phone, setPhone] = useState(resolvePhone());

  // Auto-sync recipient name and phone when selected address changes
  useEffect(() => {
    if (selectedAddress) {
      const addressName =
        selectedAddress.name ||
        selectedAddress.recipient_name ||
        selectedAddress.label;
      if (addressName) {
        setCustomerName(addressName);
      }
      const addressPhone = selectedAddress.phone_number || selectedAddress.phone;
      if (addressPhone) {
        setPhone(addressPhone);
      }
    } else if (user_data) {
      if (!customerName) {
        setCustomerName(resolveRecipientName());
      }
      if (!phone) {
        setPhone(resolvePhone());
      }
    }
  }, [selectedAddress, user_data]);

  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchWallet());
    
    if (!product || !vendorId) {
      toast.error("Invalid order data. Please select a meal again.");
      navigate("/feed");
    }
  }, [dispatch, product, vendorId, navigate]);

  // Fetch vendor details to obtain vendor coordinates for Shopa delivery calculation
  const { data: vendorDetails } = useQuery({
    queryKey: ["foodVendor", vendorId],
    queryFn: () => fetchFoodVendor(vendorId),
    enabled: !!vendorId,
  });

  const [shopaDeliveryFee, setShopaDeliveryFee] = useState(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [isExtendedDelivery, setIsExtendedDelivery] = useState(false);
  const [shopaBaseFee, setShopaBaseFee] = useState(null);
  const [shopaPerKmRate, setShopaPerKmRate] = useState(null);
  const [isMinimumFeeApplied, setIsMinimumFeeApplied] = useState(false);

  const foodPrice = useMemo(() => {
    return Number(product?.price_in_naira) || Number(product?.price) || 0;
  }, [product]);

  const fallbackDeliveryFee = useMemo(() => {
    return Number(product?.delivery_fee_naira) || Number(product?.deliveryCharge) || 0;
  }, [product]);

  // Real-time dynamic Shopa delivery fee calculation using vendor and buyer coordinates
  useEffect(() => {
    let isCancelled = false;

    const calculateDeliveryFee = async () => {
      const vendorLat =
        vendorDetails?.latitude ||
        product?.vendor_latitude ||
        product?.vendor?.latitude;
      const vendorLon =
        vendorDetails?.longitude ||
        product?.vendor_longitude ||
        product?.vendor?.longitude;
      const buyerLat = selectedAddress?.latitude || selectedAddress?.lat;
      const buyerLon = selectedAddress?.longitude || selectedAddress?.lon;

      if (!vendorLat || !vendorLon || !buyerLat || !buyerLon) {
        if (!isCancelled) {
          setShopaDeliveryFee(null);
          setDeliveryDistance(null);
          setIsExtendedDelivery(false);
        }
        return;
      }

      if (!isCancelled) setIsCalculatingDelivery(true);
      try {
        const quote = await shopaCalculateFee({
          delivery_type: "food",
          pickup_lat: Number(vendorLat),
          pickup_lon: Number(vendorLon),
          dropoff_lat: Number(buyerLat),
          dropoff_lon: Number(buyerLon),
        });

        const calculatedFee =
          Number(quote?.total_fee_naira) ||
          (quote?.total_fee_kobo ? Number(quote.total_fee_kobo) / 100 : null);

        if (!isCancelled) {
          if (calculatedFee !== null && !isNaN(calculatedFee)) {
            setShopaDeliveryFee(calculatedFee);
            setDeliveryDistance(quote?.distance_km);
            setIsExtendedDelivery(quote?.is_extended_distance || false);
            setShopaBaseFee(quote?.base_fee_naira || 0);
            
            // Calculate the per km rate from the total per km charge divided by distance
            // because the live API might not return per_km_rate_naira directly yet.
            const rate = quote?.per_km_rate_naira !== undefined 
                ? quote.per_km_rate_naira 
                : (quote?.per_km_charge_naira && quote?.distance_km ? quote.per_km_charge_naira / quote.distance_km : 0);
            setShopaPerKmRate(rate);
            
            // If the live API hasn't been updated with minimum_fee_applied, calculate it:
            const isMinApplied = quote?.minimum_fee_applied !== undefined 
                ? quote.minimum_fee_applied 
                : (calculatedFee > (quote?.base_fee_naira || 0) + (quote?.per_km_charge_naira || 0) + (quote?.surcharge_naira || 0));
            
            setIsMinimumFeeApplied(isMinApplied);
          } else {
            setShopaDeliveryFee(null);
            setDeliveryDistance(null);
            setIsExtendedDelivery(false);
            setShopaBaseFee(null);
            setShopaPerKmRate(null);
            setIsMinimumFeeApplied(false);
          }
        }
      } catch (err) {
        console.warn("Shopa delivery fee calculation fallback to default:", err);
        if (!isCancelled) {
          setShopaDeliveryFee(null);
          setDeliveryDistance(null);
          setIsExtendedDelivery(false);
          setShopaBaseFee(null);
          setShopaPerKmRate(null);
          setIsMinimumFeeApplied(false);
        }
      } finally {
        if (!isCancelled) setIsCalculatingDelivery(false);
      }
    };

    calculateDeliveryFee();

    return () => {
      isCancelled = true;
    };
  }, [vendorDetails, selectedAddress, product]);

  const deliveryFee = shopaDeliveryFee !== null ? shopaDeliveryFee : fallbackDeliveryFee;
  const subtotal = foodPrice * (quantity || 1);
  // Platform fee is an internal 10% commission deducted from vendor payout by backend; buyer pays subtotal + delivery
  const total = subtotal + deliveryFee;

  const [paymentMethod, setPaymentMethod] = useState("wallet");

  const handlePay = async () => {
    if (!customerName.trim() || !phone.trim() || !selectedAddress) {
      toast.error("Please fill in your name, phone, and select a delivery address.");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < total) {
      toast.error(`Insufficient wallet balance. You need NGN ${formatPrice(total)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const buyerLat = selectedAddress?.latitude || selectedAddress?.lat;
      const buyerLon = selectedAddress?.longitude || selectedAddress?.lon;

      const orderData = {
        vendor: vendorId,
        delivery_address: `${selectedAddress.street_address}, ${selectedAddress.city}, ${selectedAddress.state}`,
        delivery_lat: buyerLat ? Number(buyerLat) : undefined,
        delivery_lon: buyerLon ? Number(buyerLon) : undefined,
        items: [
          {
            menu_item_id: product.id,
            quantity: quantity || 1
          }
        ],
        payment_method: paymentMethod,
        delivery_type: "delivery",
        delivery_fee_naira: deliveryFee,
        buyer_note: note,
        buyer_name: customerName.trim(),
        buyer_phone: phone.trim()
      };

      const response = await createFoodOrder(orderData);
      
      if (paymentMethod === "paystack" && response?.authorization_url) {
        localStorage.setItem("lily_pending_order", JSON.stringify({
          product,
          quantity,
          total,
          type: "food_order",
          vendorUserId: vendorDetails?.user || vendorDetails?.user_id || response?.vendor_user_id,
          vendorName: vendorDetails?.name || response?.vendor_name,
        }));
        toast.success("Redirecting to Paystack...");
        window.location.href = response.authorization_url;
      } else {
        toast.success("Food order placed successfully!");
        navigate("/order-success", { 
          state: { 
            order: response, 
            product, 
            quantity, 
            total,
            paymentMethod,
            isFood: true,
            vendorUserId: vendorDetails?.user || vendorDetails?.user_id || response?.vendor_user_id,
            vendorName: vendorDetails?.name || response?.vendor_name,
          } 
        });
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to place order.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-gray-50 border-x border-gray-100">
      {/* Top Header */}
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
        {/* Item Card */}
        <div className="bg-white p-4 mb-2 border-b border-gray-100">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600 mb-3">
              {vendorDetails?.name || product?.vendor_name || "Food Kitchen"}
            </p>
            <div className="flex space-x-4">
              <img
                src={product.image_url || product.media_url || "/placeholder.png"}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-xl bg-gray-100 shrink-0"
              />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm font-semibold text-pink">NGN {formatPrice(foodPrice)}</p>
                <p className="text-sm text-black">Qty: {quantity}</p>
                <div className="mt-1 space-y-0.5">
                  <p className="text-sm text-black">
                    Delivery Price: {isCalculatingDelivery ? "Calculating..." : `NGN ${formatPrice(deliveryFee)}`}
                  </p>
                  {shopaDeliveryFee !== null && (
                    <div className="flex flex-col gap-1 items-start">
                      <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full mt-1">
                        Shopa Instant Delivery
                      </span>
                      {deliveryDistance !== null && shopaPerKmRate !== null && (
                        <span className="text-[10px] text-gray-500 font-medium">
                          {shopaBaseFee > 0 
                            ? `NGN ${formatPrice(shopaBaseFee)} base fee + ${deliveryDistance.toFixed(1)} in km @ NGN ${formatPrice(shopaPerKmRate)}/km`
                            : `${deliveryDistance.toFixed(1)} in km @ NGN ${formatPrice(shopaPerKmRate)}/km`}
                        </span>
                      )}
                      {isExtendedDelivery && (
                        <span className="inline-block text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded-full mt-0.5">
                          +20% Extended Distance Surcharge
                        </span>
                      )}
                      {isMinimumFeeApplied && (
                        <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-full mt-0.5">
                          Minimum Fee Applied
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Details Card */}
        <div className="bg-white p-4 mb-2 border-y border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-md text-gray-900">Delivery details</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 className="text-white fill-lily w-6 h-6" />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Home delivery</p>
                  <button
                    onClick={() => navigate("/choose-address")}
                    className="text-xs font-semibold text-pink hover:underline focus:outline-none"
                  >
                    Change
                  </button>
                </div>
                {selectedAddress ? (
                  <div className="mt-1 text-sm text-gray-600">
                    <p className="font-medium text-gray-800">{customerName}</p>
                    <p>{phone}</p>
                    <p className="line-clamp-2 mt-0.5">
                      {selectedAddress.street_address}, {selectedAddress.city}, {selectedAddress.state}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate("/choose-address")}
                    className="mt-2 text-xs text-pink font-semibold flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Delivery Address
                  </button>
                )}
              </div>
            </div>

            {/* Optional Note for Kitchen */}
            <div className="pt-3 border-t border-gray-100">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Order Note for Kitchen (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Less spicy, extra sauce, call on arrival..."
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-lily focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="bg-white p-4 mb-2 border-y border-gray-100">
          <h3 className="font-semibold text-md text-gray-900 mb-4">Payment method</h3>
          <div className="space-y-4">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setPaymentMethod("paystack")}
            >
              <button className="shrink-0 focus:outline-none">
                {paymentMethod === "paystack" ? (
                  <CheckCircle2 className="text-white fill-lily w-6 h-6" />
                ) : (
                  <Circle className="text-gray-400 w-6 h-6" />
                )}
              </button>
              <span className="ml-3 text-sm font-medium text-gray-900">
                Card, Bank Transfer & USSD (Paystack)
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
                    <p className="text-sm font-medium text-gray-900">Lily wallet</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/wallet");
                      }}
                      className="text-xs font-semibold text-pink mt-0.5 hover:underline text-left block"
                    >
                      NGN {formatPrice(walletBalance)}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/wallet");
                    }}
                    className="flex items-center text-pink font-medium text-sm hover:opacity-80 transition-opacity focus:outline-none"
                  >
                    <Plus size={14} className="mr-0.5" strokeWidth={3} /> Top up
                  </button>
                </div>
                {paymentMethod === "wallet" && walletBalance < total && (
                  <p className="text-[10px] text-pink font-medium mt-1 flex items-center">
                    <AlertCircle size={10} className="mr-1" /> Insufficient balance for this order
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-4 border-y border-gray-100">
          <h3 className="font-semibold text-md text-gray-900 mb-4">Order summary</h3>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between text-gray-800">
              <span>Item's total ({quantity})</span>
              <span>NGN {formatPrice(subtotal)}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex justify-between text-gray-800">
                <span className="flex items-center gap-1.5">
                  Delivery charge
                  {shopaDeliveryFee !== null && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full">
                      Shopa
                    </span>
                  )}
                </span>
                <span>
                  {isCalculatingDelivery ? (
                    <span className="text-xs text-gray-400">Calculating...</span>
                  ) : (
                    `NGN ${formatPrice(deliveryFee)}`
                  )}
                </span>
              </div>
              {shopaDeliveryFee !== null && deliveryDistance !== null && shopaPerKmRate !== null && !isCalculatingDelivery && (
                <div className="flex flex-col gap-1 text-gray-500 text-xs mt-1 border-t border-gray-100 pt-1">
                  <div className="flex justify-between">
                    <span>
                      {shopaBaseFee > 0 
                        ? `NGN ${formatPrice(shopaBaseFee)} base fee + ${deliveryDistance.toFixed(1)} in km @ NGN ${formatPrice(shopaPerKmRate)}/km`
                        : `${deliveryDistance.toFixed(1)} in km @ NGN ${formatPrice(shopaPerKmRate)}/km`}
                    </span>
                    <span className={isMinimumFeeApplied || isExtendedDelivery ? "line-through opacity-70" : ""}>
                      NGN {formatPrice(shopaBaseFee + (shopaPerKmRate * deliveryDistance))}
                    </span>
                  </div>
                  {isMinimumFeeApplied && (
                    <div className="flex justify-between text-amber-600 font-medium">
                      <span>Minimum delivery fee applied</span>
                      <span>NGN {formatPrice(shopaDeliveryFee)}</span>
                    </div>
                  )}
                  {isExtendedDelivery && !isMinimumFeeApplied && (
                    <div className="flex justify-between text-rose-600 font-medium">
                      <span>+20% Extended distance surcharge</span>
                      <span>NGN {formatPrice(shopaDeliveryFee)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span>
              <span className="text-pink">NGN {formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-4 z-40">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 block">Total</span>
            <span className="text-lg font-bold text-pink">NGN {formatPrice(total)}</span>
          </div>
          <button
            onClick={handlePay}
            disabled={isSubmitting || isLoadingWallet}
            className="flex-1 bg-lily text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-darklily active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Proceed to Payment</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodOrderCheckoutPage;
