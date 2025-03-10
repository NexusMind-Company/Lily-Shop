const Step2 = () => {
  // Your Paystack payment link
  const paystackLink = "https://paystack.com/pay/4pqaf6-w2v";

  const handlePayment = () => {
    // Option 1: Navigate user to payment page in same window
    window.location.href = paystackLink;

    // OR Option 2: Open payment page in new tab
    // window.open(paystackLink, "_blank");
  };

  return (
    <section className="mt-10 pb-24 p-5 flex flex-col gap-7 justify-evenly">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
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
          <p>5000</p>
        </div>
      </div>

      {/* Paystack Payment Button */}
      <button
        onClick={handlePayment}
        className="w-full bg-sun text-black py-3 font-medium font-inter text-base"
      >
        Pay with Paystack
      </button>
    </section>
  );
};

export default Step2;
