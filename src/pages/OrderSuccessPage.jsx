// src/pages/OrderSuccessPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCart } from "../redux/cartSlice";
import { usePayment } from "../hooks/usePayment";
import { startConversation, sendConversationMessage } from "../services/api";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { resetPaymentData } = usePayment();
  const { order, paymentMethod } = location.state || {};

  useEffect(() => {
    dispatch(fetchCart());
    resetPaymentData();
  }, [dispatch, resetPaymentData]);

  // Send Order Messages to Sellers
  useEffect(() => {
    if (!order || !order.items) return;
    
    // Check local storage to prevent duplicate sending on refresh
    const sentKey = `order_notified_${order.id}`;

    const notifySellers = async () => {
      try {
        const vendorGroups = {};
        order.items.forEach(item => {
          // Group items by vendor to send one combined message per vendor
          const shopId = item.product?.shop_id || item.product?.vendor_id || item.product?.id;
          if (!vendorGroups[shopId]) vendorGroups[shopId] = [];
          vendorGroups[shopId].push(item);
        });

        let firstVendorId = null;

        for (const [shopId, items] of Object.entries(vendorGroups)) {
          // 1. Start conversation using the first product
          const firstProduct = items[0].product;
          if (!firstProduct?.id) continue;
          
          if (!firstVendorId) {
            firstVendorId = firstProduct.user_id || firstProduct.vendor_id || shopId;
          }
          
          try {
            const conversation = await startConversation({ product_id: firstProduct.id });
            
            // 2. Prepare payload
            const orderPayload = JSON.stringify({
              order_id: order.id,
              reference: order.reference,
              buyer_name: order.customer_name || "Customer",
              items: items,
              total: items.reduce((sum, item) => sum + (item.subtotal_kobo || 0) / 100, 0),
              delivery_fee: order.delivery_fee_naira || order.delivery_fee || 0,
              estimated_time: order.estimated_delivery_time || order.delivery_time || "Pending ETA",
              delivery_address: order.delivery_address || order.shipping_address || null,
              pickup_location: order.pickup_location || null,
              delivery_type: order.delivery_type || "delivery",
            });

            // 3. Send message to the new or existing conversation
            if (conversation?.id) {
              if (!localStorage.getItem(sentKey)) {
                await sendConversationMessage(conversation.id, { 
                  content: `[ORDER_PAYLOAD]:${orderPayload}`,
                });
              }
            }
          } catch (err) {
            console.error("Failed to notify vendor", shopId, err);
          }
        }
        
        localStorage.setItem(sentKey, "true");
        
        if (firstVendorId) {
          navigate(`/chat/${firstVendorId}`, { replace: true });
        } else {
          navigate("/inbox", { replace: true });
        }
      } catch (e) {
        console.error("Failed to notify sellers", e);
        navigate("/orders", { replace: true });
      }
    };

    notifySellers();
  }, [order, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 font-medium animate-pulse">Processing your order and preparing chat...</p>
    </div>
  );
};

export default OrderSuccessPage;
