import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
} from "../../components/vendor/VendorErrorStates";
import { getErrorMessage } from "../../utils/errorUtils";
import {
  fetchVendorConversations,
  fetchConversationMessages,
  sendMessageToCustomer,
} from "../../services/vendorDashboardApi";

const ChatView = ({ conversation, onBack }) => {
  const [text, setText] = useState("");
  const queryClient = useQueryClient();
  const { user_data } = useSelector((state) => state.auth);
  const currentUserId = user_data?.id || user_data?.user?.id;

  const {
    data: messages,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["conversationMessages", conversation.id],
    queryFn: () => fetchConversationMessages(conversation.id),
    refetchInterval: 5000, // poll every 5 seconds for new messages
  });

  const { mutate: send, isPending: sending } = useMutation({
    mutationFn: () => sendMessageToCustomer(conversation.id, text.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversationMessages", conversation.id],
      });
      queryClient.invalidateQueries({ queryKey: ["vendorConversations"] });
      setText("");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSend = () => {
    if (text.trim() && !sending) send();
  };

  const msgs = messages?.results ?? [];

  return (
    <div className="flex flex-col h-full min-h-[70vh]">
      <div className="flex items-center gap-3 py-3 border-b border-gray-100 ">
        <button onClick={onBack} className="text-lily text-sm font-semibold">
          ← Back
        </button>
        <div className="w-8 h-8 rounded-full bg-lily/10 flex items-center justify-center text-sm font-bold text-lily">
          {conversation.customer_name?.charAt(0) ?? "?"}
        </div>
        <p className="text-sm font-bold text-[#111813] ">
          {conversation.customer_name}
        </p>
      </div>

      {isLoading && !messages ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-gray-400 animate-pulse">
            Loading messages...
          </p>
        </div>
      ) : isError && !messages ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-2">
          <p className="text-xs text-gray-400">Could not load messages</p>
          <button onClick={refetch} className="text-xs text-lily font-semibold">
            Retry
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {msgs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              No messages yet. Say hello! 👋
            </p>
          ) : (
            msgs.map((msg) => {
              const isMine = typeof msg.is_me === "boolean" ? msg.is_me : (msg.sender === "vendor" || (currentUserId && String(msg.sender_id) === String(currentUserId)));
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-lily text-white rounded-br-sm" : "bg-pink-100 text-gray-800 rounded-bl-sm"}`}
                  >
                    {msg.text}
                    <p
                      className={`text-[10px] mt-1 ${isMine ? "text-green-100" : "text-gray-400"}`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-100 ">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-100  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-lily"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-12 h-12 rounded-xl bg-lily flex items-center justify-center text-white hover:bg-darklily disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

const VendorMessagesPage = () => {
  const [activeConvo, setActiveConvo] = useState(null);

  const {
    data: conversations,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["vendorConversations"],
    queryFn: fetchVendorConversations,
    refetchInterval: 15000,
  });

  if (isLoading && !conversations)
    return (
      <VendorLayout title="Messages">
        <VendorPageLoader />
      </VendorLayout>
    );

  if (activeConvo) {
    return (
      <VendorLayout title="Messages">
        <ChatView
          conversation={activeConvo}
          onBack={() => setActiveConvo(null)}
        />
      </VendorLayout>
    );
  }

  const convos = Array.isArray(conversations)
    ? conversations
    : (conversations?.results ?? []);

  return (
    <VendorLayout title="Messages">
      {isError && (
        <div className="bg-orange-50  border border-orange-100  rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs text-orange-700 ">
            ⚠️ Couldn't refresh conversations
          </p>
          <button onClick={refetch} className="text-xs text-lily font-semibold">
            Retry
          </button>
        </div>
      )}

      {convos.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No conversations yet
        </div>
      ) : (
        <div className="space-y-2">
          {convos.map((convo) => (
            <button
              key={convo.id}
              onClick={() => setActiveConvo(convo)}
              className="w-full flex items-center gap-3 bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  hover:border-lily/30 transition-colors text-left"
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-lily/10 flex items-center justify-center text-base font-bold text-lily">
                  {convo.customer_name?.charAt(0) ?? "?"}
                </div>
                {(convo.unread_count ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-lily text-white text-[10px] font-bold flex items-center justify-center">
                    {convo.unread_count}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111813] ">
                  {convo.customer_name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {convo.last_message}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-400">
                  {convo.last_message_time}
                </p>
                <ChevronRight
                  size={14}
                  className="text-gray-300 mt-1 ml-auto"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </VendorLayout>
  );
};

export default VendorMessagesPage;
