import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import TopAppBar from "../components/manageVendorPlans/TopAppBar";
import MealPlanForm from "../components/manageVendorPlans/MealPlanForm";

/**
 * Page wrapper for creating a new meal plan using the standardized MealPlanForm.
 */
const CreateMealPlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get vendorId from state or profile
  const { data: profileData } = useSelector((state) => state.profile);
  const vendorId = location.state?.vendorId || profileData?.user?.vendor_id;

  const handleBackClick = () => navigate(-1);
  
  const handleSuccess = (plan) => {
    navigate("/vendor/plans", {
      state: { message: `Meal plan "${plan.name}" created successfully!` },
    });
  };

  const handleCancel = () => navigate("/vendor/plans");

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-[#111813] dark:text-white transition-colors duration-200">
      <TopAppBar title="Create Meal Plan" onBackClick={handleBackClick} />
      
      <div className="flex-1 flex flex-col gap-6 p-4 pb-20 max-w-4xl mx-auto w-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Design New Plan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below to create a subscription plan for your customers.
          </p>
        </div>

        <MealPlanForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          vendorId={vendorId}
          isEdit={false}
        />
      </div>
    </div>
  );
};

export default CreateMealPlanPage;
