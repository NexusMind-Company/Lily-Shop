import { useState } from "react";
import { PaymentContext } from "./PaymentContext";

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
