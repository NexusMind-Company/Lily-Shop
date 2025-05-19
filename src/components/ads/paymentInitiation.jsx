import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { initiatePayment } from "../../redux/adsSlice";

const PaymentInitiation = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { shop_id } = useParams();
  const { paymentStatus, paymentError, paymentData } = useSelector(
    (state) => state.ads
  );

  useEffect(() => {
    if (!shop_id) {
      alert("You don't have a shop yet! Please create a shop first.");
      navigate("/myShop");
    }
  }, [shop_id, navigate]);

  useEffect(() => {
    if (paymentStatus === "succeeded" && paymentData?.authorization_url) {
      window.location.href = paymentData.authorization_url;
    } else if (paymentStatus === "failed") {
      alert(
        JSON.stringify(paymentError) ||
          "Failed to initiate payment. Please try later."
      );
      setIsProcessing(false);
    }
  }, [paymentStatus, paymentData, paymentError]);

  const handlePayment = async () => {
    if (!shop_id) return;
    setIsProcessing(true);
    dispatch(initiatePayment({ shop_id: String(shop_id), amount: 5000 }));
  };

  return (
    <section className="mt-28 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-black h-[70px] flex items-center justify-center">
          <h1 className="text-xl/[30px] font-normal">
            Purchase <span className="text-lily">Ads</span>
          </h1>
        </div>

        <p className="text-gray-500 text-sm mt-2">STEP 2 OF 2</p>
        <p className="border-b border-black pb-4 font-medium text-black">
          Payment
        </p>

        <div className="flex justify-between font-inter font-medium text-sm border p-4 border-black rounded-md">
          <p>Amount (NGN)</p>
          <p>₦5,000</p>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full py-3 font-medium font-inter text-base rounded-md transition hover:bg-lily hover:text-white cursor-pointer ${
          isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-sun text-black hover:bg-opacity-90"
        }`}
      >
        {isProcessing ? "Processing..." : "Pay with Paystack"}
      </button>
    </section>
  );
};

export default PaymentInitiation;
