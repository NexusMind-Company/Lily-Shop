import { useState,useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
//  const paystackLink = "https://paystack.com/pay/4pqaf6-w2v";

const Step2 = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const shopId = location.state?.shopId || null;

  useEffect(() => {
    if (!shopId) {
      alert("Shop information is missing! Please start from Step 1.");
      navigate("/step1");
    }
  }, [shopId, navigate]);

  const handlePayment = async () => {
    if (!shopId) return;
    setIsProcessing(true);

    try {
      const response = await fetch(
        "https://forthcoming-rachele-skyreal-emerge-0ca15c0d.koyeb.app/ads/payment/initiate/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shop_id: shopId,
            amount: 5000,
          }),
        }
      );

      const data = await response.json();

      if (data.authorization_url) {
        const paymentWindow = window.open(data.authorization_url, "_blank");

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
      } else {
        alert("Error generating payment link. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      alert("Failed to initiate payment. Please try later.");
      setIsProcessing(false);
    }
  };

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
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

export default Step2;