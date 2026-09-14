import { useQuery } from "@tanstack/react-query";
import { Star, TrendingUp, AlertCircle } from "lucide-react";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
} from "../../components/vendor/VendorErrorStates";
import { getErrorMessage } from "../../utils/errorUtils";
import {
  fetchMealRatings,
  fetchRatingsSummary,
} from "../../services/vendorDashboardApi";
import { ReviewCard } from "../../components/common/ReviewList";

const StarRating = ({ rating, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={
          s <= Math.round(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-200 "
        }
      />
    ))}
  </div>
);

const VendorRatingsPage = () => {
  const {
    data: summary,
    isLoading: sumLoading,
    isError: sumError,
    error: sumErr,
    refetch: refetchSum,
  } = useQuery({
    queryKey: ["ratingsSummary"],
    queryFn: fetchRatingsSummary,
  });

  const {
    data: ratingsData,
    isLoading: ratLoading,
    isError: ratError,
  } = useQuery({
    queryKey: ["mealRatings"],
    queryFn: () => fetchMealRatings(),
  });

  if ((sumLoading && !summary) || (ratLoading && !ratingsData)) {
    return (
      <VendorLayout title="Ratings & Feedback">
        <VendorPageLoader />
      </VendorLayout>
    );
  }
  if (sumError && !summary) {
    return (
      <VendorLayout title="Ratings & Feedback">
        <VendorPageError
          message={getErrorMessage(sumErr)}
          onRetry={refetchSum}
        />
      </VendorLayout>
    );
  }

  const sumData = Array.isArray(summary) ? summary : (summary?.results ?? []);
  const ratings = ratingsData?.results ?? [];
  const avgRating =
    sumData.length > 0
      ? (
          sumData.reduce((s, m) => s + (m.average_rating ?? 0), 0) /
          sumData.length
        ).toFixed(1)
      : "—";

  return (
    <VendorLayout title="Ratings & Feedback">
      <div className="bg-white  rounded-2xl p-5 shadow-sm border border-gray-100  text-center">
        <p className="text-5xl font-bold text-[#111813]  mb-1">{avgRating}</p>
        <StarRating rating={parseFloat(avgRating) || 0} size={18} />
        <p className="text-xs text-gray-400 mt-2">
          Overall rating across all meals
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#111813] ">Meal Performance</h3>
        {sumData.map((meal) => (
          <div
            key={meal.meal_id}
            className={`bg-white  rounded-2xl p-4 shadow-sm border ${(meal.average_rating ?? 0) < 3.5 ? "border-red-100 " : "border-gray-100 "}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 pr-2">
                <p className="text-sm font-bold text-[#111813] ">
                  {meal.meal_name}
                </p>
                <p className="text-xs text-gray-400">
                  {meal.total_reviews} reviews
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-lg font-bold ${(meal.average_rating ?? 0) >= 4 ? "text-lily" : (meal.average_rating ?? 0) >= 3 ? "text-yellow-500" : "text-red-500"}`}
                >
                  {meal.average_rating?.toFixed(1) ?? "—"}
                </p>
                <StarRating rating={meal.average_rating ?? 0} size={11} />
              </div>
            </div>
            {meal.common_removal && (
              <div className="flex items-center gap-1.5 mt-2 bg-orange-50  rounded-xl px-3 py-2">
                <AlertCircle
                  size={12}
                  className="text-orange-500 shrink-0"
                />
                <p className="text-xs text-orange-700 ">
                  Common preference: {meal.common_removal}
                </p>
              </div>
            )}
            {(meal.average_rating ?? 5) < 3.5 && (
              <div className="flex items-center gap-1.5 mt-2 bg-red-50  rounded-xl px-3 py-2">
                <TrendingUp size={12} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600 ">
                  This meal needs improvement. Consider reviewing the recipe.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 ">
          <h3 className="text-sm font-bold text-[#111813] ">Recent Reviews</h3>
        </div>
        {ratError ? (
          <p className="text-xs text-gray-400 text-center py-6">
            Reviews unavailable
          </p>
        ) : !ratings || ratings.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            No reviews yet
          </p>
        ) : (
          ratings.map((r, idx) => (
            <div
              key={r.id}
              className="px-4 py-3 border-b border-gray-50 last:border-0"
            >
              <ReviewCard
                review={{
                  id: r.id,
                  user_name: r.customer_name,
                  rating: r.rating ?? 0,
                  comment: r.review,
                  created_at: r.created_at,
                }}
                isLast={idx === ratings.length - 1}
              />
            </div>
          ))
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorRatingsPage;
