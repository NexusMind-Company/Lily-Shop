import { useNavigate } from "react-router-dom";
import TopAppBar from "../components/manageVendorPlans/TopAppBar";
import MealPlanForm from "../components/manageVendorPlans/MealPlanForm";

/**
 * CreateMealPlanPage component - Page for vendors to create meal plans with food combinations
 */
const CreateMealPlanPage = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSuccess = (plan) => {
    // Navigate back to manage plans page with success message
    navigate("/subscription/manage", {
      state: { message: `Meal plan "${plan.name}" created successfully!` },
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-[#111813] dark:text-white transition-colors duration-200">
      <TopAppBar title="Create Meal Plan" onBackClick={handleBackClick} />

      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col gap-6 p-4 pb-20 max-w-4xl mx-auto w-full">
        <MealPlanForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default CreateMealPlanPage;
