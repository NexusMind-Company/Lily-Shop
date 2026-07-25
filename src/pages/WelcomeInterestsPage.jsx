import React from "react";
import { useNavigate, Link } from "react-router-dom";
import InterestsSelector from "../components/profile/InterestsSelector";
import PageSEO from "../components/common/PageSEO";

const WelcomeInterestsPage = () => {
  const navigate = useNavigate();

  const handleFinish = () => {
    // Record that the user has completed onboarding for interests
    localStorage.setItem("onboarded_interests", "true");
    const userStr = localStorage.getItem("user_data");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && (user.id || user.email || user.username)) {
          localStorage.setItem(`onboarded_interests_${user.id || user.email || user.username}`, "true");
        }
      } catch (e) {
        console.warn("Could not save onboarding user flag", e);
      }
    }
    navigate("/");
  };

  return (
    <section className="min-h-screen bg-gray-50/50 flex flex-col relative pb-20">
      <PageSEO />
      {/* Top Brand Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-4 z-40 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <h1 className="font-bold font-poppins text-xl sm:text-2xl text-lily uppercase tracking-wider">
            Lily Shops
          </h1>
        </Link>
        <button
          onClick={handleFinish}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Skip to Feed
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center py-6">
        <InterestsSelector
          mode="onboarding"
          onComplete={handleFinish}
          onSkip={handleFinish}
        />
      </main>
    </section>
  );
};

export default WelcomeInterestsPage;
