import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Step2 = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

   const paystackLink = "https://paystack.com/pay/4pqaf6-w2v";

  const handlePayment = () => {
    setIsProcessing(true);

    const paymentWindow = window.open(paystackLink, "_blank");

    if (!paymentWindow) {
      alert("Popup blocked! Please allow popups for this site.");
      setIsProcessing(false);
      return;
    }

    // Check if user closed the Paystack tab, then redirect
    const checkPaymentStatus = setInterval(() => {
      if (paymentWindow.closed) {
        clearInterval(checkPaymentStatus);
        setIsProcessing(false);
        navigate("/createAdsForm");
      }
    }, 2000);
  };

  return (
    <section className="mt-10 flex flex-col gap-7 px-7 min-h-screen max-w-3xl mx-auto">
      {/* Header */}
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

        <div
          className="flex justify-between font-inter font-medium text-sm border p-4 border-black rounded-md"
          aria-label="Payment amount for ads"
        >
          <p>Amount (NGN)</p>
          <p>₦5,000</p>
        </div>
      </div>

      {/* Paystack Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full py-3 font-medium font-inter text-base rounded-md transition ${
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

export default Step2;
