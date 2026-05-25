import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Send, Clock, Users } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
  getErrorMessage,
} from "../../components/vendor/VendorErrorStates";
import {
  sendBroadcastMessage,
  fetchBroadcastHistory,
} from "../../services/vendorDashboardApi";

const TEMPLATES = [
  "Fresh [meal] added as a bonus today! 🎉",
  "Deliveries for today are on schedule. Enjoy! 😋",
  "We've added a new item to the menu this week. Check it out!",
  "Thank you for subscribing! We appreciate your support ❤️",
];

const VendorBroadcastPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const {
    data: history,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["broadcastHistory"],
    queryFn: fetchBroadcastHistory,
  });

  const { mutate: broadcast, isPending } = useMutation({
    mutationFn: () =>
      sendBroadcastMessage({
        title: title.trim() || undefined,
        message: message.trim(),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["broadcastHistory"] });
      setTitle("");
      setMessage("");
      toast.success(
        `Message sent to ${data?.recipients_count ?? "all"} subscribers!`,
      );
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }
    if (message.length > 300) {
      toast.error("Message is too long (max 300 characters).");
      return;
    }
    broadcast();
  };

  return (
    <VendorLayout title="Broadcast">
      <div className="space-y-4">
        <div className="bg-lily/10 border border-lily/20 rounded-2xl px-4 py-3 flex gap-3">
          <Megaphone
            size={16}
            className="text-lily shrink-0 mt-0.5"
          />
          <div>
            <p className="text-xs font-bold text-lily">Direct Broadcast</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Send announcements to all your active subscribers at once.
            </p>
          </div>
        </div>

        <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Title (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Weekend Special"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-100  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-lily"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Message *
            </label>
            <textarea
              rows={4}
              placeholder="Type your announcement..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={300}
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50  text-sm text-[#111813]  focus:outline-none resize-none transition-colors ${message.length > 280 ? "border-orange-400 focus:border-orange-400" : "border-gray-100  focus:border-lily"}`}
            />
            <p
              className={`text-right text-[10px] mt-1 ${message.length > 280 ? "text-orange-500" : "text-gray-400"}`}
            >
              {message.length}/300
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Quick Templates
            </p>
            <div className="space-y-1.5">
              {TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(t)}
                  className="w-full text-left text-xs bg-gray-50  border border-gray-100  rounded-xl px-3 py-2 text-gray-500 hover:border-lily/30 hover:text-lily transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim() || isPending}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-all ${message.trim() && !isPending ? "bg-lily hover:bg-darklily" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            <Send size={15} />
            {isPending ? "Sending..." : "Send to All Subscribers"}
          </button>
        </div>

        <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 ">
            <h3 className="text-sm font-bold text-[#111813] ">
              Broadcast History
            </h3>
          </div>
          {isLoading && !history ? (
            <div className="p-4">
              <p className="text-xs text-gray-400 animate-pulse">
                Loading history...
              </p>
            </div>
          ) : isError && !history ? (
            <div className="p-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">Couldn't load history</p>
              <button
                onClick={refetch}
                className="text-xs text-lily font-semibold"
              >
                Retry
              </button>
            </div>
          ) : (history ?? []).length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              No broadcasts sent yet
            </p>
          ) : (
            (history ?? []).map((h) => (
              <div
                key={h.id}
                className="px-4 py-3 border-b border-gray-50  last:border-0"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-bold text-[#111813] ">
                    {h.title ?? "Broadcast"}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0 ml-2">
                    <Users size={10} />
                    {h.recipients_count}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">{h.message}</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock size={10} />
                  {h.sent_at}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorBroadcastPage;
