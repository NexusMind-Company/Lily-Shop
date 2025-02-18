const Step3 = () => {
  return (
    <section className="min-h-screen p-5 flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
          <h1 className="text-xl/[30px] font-normal font-poppins">
            Purchase <span className="text-lily">Ads</span>
          </h1>
        </div>

        <p className="text-gray-500 text-sm mt-2">STEP 3 OF 3</p>

        <h3 className="font-semibold text-lg">Review your plan details</h3>

        {/* Plan Details */}
        <div className="border p-4 rounded-lg">
          <p className="font-semibold">PLAN TERMS</p>
          <p className="text-gray-600">
            Term: <span className="font-bold">1 Month</span>
          </p>
          <p className="text-gray-600">
            Payment: <span className="font-bold">₦10,000</span>
          </p>
          <p className="text-lg font-bold mt-2">Total: ₦11,000</p>
        </div>

        <p className="mt-5 text-sm text-gray-600">
          By confirming, you agree to make your payment.
        </p>
      </div>

      {/* Confirm & Pay Button */}
      <button className="w-full bg-sun text-white py-3 rounded-lg font-medium font-inter text-base">
        Confirm & Pay
      </button>
    </section>
  );
};

export default Step3;
