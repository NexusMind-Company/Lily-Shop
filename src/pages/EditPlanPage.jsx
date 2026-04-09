import React from "react";
import { useNavigate } from "react-router-dom";
import TopAppBar from "../components/manageVendorPlans/TopAppBar";
import PlanSelectionCard from "../components/subscription/PlanSelectionCard";
import HelpSection from "../components/subscription/HelpSection";
import { CalendarDays, CalendarRange } from "lucide-react";

/**
 * EditPlanPage component for editing an existing subscription plan.
 * Allows users to modify plan details.
 */
const EditPlanPage = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    // Handle back navigation
    navigate(-1);
  };

  const handleWeeklyEdit = () => {
    // Handle weekly plan edit
    navigate("/vendor/plans?type=weekly&mode=edit");
  };

  const handleMonthlyEdit = () => {
    // Handle monthly plan edit
    navigate("/vendor/plans?type=monthly&mode=edit");
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display antialiased overflow-x-hidden transition-colors duration-300">
      <TopAppBar title="Edit Plan" onBackClick={handleBackClick} />
      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto p-4 md:p-6 pb-24">
        {/* Headline Section */}
        <div className="mb-8 mt-2 animate-fade-in-up">
          <h2 className="text-[#111813] dark:text-white tracking-tight text-[32px] font-extrabold leading-tight mb-2">
            Edit Plan
          </h2>
          <p className="text-[#61896b] dark:text-gray-400 text-base font-normal leading-relaxed">
            Modify your subscription plan details.
          </p>
        </div>
        {/* Selection Cards Container */}
        <div className="flex flex-col gap-5">
          <PlanSelectionCard
            icon={<CalendarRange />}
            badge="Short Term"
            title="Weekly Meal Plan"
            description="Edit your 7-day menu plan."
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuC-Tjy7xd0cR5LT4akA5XfNh7qu17h7sGSTS7U4S-FrskGJgpNBDCkllNKTGEhNy-rOH_NyH_r6y9mKSG-amJ45DBcy8NXARPFd0YajXDBDAwOdk-SiI7uMUQtPA2AwyJgxDLfnyc0eiwntUwZV6hSXKQ2otfud9i9V-Hwguj51Vnn1TdJrHVaJuLHvVeYuTZCguxJil3QTS72211iZdJuuxXIjpKqTNZXpDQ_LqWzmJpdokfXchCkfC9xExo12p6HPIozZ7rPRCew4"
            onClick={handleWeeklyEdit}
          />
          <PlanSelectionCard
            icon={<CalendarDays />}
            badge="Recurring"
            title="Monthly Meal Plan"
            description="Edit your 4-week recurring menu."
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuC0tW_Vj0swJcH8RIkmksm5lRXlqa8tx5AUqzdsj6s-_ezogqG9qSTXdbDptkyXj6EuK5Bw1FPCbcK2bkO8qNSfwKq_JbeEsZuUW41ptgaKkCzgGjs9hRvG2xePMG-obVekOexYF0WY1ywyNNl7i_xhQyZCSadaqcrwj4AuTsY1_98HMahhdEuoIggckL2RFstIKHRvKDV6Ccw88tGJUivNJZ9tb8gbH-Y29shFtBGPiZmAZG5qBI-TadU_xbEYYP22znhYlMOEMzbO"
            onClick={handleMonthlyEdit}
          />
        </div>
        <HelpSection
          message="Need help editing?"
          linkText="View Vendor Guide"
          linkHref="#"
        />
      </main>
      {/* Bottom Action (Optional placeholder if needed in flow, otherwise just spacing) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-[#102215] dark:via-[#102215] h-20 pointer-events-none"></div>
    </div>
  );
};

export default EditPlanPage;
