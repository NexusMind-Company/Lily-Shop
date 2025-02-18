import { useNavigate } from "react-router";

const Step2 = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen p-5 flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
          <h1 className="text-xl/[30px] font-normal font-poppins">
            Purchase <span className="text-lily">Ads</span>
          </h1>
        </div>

        <p className="text-gray-500 text-sm mt-2">STEP 2 OF 3</p>

        <h3 className="font-semibold text-lg">Payment Method</h3>
        <p className="text-sm text-gray-600">Pay with Debit or Credit Card</p>

        {/* Payment Form */}
        <form className="mt-5 space-y-4">
          <input
            type="text"
            placeholder="Card Number"
            className="w-full border p-3 rounded-lg"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="MM"
              className="w-1/3 border p-3 rounded-lg"
            />
            <input
              type="text"
              placeholder="YY"
              className="w-1/3 border p-3 rounded-lg"
            />
            <input
              type="text"
              placeholder="CVC"
              className="w-1/3 border p-3 rounded-lg"
            />
          </div>
        </form>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => navigate("/step3")}
        className="w-full bg-sun text-white py-3 rounded-lg font-medium font-inter text-base"
      >
        Continue
      </button>
    </section>
  );
};

export default Step2;
