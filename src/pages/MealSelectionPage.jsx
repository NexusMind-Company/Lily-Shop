import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import MealSelectionHeader from "../components/subscription/MealSelectionHeader";
import ProgressBar from "../components/subscription/ProgressBar";
import PlanRecapCard from "../components/subscription/PlanRecapCard";
import MealItem from "../components/subscription/MealItem";
import PaymentSummary from "../components/subscription/PaymentSummary";
import PaymentButton from "../components/subscription/PaymentButton";
import SuccessModal from "../components/subscription/SuccessModal";
import {
  fetchAvailableMeals,
  fetchMealPlans,
} from "../services/subscriptionApi";

/**
 * MealSelectionPage component for customizing meal selection and payment
 */
const MealSelectionPage = () => {
  const navigate = useNavigate();
  const { subscriptionId } = useParams(); // Assuming subscriptionId from URL params

  const [selectedMeals, setSelectedMeals] = useState(
    new Set(["meal1", "meal2", "meal3"])
  ); // Mock selected meals
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Mock current plan data
  const currentPlan = {
    id: "plan1",
    name: "Weekly Standard",
    image: "https://via.placeholder.com/80",
    mealsPerWeek: 5,
    price: 15000,
  };

  const totalRequired = 5; // Meals required for the plan
  const selectedCount = selectedMeals.size;

  // Fetch available meals
  const {
    data: meals,
    isLoading: mealsLoading,
    error: mealsError,
  } = useQuery({
    queryKey: ["availableMeals", "vendor1"], // Mock vendor ID
    queryFn: () => fetchAvailableMeals("vendor1"),
    enabled: true,
  });

  // Mock meals data if API not available
  const mockMeals = [
    {
      id: "meal1",
      name: "Grilled Chicken & Quinoa",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAJoUaq6i0Th5NUo4J1_izN2WaAkLSvXOykYiCR-GKKtD79Ej326ALj9OWWf0c47_ireEB8TLvrbe9BGaNh8nkLwXkGwHLY_ieMvljhG0aZTJ6VUvVFRxDAghVQd33aPE4pU0R7vdTdr0O-SZIJyhFyQheU6tmnuVKf334tVZVDM-WiXhGgBTDotJA0XfogzfFyENEvPf8eEbqWIdpnKpl1iHyxw4K65CngfgdyvguXXR8uH-cJWyF0EPO5yLQFxV3Zw2K41cGP40uU",
      tags: [
        { label: "High Protein", type: "protein" },
        { label: "450 kcal", type: "calories" },
      ],
      calories: 450,
    },
    {
      id: "meal2",
      name: "Spicy Salmon Wrap",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDUYY8O8bTiw3lXg3B3B0QwWz5kUCYyZ0fZN89IgnBIUozb7MCcSLFfwBH9T13Z6jsDo49SPDR6fmwJA3vd0rsuI3kpKrni7-K9KJaoVUhElFy1c0MwA5xfRBLj0H47jVj0ui6enZvZqwXz0Lp27zdLMz9KHkr8sA4bCR63wjSAp5z6e-1Zv2SXL6ecAEG7pRpom0M2wvbDL5atGkhXZX5BQlFUlMIFzL7HneoDQ4otmeTiIcxL9oGFNY5p3eZH9CtScM01bwi2LR3B",
      tags: [
        { label: "Omega 3", type: "omega" },
        { label: "380 kcal", type: "calories" },
      ],
      calories: 380,
    },
    {
      id: "meal3",
      name: "Beef Stir Fry",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDuEFH5LwlkdMArVKzN1AweH90fOq2kpuBRyuiumulfQL1sTgcz5roP-UNyq0b2h225CJewwgVm4llypoW_l5wq_DVH8FulN45I9M40nbDviNhaJNihgofs53EVchLPUsrBDHf0YLGCAzTCynZrtkVUvg1OLJLKDlemohN8ew209vadqHihgofs53EVchLPUsrBDHf0YLGCAzTCynZrtkVUvg1OLJLKDlemohN8ew209vadqHihJkeZskhjpE5H1nir5AjXUkFeYu5-KPk-3YO0RnmMSuj8BGv6EC-TIzHLJxLJN7yzVCIZkbzYICeiGnb9T89V8pyLK4zq",
      tags: [
        { label: "High Iron", type: "iron" },
        { label: "520 kcal", type: "calories" },
      ],
      calories: 520,
    },
    {
      id: "meal4",
      name: "Vegan Buddha Bowl",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAW87SobL9NBfGPnh-ZOZCZ379O_Wf5BkkUwyrBCgHsNbfXZYSz2q2665IH4i9Yxh_yktOd0eX9QQiKWVORydCZngbsd7LgoNc4UW0xjo93wSdoRwI53hKxN72WTQDJJtBgPBTXkZVB1SmlZQTYpYdNqvDImm-i5_xh1IBRnVf5fjwlxKJI5CfeLi0H1UR-bF20opYlht-xcQ39AfFt2QAby8Z6A8GYCGnWH3STdWBy85oExKlhFPQL6KEPCFvIk0T5cQbVuhafSuH9",
      tags: [
        { label: "Plant Based", type: "plant" },
        { label: "320 kcal", type: "calories" },
      ],
      calories: 320,
    },
    {
      id: "meal5",
      name: "Tomato Basil Pasta",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC4xnA72rQR33wqpyRzV227oeQt1Wxd4why2af5A3YelcOB8FttYyBllrh2xf8t-hjLw3X7SMwVS_t8-0oZgf8tj1bXOFd-7TqYVOx8o0R5yY7di7dTgFjPF2pXtPEGh0y4OrpWAqRSRd1lponGn71650kKLXZREQ6q-xDsPKgx3gBmqsEokXHUL98zaSib_4AG97rigtMS42xbpraKmcbNqkQRLj0cWWgMXTs27Xh-N00VvBFCzf47gbNkHQ4-VbjtgWI7SR7HYFUV",
      tags: [
        { label: "Carb Loading", type: "carb" },
        { label: "480 kcal", type: "calories" },
      ],
      calories: 480,
    },
  ];

  const displayMeals = meals || mockMeals;

  // Event handlers
  const handleBack = () => {
    navigate(-1);
  };

  const handleFilter = () => {
    // Handle filter action
    console.log("Filter clicked");
  };

  const handleChangePlan = () => {
    // Navigate to plan selection
    navigate("/vendor/1/subscribe");
  };

  const handleMealToggle = (mealId) => {
    const newSelected = new Set(selectedMeals);
    if (newSelected.has(mealId)) {
      newSelected.delete(mealId);
    } else {
      newSelected.add(mealId);
    }
    setSelectedMeals(newSelected);
  };

  const handlePayment = async () => {
    if (selectedCount < totalRequired) {
      alert(`Please select ${totalRequired - selectedCount} more meal(s)`);
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Here you would implement the actual payment logic
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Show success modal
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleFinalizeDelivery = () => {
    // Navigate to delivery setup
    navigate("/delivery-setup");
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  // Calculate payment amounts
  const subtotal = 13500; // Mock subtotal
  const deliveryFee = 1500; // Mock delivery fee
  const total = subtotal + deliveryFee;

  // Loading state
  if (mealsLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-text-main-light dark:text-text-main-dark">
          Loading meals...
        </div>
      </div>
    );
  }

  // Error state
  if (mealsError) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Error loading meals. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
      <MealSelectionHeader onBack={handleBack} />

      <ProgressBar
        selectedCount={selectedCount}
        totalRequired={totalRequired}
      />

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 px-4 pt-4 flex flex-col gap-6">
        <PlanRecapCard plan={currentPlan} onChange={handleChangePlan} />

        <div className="flex items-center justify-between">
          <h2 className="text-text-main dark:text-white text-xl font-bold">
            Available Menu
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="p-1 rounded text-text-muted hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                filter_list
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {displayMeals.map((meal) => (
            <MealItem
              key={meal.id}
              meal={meal}
              isSelected={selectedMeals.has(meal.id)}
              onToggle={handleMealToggle}
            />
          ))}
        </div>

        <PaymentSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
        />
      </main>

      <PaymentButton
        amount={total}
        onPayment={handlePayment}
        disabled={selectedCount < totalRequired || isProcessingPayment}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        onFinalizeDelivery={handleFinalizeDelivery}
      />
    </div>
  );
};

export default MealSelectionPage;
