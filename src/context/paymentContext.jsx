import React, { createContext, useState, useContext } from "react";

// This context will hold payment details (amount, orderId)
// that need to be shared across the payment flow pages.
const PaymentContext = createContext();

// Custom hook to easily access the context
export const usePayment = () => useContext(PaymentContext);

// Provider component to wrap your app
export const PaymentProvider = ({ children }) => {
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    vendorName: "",
    orderId: null,
    amountPaid: 0,
  });

  const value = {
    paymentData,
    setPaymentData,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};

