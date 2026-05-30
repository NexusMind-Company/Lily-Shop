import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import VendorLayout from "../components/vendor/VendorLayout";
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
    <VendorLayout
      title="Create Meal Plan"
      showBack={true}
      onBack={handleBackClick}
    >
      <div className="flex flex-col gap-6 w-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Design New Plan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below to create a subscription plan for your
            customers.
          </p>
        </div>

        <MealPlanForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          vendorId={vendorId}
          isEdit={false}
        />
      </div>
    </VendorLayout>
  );
};

export default CreateMealPlanPage;
