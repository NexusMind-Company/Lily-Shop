import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Coffee,
  Wrench,
  Plane,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
  getErrorMessage,
} from "../../components/vendor/VendorErrorStates";
import {
  fetchShopStatus,
  pauseShop,
  resumeShop,
} from "../../services/vendorDashboardApi";

const PAUSE_REASONS = [
  { key: "vacation", label: "Going on Vacation", icon: Plane },
  { key: "maintenance", label: "Kitchen Maintenance", icon: Wrench },
  { key: "low_stock", label: "Low Stock / Supplies", icon: ShoppingBag },
  { key: "rest", label: "Taking a Break", icon: Coffee },
];

const VendorPauseShopPage = () => {
  const queryClient = useQueryClient();
  const [selectedReason, setSelectedReason] = useState(null);
  const [pauseExisting, setPauseExisting] = useState(false);
  const [resumeDate, setResumeDate] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    data: status,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["shopStatus"],
    queryFn: fetchShopStatus,
    staleTime: 1000 * 30,
  });

  const { mutate: pause, isPending: pausing } = useMutation({
    mutationFn: () =>
      pauseShop({
        reason: selectedReason,
        pause_existing_subscriptions: pauseExisting,
        resume_date: resumeDate || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopStatus"] });
      setConfirmOpen(false);
      toast.success(
        "Shop paused. Customers will see 'Temporarily Unavailable'.",
      );
    },
    onError: (err) => {
      setConfirmOpen(false);
      toast.error(getErrorMessage(err));
    },
  });

  const { mutate: resume, isPending: resuming } = useMutation({
    mutationFn: resumeShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopStatus"] });
      toast.success("Welcome back! Your shop is live again 🎉");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading && !status)
    return (
      <VendorLayout title="Pause Shop">
        <VendorPageLoader />
      </VendorLayout>
    );
  if (isError && !status)
    return (
      <VendorLayout title="Pause Shop">
        <VendorPageError message={getErrorMessage(error)} onRetry={refetch} />
      </VendorLayout>
    );

  const isPaused = status?.is_paused ?? false;

  return (
    <VendorLayout title="Pause Shop">
      <div className="space-y-4">
        <div
          className={`rounded-2xl p-5 text-center ${isPaused ? "bg-red-50  border border-red-100 " : "bg-[#4eb75e]/10 border border-[#4eb75e]/20"}`}
        >
          <div
            className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${isPaused ? "bg-red-100 " : "bg-[#4eb75e]/20"}`}
          >
            {isPaused ? (
              <PauseCircle size={28} className="text-red-500" />
            ) : (
              <PlayCircle size={28} className="text-[#4eb75e]" />
            )}
          </div>
          <p
            className={`text-lg font-bold ${isPaused ? "text-red-600 " : "text-[#4eb75e]"}`}
          >
            {isPaused ? "Shop Paused" : "Shop is Live"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isPaused
              ? "New subscriptions are paused. Shop shows 'Temporarily Unavailable'."
              : "Customers can discover and subscribe to your meal plans."}
          </p>
          {isPaused && status?.pause_reason && (
            <p className="text-xs font-medium text-red-500 mt-2">
              Reason:{" "}
              {PAUSE_REASONS.find((r) => r.key === status.pause_reason)
                ?.label ?? status.pause_reason}
            </p>
          )}
        </div>

        {isPaused ? (
          <div className="bg-white  rounded-2xl p-5 shadow-sm border border-gray-100 ">
            <h3 className="text-sm font-bold text-[#111813]  mb-2">
              Ready to Resume?
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Resuming your shop will allow new customers to subscribe again.
            </p>
            <button
              onClick={() => resume()}
              disabled={resuming}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#4eb75e] text-white font-bold text-sm hover:bg-[#3da64d] disabled:opacity-60 transition-colors"
            >
              <PlayCircle size={16} />
              {resuming ? "Resuming..." : "Resume Shop"}
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100 ">
              <h3 className="text-sm font-bold text-[#111813]  mb-3">
                Reason for Pausing
              </h3>
              <div className="space-y-2">
                {PAUSE_REASONS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedReason(key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${selectedReason === key ? "border-[#4eb75e] bg-[#4eb75e]/10 text-[#4eb75e]" : "border-gray-100  text-gray-600 "}`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-bold text-[#111813] ">
                    Pause existing subscriptions?
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    If off, current subscribers continue receiving deliveries
                  </p>
                </div>
                <button
                  onClick={() => setPauseExisting(!pauseExisting)}
                  className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${pauseExisting ? "bg-[#4eb75e]" : "bg-gray-200 "}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${pauseExisting ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Expected Return Date (optional)
                </label>
                <input
                  type="date"
                  value={resumeDate}
                  onChange={(e) => setResumeDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-[#4eb75e]"
                />
              </div>
            </div>

            <div className="flex gap-3 bg-orange-50  border border-orange-100  rounded-2xl px-4 py-3">
              <AlertTriangle
                size={15}
                className="text-orange-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-orange-700 ">
                Pausing stops new subscriptions immediately. Customers will see
                "Temporarily Unavailable".
              </p>
            </div>

            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!selectedReason}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${selectedReason ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-100  text-gray-400 cursor-not-allowed"}`}
            >
              <PauseCircle size={16} />
              Pause Shop
            </button>
          </>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative bg-white  rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <PauseCircle size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-[#111813] ">Pause your shop?</h3>
              <p className="text-xs text-gray-500 mt-1">
                This will stop all new subscriptions immediately.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-100  text-sm font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => pause()}
                disabled={pausing}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {pausing ? "Pausing..." : "Yes, Pause"}
              </button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
};

export default VendorPauseShopPage;
