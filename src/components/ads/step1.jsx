import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const Step1 = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("1-month");
  const [shopId, setShopId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserShop = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You need to log in first.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "https://forthcoming-rachele-skyreal-emerge-0ca15c0d.koyeb.app/shops/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch shop details");

        const data = await response.json();

        if (data.length > 0) {
          setShopId(data[0].id);
          localStorage.setItem("shopId", data[0].id);
        } else {
          alert("You need to create a shop first before purchasing ads.");
          navigate("/create-shop");
        }
      } catch (error) {
        console.error("Error fetching shopId:", error);
        alert("Failed to fetch shop details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserShop();
  }, [navigate]);

  const handleContinue = () => {
    if (!shopId) {
      alert("Shop ID not found. Please create a shop first.");
      return;
    }

    navigate("/step2", { state: { shopId } });
  };

  if (isLoading) {
    return <p>Loading shop details...</p>;
  }

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
          <h1 className="text-xl/[30px] font-normal font-poppins">
            Purchase <span className="text-lily">Ads</span>
          </h1>
        </div>

        <p className="text-gray-500 text-sm mt-2 font-poppins">STEP 1 OF 2</p>

        {/* Plan Selection */}
        <div className="space-y-2 font-poppins">
          <label className="rounded-lg flex items-center cursor-pointer">
            <div className="relative flex items-center mr-3">
              <input
                type="radio"
                name="plan"
                checked={selectedPlan === "1-month"}
                onChange={() => setSelectedPlan("1-month")}
                className="sr-only"
              />
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              {selectedPlan === "1-month" && (
                <div className="absolute w-3 h-3 bg-lily rounded-full left-1 top-1"></div>
              )}
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
          Your shop deserves to be reach by millions of people, with Lily ads
          you will reach millions of potential customers who are actively
          looking for products or services like yours.
        </p>
      </div>

      {/* Continue Button */}
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
