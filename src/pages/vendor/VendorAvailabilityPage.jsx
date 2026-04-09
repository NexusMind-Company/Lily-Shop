// VendorAvailabilityPage.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Save } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError, getErrorMessage } from "../../components/vendor/VendorErrorStates";
import { fetchAvailability, updateAvailability } from "../../services/vendorDashboardApi";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const TIMES = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

const VendorAvailabilityPage = () => {
  const queryClient = useQueryClient();

  const { data: avail, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["vendorAvailability"],
    queryFn: fetchAvailability,
  });

  const [workingDays, setWorkingDays] = useState([]);
  const [deliveryTimes, setDeliveryTimes] = useState([]);
  const [maxMeals, setMaxMeals] = useState(50);

  // Sync state when data loads
  useEffect(() => {
    if (avail) {
      setWorkingDays(avail.working_days ?? []);
      setDeliveryTimes(avail.delivery_times ?? []);
      setMaxMeals(avail.max_meals_per_day ?? 50);
    }
  }, [avail]);

  const toggleDay = (day) => setWorkingDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  const toggleTime = (time) => setDeliveryTimes((prev) => prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateAvailability({ working_days: workingDays, delivery_times: deliveryTimes, max_meals_per_day: maxMeals }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorAvailability"] }); toast.success("Availability updated!"); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading && !avail) return <VendorLayout title="Availability"><VendorPageLoader /></VendorLayout>;
  if (isError && !avail) return <VendorLayout title="Availability"><VendorPageError message={getErrorMessage(error)} onRetry={refetch} /></VendorLayout>;

  return (
    <VendorLayout title="Availability">
      <div className="space-y-5">
        {avail?.is_sold_out && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center">
            <p className="text-red-600 font-bold text-sm">⚠️ SOLD OUT</p>
            <p className="text-red-400 text-xs mt-0.5">Daily meal limit reached</p>
          </div>
        )}

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-[#111813] dark:text-white mb-3">Working Days</h3>
          <div className="grid grid-cols-4 gap-2">
            {DAYS.map((day) => {
              const active = workingDays.includes(day);
              return (
                <button key={day} onClick={() => toggleDay(day)}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all flex flex-col items-center gap-0.5 ${active ? "bg-[#4eb75e] text-white shadow-sm" : "bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700"}`}>
                  {active && <Check size={10} />}
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-[#111813] dark:text-white mb-3">Delivery Time Slots</h3>
          <div className="grid grid-cols-4 gap-2">
            {TIMES.map((time) => {
              const active = deliveryTimes.includes(time);
              return (
                <button key={time} onClick={() => toggleTime(time)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all ${active ? "bg-[#4eb75e] text-white shadow-sm" : "bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700"}`}>
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-[#111813] dark:text-white mb-1">Max Meals Per Day</h3>
          <p className="text-xs text-gray-400 mb-3">Once this limit is reached, your shop shows "SOLD OUT"</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setMaxMeals((n) => Math.max(1, n - 5))}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-lg font-bold text-[#111813] dark:text-white flex items-center justify-center">−</button>
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-[#111813] dark:text-white">{maxMeals}</p>
              <p className="text-xs text-gray-400">meals/day</p>
            </div>
            <button onClick={() => setMaxMeals((n) => n + 5)}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-lg font-bold text-[#111813] dark:text-white flex items-center justify-center">+</button>
          </div>
        </div>

        <button onClick={() => save()} disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#4eb75e] text-white font-bold text-sm hover:bg-[#3da64d] disabled:opacity-60 transition-colors">
          <Save size={16} />
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </VendorLayout>
  );
};

export default VendorAvailabilityPage;