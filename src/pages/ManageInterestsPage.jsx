import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import InterestsSelector from "../components/profile/InterestsSelector";
import PageSEO from "../components/common/PageSEO";

const ManageInterestsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50/40 min-h-screen pb-24">
      <PageSEO />
      {/* Header bar matching settings aesthetic */}
      <div className="bg-white sticky top-0 border-b border-gray-200 px-4 py-3 flex items-center z-30 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <h2 className="font-semibold text-lg flex-1 text-center pr-8 text-gray-800">
          Content Preferences
        </h2>
      </div>

      <main className="mt-2">
        <InterestsSelector mode="settings" onComplete={() => navigate(-1)} />
      </main>
    </div>
  );
};

export default ManageInterestsPage;
