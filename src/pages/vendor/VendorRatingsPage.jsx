import { useQuery } from "@tanstack/react-query";
import { Star, TrendingUp, AlertCircle } from "lucide-react";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError, getErrorMessage } from "../../components/vendor/VendorErrorStates";
import { fetchMealRatings, fetchRatingsSummary } from "../../services/vendorDashboardApi";

const mockSummary = [
  { meal_id: "M001", meal_name: "Jollof Rice + Chicken", average_rating: 4.5, total_reviews: 32, common_removal: "No onions (80%)" },
  { meal_id: "M002", meal_name: "Egusi Soup + Pounded Yam", average_rating: 4.8, total_reviews: 28, common_removal: null },
  { meal_id: "M003", meal_name: "Fried Rice + Chicken", average_rating: 3.2, total_reviews: 15, common_removal: "No pepper (60%)" },
];
const mockRatings = {
  results: [
    { id: "R001", meal_name: "Jollof Rice + Chicken", rating: 5, review: "Absolutely delicious! Best jollof I've had.", customer_name: "Amaka Obi", created_at: "2024-01-15" },
    { id: "R002", meal_name: "Egusi Soup + Pounded Yam", rating: 4, review: "Great taste but could use more protein.", customer_name: "Chukwudi Eze", created_at: "2024-01-14" },
    { id: "R003", meal_name: "Fried Rice + Chicken", rating: 3, review: "Rice was a bit hard today.", customer_name: "Fatima Bello", created_at: "2024-01-13" },
  ],
};

const StarRating = ({ rating, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size} className={s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-gray-700"} />
    ))}
  </div>
);

const VendorRatingsPage = () => {
  const {
    data: summary, isLoading: sumLoading, isError: sumError, error: sumErr, refetch: refetchSum,
  } = useQuery({
    queryKey: ["ratingsSummary"],
    queryFn: fetchRatingsSummary,
    placeholderData: mockSummary,
    retry: 2,
  });

  const {
    data: ratingsData, isLoading: ratLoading, isError: ratError,
  } = useQuery({
    queryKey: ["mealRatings"],
    queryFn: fetchMealRatings,
    placeholderData: mockRatings,
    retry: 1,
  });

  if ((sumLoading && !summary) || (ratLoading && !ratingsData)) {
    return <VendorLayout title="Ratings & Feedback"><VendorPageLoader /></VendorLayout>;
  }
  if (sumError && !summary) {
    return <VendorLayout title="Ratings & Feedback"><VendorPageError message={getErrorMessage(sumErr)} onRetry={refetchSum} /></VendorLayout>;
  }

  const sumData = summary ?? mockSummary;
  const ratings = ratingsData?.results ?? [];
  const avgRating = sumData.length > 0
    ? (sumData.reduce((s, m) => s + (m.average_rating ?? 0), 0) / sumData.length).toFixed(1)
    : "—";

  return (
    <VendorLayout title="Ratings & Feedback">
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
        <p className="text-5xl font-bold text-[#111813] dark:text-white mb-1">{avgRating}</p>
        <StarRating rating={parseFloat(avgRating) || 0} size={18} />
        <p className="text-xs text-gray-400 mt-2">Overall rating across all meals</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#111813] dark:text-white">Meal Performance</h3>
        {sumData.map((meal) => (
          <div key={meal.meal_id} className={`bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border ${(meal.average_rating ?? 0) < 3.5 ? "border-red-100 dark:border-red-900/50" : "border-gray-100 dark:border-gray-800"}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 pr-2">
                <p className="text-sm font-bold text-[#111813] dark:text-white">{meal.meal_name}</p>
                <p className="text-xs text-gray-400">{meal.total_reviews} reviews</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${(meal.average_rating ?? 0) >= 4 ? "text-[#4eb75e]" : (meal.average_rating ?? 0) >= 3 ? "text-yellow-500" : "text-red-500"}`}>
                  {meal.average_rating?.toFixed(1) ?? "—"}
                </p>
                <StarRating rating={meal.average_rating ?? 0} size={11} />
              </div>
            </div>
            {meal.common_removal && (
              <div className="flex items-center gap-1.5 mt-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl px-3 py-2">
                <AlertCircle size={12} className="text-orange-500 flex-shrink-0" />
                <p className="text-xs text-orange-700 dark:text-orange-400">Common preference: {meal.common_removal}</p>
              </div>
            )}
            {(meal.average_rating ?? 5) < 3.5 && (
              <div className="flex items-center gap-1.5 mt-2 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
                <TrendingUp size={12} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400">This meal needs improvement. Consider reviewing the recipe.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
          <h3 className="text-sm font-bold text-[#111813] dark:text-white">Recent Reviews</h3>
        </div>
        {ratError ? (
          <p className="text-xs text-gray-400 text-center py-6">Reviews unavailable</p>
        ) : ratings.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No reviews yet</p>
        ) : (
          ratings.map((r) => (
            <div key={r.id} className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-[#111813] dark:text-white">{r.customer_name}</p>
                <StarRating rating={r.rating ?? 0} size={11} />
              </div>
              <p className="text-xs text-gray-400 mb-1">{r.meal_name}</p>
              {r.review && <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{r.review}"</p>}
              <p className="text-[10px] text-gray-400 mt-1">{r.created_at}</p>
            </div>
          ))
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorRatingsPage;