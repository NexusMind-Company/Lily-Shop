import { createContext, useContext, useState } from "react";

export const PaymentContext = createContext(null);

export const PaymentProvider = ({ children }) => {
  const initialState = {
    amount: 0,
    vendorName: "",
    orderId: null,
    amountPaid: 0,
    selectedAddress: null,
    selectedPaymentMethod: null,
  };

  const [paymentData, setPaymentData] = useState(initialState);

  const resetPaymentData = () => {
    setPaymentData(initialState);
  };

  return (
    <PaymentContext.Provider
      value={{ paymentData, setPaymentData, resetPaymentData }}
    >
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
