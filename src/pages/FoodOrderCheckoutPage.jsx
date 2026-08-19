import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, MapPin, Phone, User, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { createFoodOrder } from "../services/api";
import { fetchWallet } from "../redux/walletSlice";
import { formatPrice } from "../utils/formatters";
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

  const [customerName, setCustomerName] = useState(
    user_data?.first_name 
      ? `${user_data.first_name} ${user_data.last_name || ""}`.trim() 
      : ""
  );
  const [phone, setPhone] = useState(user_data?.phone_number || "");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchWallet());
    
    if (!product || !vendorId) {
      toast.error("Invalid order data. Please select a meal again.");
      navigate("/feed");
    }
  }, [dispatch, product, vendorId, navigate]);

  const foodPrice = useMemo(() => {
    return Number(product?.price_in_naira) || Number(product?.price) || 0;
  }, [product]);

  const deliveryFee = useMemo(() => {
    return Number(product?.delivery_fee_naira) || Number(product?.deliveryCharge) || 0;
  }, [product]);

  const subtotal = foodPrice * (quantity || 1);
  const platformFee = subtotal * 0.10; // 10% platform fee
  const total = subtotal + deliveryFee + platformFee;

  const [paymentMethod, setPaymentMethod] = useState("wallet");

  const handlePay = async () => {
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in your name, phone, and delivery address.");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < total) {
      toast.error(`Insufficient wallet balance. You need NGN ${formatPrice(total)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        vendor: vendorId,
        delivery_address: address,
        items: [
          {
            menu_item_id: product.id,
            quantity: quantity || 1
          }
        ],
        payment_method: paymentMethod,
        delivery_type: "delivery",
        delivery_fee_naira: deliveryFee,
        platform_fee_naira: platformFee, 
        buyer_note: note,
        buyer_name: customerName,
        buyer_phone: phone
      };

      const response = await createFoodOrder(orderData);
      
      if (paymentMethod === "paystack" && response?.authorization_url) {
        localStorage.setItem("lily_pending_order", JSON.stringify({
          product,
          quantity,
          total,
          type: "food_order"
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
            paymentMethod 
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 py-4 sticky top-0 z-20 flex items-center border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">Checkout</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
        {/* Order Summary */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
              <img 
                src={product.image_url || product.media_url} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Quantity: {quantity}</p>
              <p className="font-bold text-lily mt-1">₦{formatPrice(foodPrice)}</p>
            </div>
          </div>
        </section>

        {/* Delivery Details */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-bold text-gray-900 mb-2">Delivery Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </label>
            <input 
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-lily focus:ring-1 focus:ring-lily transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number
            </label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-lily focus:ring-1 focus:ring-lily transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Delivery Address
            </label>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full delivery address"
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-lily focus:ring-1 focus:ring-lily transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note for Vendor (Optional)
            </label>
            <input 
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Less spicy, extra sauce..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-lily focus:ring-1 focus:ring-lily transition-colors"
            />
          </div>
        </section>

        {/* Payment Summary */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Payment Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Food Price (x{quantity})</span>
              <span>₦{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>₦{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform Fee</span>
              <span>₦{formatPrice(platformFee)}</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-lg">
              <span>You Pay</span>
              <span>₦{formatPrice(total)}</span>
            </div>
          </div>
        </section>

        {/* Payment Action */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod("wallet")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                paymentMethod === "wallet"
                  ? "border-lily bg-lily/5"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lily/10 flex items-center justify-center">
                  <span className="font-bold text-lily">W</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Lily Wallet</p>
                  <p className="text-xs text-gray-500">Balance: ₦{formatPrice(walletBalance)}</p>
                </div>
              </div>
              {paymentMethod === "wallet" && <CheckCircle2 className="w-5 h-5 text-lily" />}
            </button>
          </div>

          <button
            onClick={handlePay}
            disabled={isSubmitting || isLoadingWallet}
            className="w-full py-4 rounded-xl font-bold text-sm bg-lily text-white shadow-lg shadow-lily/20 hover:bg-darklily active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Pay ₦${formatPrice(total)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodOrderCheckoutPage;
