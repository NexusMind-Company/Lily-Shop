/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback, createContext } from "react";

export const PaymentContext = createContext(null);

const initialState = {
  amount: 0,
  vendorName: "",
  orderId: null,
  amountPaid: 0,
  selectedAddress: null,
  selectedPaymentMethod: null,
};

export const PaymentProvider = ({ children }) => {
  const [paymentData, setPaymentData] = useState(initialState);

  const resetPaymentData = useCallback(() => {
    setPaymentData(initialState);
  }, []);

  return (
    <PaymentContext.Provider
      value={{ paymentData, setPaymentData, resetPaymentData }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
