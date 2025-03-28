import React, { useState, useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchShopById } from "../../redux/shopSlice"; // Ensure shop data is fetched
import { initiatePayment } from "../../redux/paymentInitiationSlice";

const Step2 = () => {
  const { shopId } = useParams();
  console.log("🔍 Extracted shopId:", shopId);
  const dispatch = useDispatch();

  // Get token from Redux store
  const token = useSelector((state) => state.auth?.user_data?.token?.access);

  // Get shop details from Redux
  const selectedShop = useSelector((state) => state.shops.selectedShop);

  // Get payment status and data from Redux
  const { status, paymentData } = useSelector(
    (state) => ({
      status: state.paymentInitiation?.status ?? "idle",
      paymentData: state.paymentInitiation?.paymentData ?? {},
    }),
    shallowEqual
  );

  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (shopId) {
      console.log("✅ Extracted shopId:", shopId);
      dispatch(fetchShopById(shopId));
    } else {
      console.error("❌ shopId is missing");
    }
  }, [dispatch, shopId]);

  const handlePayment = () => {
    if (!shopId) {
      console.error("❌ shopId is missing");
      return;
    }

    if (!token) {
      console.error("❌ User token is missing");
      return;
    }

    dispatch(initiatePayment({ shopId, token }));
  };

  useEffect(() => {
    if (paymentData?.authorization_url) {
      window.open(paymentData.authorization_url, "_blank");
      setPaymentResult({
        status: "success",
        message: "Payment initiated successfully. Complete the payment in the new tab.",
        reference: paymentData.reference,
      });
    }
  }, [paymentData]);

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-black h-[70px] flex items-center justify-center">
          <h1 className="text-xl/[30px] font-normal">
            Purchase <span className="text-lily">Ads</span>
          </h1>
        </div>

        <p className="text-gray-500 text-sm mt-2">STEP 2 OF 2</p>
        <p className="border-b border-black pb-4 font-medium text-black">Payment</p>

        <div className="flex justify-between font-inter font-medium text-sm border p-4 border-black rounded-md">
          <p>Amount (NGN)</p>
          <p>₦5,000</p>
        </div>

        {/* Show selected shop details */}
        {selectedShop && (
          <div className="border p-4 rounded-md bg-gray-100">
            <p className="text-sm text-gray-700">Shop Name: {selectedShop.name}</p>
          </div>
        )}
      </div>

      <button
        onClick={handlePayment}
        disabled={status === "loading"}
        className="w-full py-3 font-medium font-inter text-base rounded-md transition bg-sun text-black hover:bg-lily hover:text-white"
      >
        {status === "loading" ? "Redirecting..." : "Pay with Paystack"}
      </button>
    
      {paymentResult && (
        <div
          className={`mt-4 p-4 rounded-md ${
            paymentResult.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          <p>{paymentResult.message}</p>
          {paymentResult.reference && <p>Reference: {paymentResult.reference}</p>}
        </div>
      )}
    </section>
  );
};

export default Step2;
