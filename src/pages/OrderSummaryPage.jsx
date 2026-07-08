import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartTotal,
  clearCart,
} from "../redux/cartSlice";
import { usePayment } from "../hooks/usePayment";
import { createOrder } from "../services/api";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Wallet,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

const OrderSummaryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const { paymentData } = usePayment();
  const { selectedAddress, selectedPaymentMethod } = paymentData;

  const DELIVERY_FEE = 1500; // Example fixed fee, can be dynamic
  const TOTAL_PAYABLE = cartTotal + DELIVERY_FEE;

  // Format currency helper
  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      // 1. Clear the cart
      dispatch(clearCart());

      // 2. Handle redirection based on payment method
      if (selectedPaymentMethod === "paystack") {
        // Paystack returns an authorization_url
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          toast.error("Error: No payment link received.");
        }
      } else {
        // Wallet payment is instant
        navigate("/payment-success");
      }
    },
    onError: (error) => {
      console.error("Order creation failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    },
  });

  const handlePlaceOrder = () => {
    if (!selectedAddress || !selectedPaymentMethod) {
      toast.error("Missing address or payment method.");
      return;
    }

    const orderPayload = {
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      })),
      total_amount_kobo: TOTAL_PAYABLE * 100, // API expects kobo
      payment_method: selectedPaymentMethod,
      address_id: selectedAddress.id,
      delivery_address: selectedAddress,
    };

    mutation.mutate(orderPayload);
  };

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen w-full max-w-5xl mx-auto bg-gray-50">
      <div className="bg-white p-4 border-b border-gray-200 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Order Summary</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Address Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-3">
            Delivery To
          </h3>
          <div className="flex items-start space-x-3">
            <MapPin className="text-lily mt-0.5" size={20} />
            <div>
              <p className="font-bold text-gray-800">{selectedAddress?.name}</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedAddress?.address}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {selectedAddress?.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-3">
            Payment Method
          </h3>
          <div className="flex items-center space-x-3 text-gray-800">
            {selectedPaymentMethod === "paystack" ? (
              <>
                <CreditCard className="text-blue-600" size={24} />
                <span className="font-medium">Paystack (Card / Transfer)</span>
              </>
            ) : (
              <>
                <Wallet className="text-green-600" size={24} />
                <span className="font-medium">Lily Wallet</span>
              </>
            )}
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-3">
            Items ({cartItems.length})
          </h3>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={item.mediaSrc}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm line-clamp-1 w-40">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatMoney(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatMoney(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>{formatMoney(DELIVERY_FEE)}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between items-center">
            <span className="font-bold text-gray-900 text-lg">Total</span>
            <span className="font-bold text-lily text-xl">
              {formatMoney(TOTAL_PAYABLE)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="bg-white p-4 border-t border-gray-200 shadow-up-lg">
        <button
          onClick={handlePlaceOrder}
          disabled={mutation.isPending}
          className="w-full bg-lily text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-darklily transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            `Pay ${formatMoney(TOTAL_PAYABLE)}`
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
