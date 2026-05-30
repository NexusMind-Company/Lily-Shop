import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UserMinus, Gift, Clock, X } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
  getErrorMessage,
} from "../../components/vendor/VendorErrorStates";
import {
  fetchChurnedCustomers,
  sendWinbackOffer,
} from "../../services/vendorDashboardApi";

const DiscountModal = ({ customer, onSend, onClose, isSending }) => {
  const [discount, setDiscount] = useState(10);
  const [msg, setMsg] = useState(
    `Hey ${customer.customer_name?.split(" ")[0] ?? "there"}, we miss you! Come back with a special discount just for you 💚`,
  );

  const handleSend = () => {
    if (!msg.trim()) {
      toast.error("Please write a message.");
      return;
    }
    onSend({
      discount_percentage: discount,
      message: msg.trim(),
      expiry_days: 7,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white  rounded-t-3xl p-5 pb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#111813] ">Win-back Offer</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 "
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="bg-gray-50  rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#4eb75e]/10 flex items-center justify-center text-sm font-bold text-[#4eb75e]">
            {customer.customer_name?.charAt(0) ?? "?"}
          </div>
          <div>
            <p className="text-sm font-bold text-[#111813] ">
              {customer.customer_name}
            </p>
            <p className="text-xs text-gray-400">
              Left {customer.days_since_cancel} days ago
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">
              Discount Amount
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20, 25].map((d) => (
                <button
                  key={d}
                  onClick={() => setDiscount(d)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${discount === d ? "bg-[#4eb75e] text-white" : "bg-gray-100  text-gray-500"}`}
                >
                  {d}%
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Personal Message
            </label>
            <textarea
              rows={3}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-100  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-[#4eb75e] resize-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="w-full py-3.5 rounded-xl bg-[#4eb75e] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#3da64d] disabled:opacity-60 transition-colors"
          >
            <Gift size={15} />
            {isSending ? "Sending..." : `Send ${discount}% Discount Offer`}
          </button>
        </div>
      </div>
    </div>
  );
};

const VendorChurnPage = () => {
  const [period, setPeriod] = useState("this_month");
  const [offerTarget, setOfferTarget] = useState(null);

  const {
    data: churnData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["churnedCustomers", period],
    queryFn: () => fetchChurnedCustomers({ period }),
  });

  const { mutate: sendOffer, isPending: sendingOffer } = useMutation({
    mutationFn: ({ customerId, offerData }) =>
      sendWinbackOffer(customerId, offerData),
    onSuccess: () => {
      setOfferTarget(null);
      toast.success("Win-back offer sent! 🎉");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading && !churnData)
    return (
      <VendorLayout title="Churn Tracking">
        <VendorPageLoader />
      </VendorLayout>
    );
  if (isError && !churnData)
    return (
      <VendorLayout title="Churn Tracking">
        <VendorPageError message={getErrorMessage(error)} onRetry={refetch} />
      </VendorLayout>
    );

  const churned = churnData?.results ?? [];

  return (
    <VendorLayout title="Churn Tracking">
      <div className="space-y-4">
        <div className="bg-red-50  border border-red-100  rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100  flex items-center justify-center flex-shrink-0">
            <UserMinus size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 ">
              {churnData?.count ?? 0}
            </p>
            <p className="text-xs text-red-500">Customers didn't renew</p>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { key: "this_week", label: "This Week" },
            { key: "this_month", label: "This Month" },
            { key: "all_time", label: "All Time" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${period === key ? "bg-[#111813]  text-white " : "bg-white  border border-gray-100  text-gray-500"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {churned.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-gray-400 text-sm">No churn this period!</p>
            </div>
          ) : (
            churned.map((c) => (
              <div
                key={c.id}
                className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100  flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0">
                  {c.customer_name?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111813]  truncate">
                    {c.customer_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {c.last_plan}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                    <Clock size={10} />
                    {c.days_since_cancel} days ago
                  </div>
                </div>
                <button
                  onClick={() => setOfferTarget(c)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#4eb75e]/10 text-[#4eb75e] text-xs font-bold hover:bg-[#4eb75e]/20 transition-colors flex-shrink-0"
                >
                  <Gift size={13} /> Offer
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {offerTarget && (
        <DiscountModal
          customer={offerTarget}
          isSending={sendingOffer}
          onSend={(data) =>
            sendOffer({ customerId: offerTarget.id, offerData: data })
          }
          onClose={() => setOfferTarget(null)}
        />
      )}
    </VendorLayout>
  );
};

export default VendorChurnPage;
