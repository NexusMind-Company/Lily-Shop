import { useState } from "react";
import { useNavigate } from "react-router";

const Step1 = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("1-month");

  return (
    <section className="mt-10 pb-24 p-5 flex flex-col gap-7 justify-evenly">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
          <h1 className="text-xl/[30px] font-normal font-poppins">
            Purchase <span className="text-lily">Ads</span>
          </h1>
        </div>

        <p className="text-gray-500 text-sm mt-2 font-poppins">STEP 1 OF 2</p>

        {/* Plan Selection with Custom Radio Button */}
        <div className="space-y-2 font-poppins">
          <label className="rounded-lg flex items-center cursor-pointer">
            <div className="relative flex items-center mr-3">
              <input
                type="radio"
                name="plan"
                checked={selectedPlan === "1-month"}
                onChange={() => setSelectedPlan("1-month")}
                className="sr-only" // Hide the actual input
              />
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              {selectedPlan === "1-month" && (
                <div className="absolute w-3 h-3 bg-lily rounded-full left-1 top-1"></div>
              )}
            </div>
            <div>
              <p className="font-medium">1-Month Ads Plan for Your Shop</p>
            </div>
          </label>
        </div>
        <p className="text-xl font-semibold px-4 text-lily">
          <span className="text-black">₦</span> 5,000
        </p>
      </div>

      <div className="bg-lily px-4 p-4 pb-10 text-left w-full font-poppins text-white text-xs font-normal">
        <p>
          Your shop deserves to be reach by millions of people, with Lily ads
          you will reach millions of potential customers you are actively
          looking for product or services of yours.
        </p>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => navigate("/step2")}
        className="w-full bg-sun text-black py-3 font-medium font-inter text-base"
      >
        Continue
      </button>
    </section>
  );
};

export default Step1;
