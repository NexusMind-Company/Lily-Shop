import React, { useState, useMemo, useEffect } from "react"; // Import useMemo, useEffect
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { ChevronLeft } from "lucide-react";
import {
  selectCartItems,
} from "../../../redux/cartSlice";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Get location to access navigation state

  // 1. Get ALL items from the Redux cart
  const allCartItems = useSelector(selectCartItems);

  // 2. Get the selected IDs passed from the modal
  const selectedItemIds = location.state?.selectedItemIds;

  // 3. Filter ALL items to get ONLY the ones we want to check out
  const itemsToCheckout = useMemo(() => {
    if (!selectedItemIds) {
      return []; // No items were passed, show empty cart
    }
    return allCartItems.filter((item) => selectedItemIds.includes(item.id));
  }, [allCartItems, selectedItemIds]);

  // REDIRECT IF EMPTY 
  // If user lands here directly (no selected items), redirect them back to the feed
  useEffect(() => {
    if (!selectedItemIds || selectedItemIds.length === 0) {
      console.log("No items selected, redirecting.");
      navigate("/feed"); // or navigate(-1) to go back
    }
  }, [selectedItemIds, navigate]);

  // ALL CALCULATIONS are now based on `itemsToCheckout`
  const itemCount = useMemo(
    () =>
      itemsToCheckout.reduce((count, item) => count + item.quantity, 0),
    [itemsToCheckout]
  );
  
  const subtotal = useMemo(
    () =>
      itemsToCheckout.reduce((total, item) => total + item.price * item.quantity, 0),
    [itemsToCheckout]
  );

  // State for Delivery & Payment
  const [deliveryAddress, setDeliveryAddress] = useState("Default address: 22 Owode street, Ajegunle, Lagos, Nigeria");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Mock values
  const deliveryFee = 500;
  const serviceCharge = 100;
  
  // Final total based on the subtotal of selected items
  const estimatedTotal = subtotal + deliveryFee + serviceCharge - appliedDiscount;

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleApplyVoucher = () => {
    if (voucherCode === "SAVE10") {
      setAppliedDiscount(subtotal * 0.1); // Discount on subtotal
      alert("Voucher applied successfully!");
    } else {
      setAppliedDiscount(0);
      alert("Invalid voucher code.");
    }
  };

  const handleProceedToPayment = () => {
    console.log("Proceeding to payment with:", {
      itemsToCheckout, // Only the selected items
      deliveryAddress,
      paymentMethod,
      estimatedTotal,
    });
    // Here, you would also dispatch an action to REMOVE these items from the cart
    // e.g., dispatch(removeSelectedItems(selectedItemIds));
    navigate("/order-confirmation");
  };

  return (
    <div className="bg-white min-h-screen max-w-xl mx-auto shadow-md flex flex-col">
      {/* Header */}
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate(-1)} // Go back to modal/feed
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Confirm Order</h2>
      </div>

      {/* Check `itemsToCheckout.length` */}
      {itemsToCheckout.length === 0 ? (
        <p className="text-center text-gray-500 mt-8 flex-1">
          No items selected for checkout.
        </p>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Items in Cart Summary */}
          <div>
            {/* Use `itemCount` */}
            <h3 className="font-semibold text-md text-gray-800 mb-3">Items ({itemCount})</h3>
            <div className="space-y-3">
              {/* Map over `itemsToCheckout` */}
              {itemsToCheckout.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.mediaSrc}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.productName}</p>
                    {/* This is where you'd add the username if you did Part 1 */}
                    <p className="text-xs text-gray-500">Sold by: {item.username}</p> 
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                    {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                    <p className="text-sm font-semibold text-green-700">N{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address (no changes) */}
          <div>
            <h3 className="font-semibold text-md text-gray-800 mb-3">Delivery address</h3>
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
              <p className="font-medium">{deliveryAddress}</p>
              <button className="text-lily text-sm hover:underline">
                + Add new address
              </button>
            </div>
          </div>

          {/* Pickup Option (no changes) */}
          <div>
            <h3 className="font-semibold text-md text-gray-800 mb-3">Pickup</h3>
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
              <p className="font-medium">23 Owode Street, Ajegunle, Lagos, Nigeria</p>
              <button className="text-lily text-sm hover:underline">
                View map
              </button>
            </div>
          </div>

          {/* Payment Method (no changes) */}
          <div>
            <h3 className="font-semibold text-md text-gray-800 mb-3">Payment Method</h3>
            <div className="space-y-3">
              {/* ...radio buttons... */}
            </div>
          </div>

          {/* Voucher Code (no changes) */}
          <div>
            <h3 className="font-semibold text-md text-gray-800 mb-3">Voucher code</h3>
            <div className="flex space-x-2">
              {/* ...input and button... */}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold text-md text-gray-800 mb-3">Order summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                {/* Use `itemCount` and `subtotal` */}
                <span>Items total ({itemCount})</span>
                <span>N{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-red-500">-N{formatPrice(appliedDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span>N{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service charge</span>
                <span>N{formatPrice(serviceCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-md border-t border-gray-200 pt-2 mt-2">
                <span>Total Payment</span>
                {/* MODFIED: Use `estimatedTotal` */}
                <span className="text-lily">N{formatPrice(estimatedTotal)}</span>
              </div>
            </div>
            {/* ...legal text... */}
          </div>
        </div>
      )}

      {/* Fixed Footer for Proceed Button */}
      {/* Check `itemsToCheckout.length` */}
      {itemsToCheckout.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={handleProceedToPayment}
            className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Proceed
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;



// import React, { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { ChevronLeft } from "lucide-react";
// import {
//   selectCartItems,
//   selectCartTotal,
//   selectCartItemCount,
// } from "../../../redux/cartSlice"; // Adjust path as needed

// const CartPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const cartItems = useSelector(selectCartItems);
//   const cartTotal = useSelector(selectCartTotal);
//   const cartItemCount = useSelector(selectCartItemCount);

//   // --- State for Delivery & Payment (Simplified for initial setup) ---
//   const [deliveryAddress, setDeliveryAddress] = useState(
//     "Default address: 22 Owode street, Ajegunle, Lagos, Nigeria"
//   );
//   const [paymentMethod, setPaymentMethod] = useState("card"); // 'card', 'bank', 'wallet'
//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedDiscount, setAppliedDiscount] = useState(0); // For voucher logic

//   // Mock values for delivery fee, etc.
//   const deliveryFee = 500;
//   const serviceCharge = 100; // Example
//   const estimatedTotal =
//     cartTotal + deliveryFee + serviceCharge - appliedDiscount;

//   const formatPrice = (price) => {
//     return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   };

//   const handleApplyVoucher = () => {
//     // Implement real voucher logic here
//     if (voucherCode === "SAVE10") {
//       setAppliedDiscount(cartTotal * 0.1); // Example: 10% discount
//       alert("Voucher applied successfully!");
//     } else {
//       setAppliedDiscount(0);
//       alert("Invalid voucher code.");
//     }
//   };

//   const handleProceedToPayment = () => {
//     // Here you would typically:
//     // 1. Validate all form fields
//     // 2. Process the order (e.g., send to backend)
//     // 3. Navigate to a payment gateway or order confirmation page
//     console.log("Proceeding to payment with:", {
//       cartItems,
//       deliveryAddress,
//       paymentMethod,
//       estimatedTotal,
//     });
//     // For now, let's just navigate to a success page or back home
//     navigate("/order-confirmation"); // You'd create this page next
//   };

//   return (
//     <div className="bg-white min-h-screen max-w-xl mx-auto shadow-md flex flex-col">
//       {/* Header */}
//       <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
//         <button
//           onClick={() => navigate(-1)}
//           className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
//         >
//           <ChevronLeft size={24} />
//         </button>
//         <h2 className="font-bold text-lg text-gray-800">Confirm Order</h2>
//       </div>

//       {cartItemCount === 0 ? (
//         <p className="text-center text-gray-500 mt-8 flex-1">
//           Your cart is empty. Please add items to proceed.
//         </p>
//       ) : (
//         <div className="flex-1 overflow-y-auto p-4 space-y-6">
//           {/* Items in Cart Summary */}
//           <div>
//             <h3 className="font-semibold text-md text-gray-800 mb-3">
//               Items ({cartItemCount})
//             </h3>
//             <div className="space-y-3">
//               {cartItems.map((item) => (
//                 <div key={item.id} className="flex items-center space-x-3">
//                   <img
//                     src={item.mediaSrc}
//                     alt={item.productName}
//                     className="w-16 h-16 object-cover rounded-md flex-shrink-0"
//                   />
//                   <div className="flex-1">
//                     <p className="font-medium text-gray-800">
//                       {item.productName}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       Sold by: {item.username}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Qty: {item.quantity}
//                     </p>
//                     {item.color && (
//                       <p className="text-xs text-gray-500">
//                         Color: {item.color}
//                       </p>
//                     )}
//                     {item.size && (
//                       <p className="text-xs text-gray-500">Size: {item.size}</p>
//                     )}
//                     <p className="text-sm font-semibold text-green-700">
//                       N{formatPrice(item.price * item.quantity)}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Delivery Address */}
//           <div>
//             <h3 className="font-semibold text-md text-gray-800 mb-3">
//               Delivery address
//             </h3>
//             <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
//               <p className="font-medium">{deliveryAddress}</p>
//               <button className="text-lily text-sm hover:underline">
//                 + Add new address
//               </button>
//             </div>
//           </div>

//           {/* Pickup Option (if applicable) */}
//           <div>
//             <h3 className="font-semibold text-md text-gray-800 mb-3">Pickup</h3>
//             <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
//               <p className="font-medium">
//                 23 Owode Street, Ajegunle, Lagos, Nigeria
//               </p>
//               <button className="text-lily text-sm hover:underline">
//                 View map
//               </button>
//             </div>
//           </div>

//           {/* Payment Method */}
//           <div>
//             <h3 className="font-semibold text-md text-gray-800 mb-3">
//               Payment Method
//             </h3>
//             <div className="space-y-3">
//               <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
//                 <input
//                   type="radio"
//                   name="payment"
//                   value="card"
//                   checked={paymentMethod === "card"}
//                   onChange={() => setPaymentMethod("card")}
//                   className="form-radio text-lily"
//                 />
//                 <span className="text-gray-700 font-medium">
//                   Card (Default)
//                 </span>
//               </label>
//               <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
//                 <input
//                   type="radio"
//                   name="payment"
//                   value="bank"
//                   checked={paymentMethod === "bank"}
//                   onChange={() => setPaymentMethod("bank")}
//                   className="form-radio text-lily"
//                 />
//                 <span className="text-gray-700 font-medium">Bank Transfer</span>
//               </label>
//               <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
//                 <input
//                   type="radio"
//                   name="payment"
//                   value="wallet"
//                   checked={paymentMethod === "wallet"}
//                   onChange={() => setPaymentMethod("wallet")}
//                   className="form-radio text-lily"
//                 />
//                 <span className="text-gray-700 font-medium">Lily Wallet</span>
//               </label>
//             </div>
//           </div>

//           {/* Voucher Code */}
//           <div>
//             <h3 className="font-semibold text-md text-gray-800 mb-3">
//               Voucher code
//             </h3>
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 placeholder="XXXXXXX"
//                 value={voucherCode}
//                 onChange={(e) => setVoucherCode(e.target.value)}
//                 className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-lily focus:border-lily"
//               />
//               <button
//                 onClick={handleApplyVoucher}
//                 className="bg-lily text-white px-5 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
//               >
//                 Apply
//               </button>
//             </div>
//           </div>

//           {/* Order Summary */}
//           <div>
//             <h3 className="font-semibold text-md text-gray-800 mb-3">
//               Order summary
//             </h3>
//             <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span>Items total ({cartItemCount})</span>
//                 <span>N{formatPrice(cartTotal)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Discount</span>
//                 <span className="text-red-500">
//                   -N{formatPrice(appliedDiscount)}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Delivery fee</span>
//                 <span>N{formatPrice(deliveryFee)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Service charge</span>
//                 <span>N{formatPrice(serviceCharge)}</span>
//               </div>
//               <div className="flex justify-between font-bold text-md border-t border-gray-200 pt-2 mt-2">
//                 <span>Total Payment</span>
//                 <span className="text-lily">
//                   N{formatPrice(estimatedTotal)}
//                 </span>
//               </div>
//             </div>
//             <p className="text-xs text-gray-500 mt-2">
//               *Your payment may be subject to a cross border fee if order has
//               been confirmed
//             </p>
//             <p className="text-xs text-gray-500">
//               *Orders may be informed within 2 (days) of purchase. learn more in
//               our terms of use.
//             </p>
//             <p className="text-xs text-gray-500">
//               By clicking &ldquo;proceed&ldquo;, you confirm you have read and
//               agree to our terms of services.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Fixed Footer for Proceed Button */}
//       {cartItemCount > 0 && (
//         <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
//           <button
//             onClick={handleProceedToPayment}
//             className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
//           >
//             Proceed
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CartPage;
