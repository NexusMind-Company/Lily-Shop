import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { toast } from "react-hot-toast";
import VendorLayout from "../components/vendor/VendorLayout";
import PlanSelectionCard from "../components/subscription/PlanSelectionCard";
import HelpSection from "../components/subscription/HelpSection";
import { CalendarDays, CalendarRange } from "lucide-react";

/**
 * CreateSubscriptionPlanPage component for creating a new subscription plan.
 * Allows users to choose between weekly and monthly plans.
 */
const CreateSubscriptionPlanPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleBackClick = () => {
    // Handle back navigation
    navigate(-1);
  };

  const handleWeeklySelect = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData(); // ✅ FIX: send as multipart
      formData.append("plan_name", "Weekly Meal Plan");
      formData.append("price", "0.00"); // Required field, will be updated later

      await api.post("/foods/subscriptions/create/", formData);

      // Invalidate queries to trigger refresh
      queryClient.invalidateQueries({ queryKey: ["vendorPlans"] });
      queryClient.invalidateQueries({ queryKey: ["vendorStats"] });

      toast.success("Weekly plan created!");
      navigate("/vendor/plans?type=weekly");
    } catch (error) {
      console.error("Error creating weekly plan:", error);
      toast.error("Failed to create plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlySelect = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData(); // ✅ FIX: send as multipart
      formData.append("plan_name", "Monthly Meal Plan");
      formData.append("price", "0.00"); // Required field, will be updated later

      await api.post("/foods/subscriptions/create/", formData);

      // Invalidate queries to trigger refresh
      queryClient.invalidateQueries({ queryKey: ["vendorPlans"] });
      queryClient.invalidateQueries({ queryKey: ["vendorStats"] });

      toast.success("Monthly plan created!");
      navigate("/vendor/plans?type=monthly");
    } catch (error) {
      console.error("Error creating monthly plan:", error);
      toast.error("Failed to create plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout
      title="Create Subscription"
      showBack={true}
      onBack={handleBackClick}
    >
      <div className="flex flex-col w-full">
        {/* Headline Section */}
        <div className="mb-8 mt-2 animate-fade-in-up">
          <h2 className="text-[#111813] tracking-tight text-[32px] font-extrabold leading-tight mb-2">
            Create New Plan
          </h2>
          <p className="text-[#61896b] text-base font-normal leading-relaxed">
            Choose a subscription type to get started. You can customize the
            details in the next step.
          </p>
        </div>
        {/* Selection Cards Container */}
        <div className="flex flex-col gap-5">
          <PlanSelectionCard
            icon={<CalendarRange />}
            badge="Short Term"
            title="Weekly Meal Plan"
            description="Create a menu for 7 days. Best for flexible menus and trying new items."
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuC-Tjy7xd0cR5LT4akA5XfNh7qu17h7sGSTS7U4S-FrskGJgpNBDCkllNKTGEhNy-rOH_NyH_r6y9mKSG-amJ45DBcy8NXARPFd0YajXDBDAwOdk-SiI7uMUQtPA2AwyJgxDLfnyc0eiwntUwZV6hSXKQ2otfud9i9V-Hwguj51Vnn1TdJrHVaJuLHvVeYuTZCguxJil3QTS72211iZdJuuxXIjpKqTNZXpDQ_LqWzmJpdokfXchCkfC9xExo12p6HPIozZ7rPRCew4"
            onClick={handleWeeklySelect}
          />
          <PlanSelectionCard
            icon={<CalendarDays />}
            badge="Recurring"
            title="Monthly Meal Plan"
            description="Set a recurring menu for 4 weeks. Ideal for loyal customers and stability."
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuC0tW_Vj0swJcH8RIkmksm5lRXlqa8tx5AUqzdsj6s-_ezogqG9qSTXdbDptkyXj6EuK5Bw1FPCbcK2bkO8qNSfwKq_JbeEsZuUW41ptgaKkCzgGjs9hRvG2xePMG-obVekOexYF0WY1ywyNNl7i_xhQyZCSadaqcrwj4AuTsY1_98HMahhdEuoIggckL2RFstIKHRvKDV6Ccw88tGJUivNJZ9tb8gbH-Y29shFtBGPiZmAZG5qBI-TadU_xbEYYP22znhYlMOEMzbO"
            onClick={handleMonthlySelect}
          />
        </div>
        <HelpSection
          message="Need help deciding?"
          linkText="View Vendor Guide"
          linkHref="#"
        />
      </div>
    </VendorLayout>
  );
};

export default CreateSubscriptionPlanPage;
