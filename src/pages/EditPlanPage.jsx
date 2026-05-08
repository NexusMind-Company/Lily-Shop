import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import VendorLayout from "../components/vendor/VendorLayout";
import MealPlanForm from "../components/manageVendorPlans/MealPlanForm";

/**
 * EditPlanPage component for editing an existing subscription plan.
 * Uses the standardized MealPlanForm for a consistent full-page experience.
 */
const EditPlanPage = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const location = useLocation();

  // Get vendorId from state or profile
  const { data: profileData } = useSelector((state) => state.profile);
  const vendorId = location.state?.vendorId || profileData?.user?.vendor_id;

  const handleBackClick = () => navigate(-1);

  const handleSuccess = (plan) => {
    navigate("/vendor/plans", {
      state: { message: `Meal plan "${plan.plan_name}" updated successfully!` },
    });
  };

  const handleCancel = () => navigate("/vendor/plans");

  return (
    <VendorLayout
      title="Edit Meal Plan"
      showBack={true}
      onBack={handleBackClick}
    >
      <div className="flex flex-col w-full">
        <div className="mb-8 mt-2 animate-fade-in-up">
          <h1 className="text-black tracking-tight text-3xl font-extrabold leading-tight mb-2">
            Update Plan Details
          </h1>
          <p className="text-black text-base font-normal leading-relaxed">
            Modify the pricing, frequency, and details of your subscription
            plan.
          </p>
        </div>

        <MealPlanForm
          isEdit={true}
          planId={planId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          vendorId={vendorId}
        />
      </div>
    </VendorLayout>
  );
};

export default EditPlanPage;
