import { useState } from "react";
import { useNavigate } from "react-router";

const Step1 = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("1-month");

  return (
    <section className="min-h-screen p-5 flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
          <h1 className="text-xl/[30px] font-normal font-poppins">
            Purchase <span className="text-lily">Ads</span>
          </h1>
        </div>

        <p className="text-gray-500 text-sm mt-2">STEP 1 OF 3</p>

        {/* Plan Selection */}
        <div className=" space-y-4">
          <label className="border p-4 rounded-lg flex items-center cursor-pointer">
            <input
              type="radio"
              name="plan"
              checked={selectedPlan === "1-month"}
              onChange={() => setSelectedPlan("1-month")}
              className="mr-3"
            />
            <div>
              <p className="font-bold">1-Month Ads Plan</p>
              <p className="text-lg font-semibold">₦10,000</p>
            </div>
          </label>

          <label className="border p-4 rounded-lg flex items-center cursor-pointer">
            <input
              type="radio"
              name="plan"
              checked={selectedPlan === "1-year"}
              onChange={() => setSelectedPlan("1-year")}
              className="mr-3"
            />
            <div>
              <p className="font-bold">1-Year Ads Plan</p>
              <p className="text-lg font-semibold">₦100,000</p>
            </div>
          </label>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => navigate("/step2")}
        className="w-full bg-sun text-white py-3 rounded-lg font-medium font-inter text-base"
      >
        Continue
      </button>
    </section>
  );
};

export default Step1;
