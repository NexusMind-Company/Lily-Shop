import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";

const Step1 = () => {
  const navigate = useNavigate();
  const selectedShop = useSelector((state) => state.shops.selectedShop);

  console.log("🔍 Selected Shop:", selectedShop);

  const handleContinue = () => {
    if (selectedShop && selectedShop.id) {
      navigate(`/step2/${selectedShop.id}`);
    } else {
      console.error("❌ shopId is missing");
    }
  };
  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
          <h1 className="text-xl/[30px] font-normal font-poppins">
            Purchase <span className="text-lily">Ads</span>
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-2 font-poppins">STEP 1 OF 2</p>
        <div className="space-y-2 font-poppins">
          <label className="rounded-lg flex items-center cursor-pointer">
            <div className="relative flex items-center mr-3">
              <input
                type="radio"
                name="plan"
                checked={true}
                readOnly
                className="sr-only"
              />
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              <div className="absolute w-3 h-3 bg-lily rounded-full left-1 top-1"></div>
            </div>
            <p className="font-medium">1-Month Ads Plan for Your Shop</p>
          </label>
        </div>
        <p className="text-xl font-semibold px-4 text-lily">
          <span className="text-black">₦</span> 5,000
        </p>
      </div>
      <div className="bg-lily px-4 p-4 pb-10 text-left w-full font-poppins text-white text-xs font-normal">
        <p>
          Your shop deserves to be reached by millions of people. With Lily ads,
          you will reach millions of potential customers who are actively
          looking for products or services like yours.
        </p>
      </div>
      <button
        onClick={handleContinue}
        className="w-full bg-sun text-black py-3 font-medium font-inter text-base hover:bg-lily hover:text-white cursor-pointer"
      >
        Continue
      </button>
    </section>
  );
};

export default Step1;
