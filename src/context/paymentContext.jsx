import React, { createContext, useContext, useState } from "react";

const PaymentContext = createContext(null);
export const PaymentProvider = ({ children }) => {
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    vendorName: "",
    orderId: null,
    amountPaid: 0,
  });

  return (
    <PaymentContext.Provider value={{ paymentData, setPaymentData }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
