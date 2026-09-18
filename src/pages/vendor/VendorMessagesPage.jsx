import { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, ChevronRight, Camera, X, Phone, EllipsisVertical, Reply, Copy, Edit2, SendHorizontal } from "lucide-react";
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
import { OrderMessageCard, SharedProductCard, SharedContentCard } from "../../components/inbox/chatPage";

const ChatView = ({ conversation, onBack }) => {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    mutationFn: () => sendMessageToCustomer(conversation.id, { text: text.trim(), media: selectedFile, reply_to_id: replyingTo?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversationMessages", conversation.id],
      });
      queryClient.invalidateQueries({ queryKey: ["vendorConversations"] });
      setText("");
      setSelectedFile(null);
      setReplyingTo(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSend = () => {
    if ((text.trim() || selectedFile) && !sending) send();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const msgs = useMemo(() => {
    return messages?.results ? [...messages.results].reverse() : [];
  }, [messages?.results]);

  useEffect(() => {
    if (msgs.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-20 relative">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700 md:hidden">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-600 border border-pink-200">
            {conversation.customer_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 leading-tight">
                {conversation.customer_name}
              </h2>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                Customer
              </span>
            </div>
            <p className="text-[10px] font-semibold flex items-center gap-1 text-green-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() =>
              toast("Voice call coming soon", {
                icon: "📞",
              })
            }
          >
            <Phone className="h-6 w-6 text-gray-600" />
          </button>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)}>
              <EllipsisVertical className="h-6 w-6 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => {
                    toast.success("Profile view coming soon");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    toast.success("User reported successfully");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t"
                >
                  Report User
                </button>
              </div>
            )}
          </div>
        </div>
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
              const content = msg.text || msg.content;
              
              if (typeof content === "string" && content.startsWith("[ORDER_PAYLOAD]:")) {
                try {
                  const payload = JSON.parse(content.replace("[ORDER_PAYLOAD]:", ""));
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <OrderMessageCard payload={payload} isMine={isMine} otherUserName={conversation.customer_name} />
                    </div>
                  );
                } catch (e) {
                  console.error("Failed to parse order payload", e);
                }
              }

              if (msg.product) {
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <SharedProductCard product={msg.product} isMine={isMine} />
                  </div>
                );
              }

              if (msg.shared_content) {
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <SharedContentCard content={msg.shared_content} isMine={isMine} />
                  </div>
                );
              }

              if (typeof content === "string" && content.startsWith("LILY_SHARE:")) {
                try {
                  const sharedData = JSON.parse(content.replace("LILY_SHARE:", ""));
                  if (sharedData.type === "shared_content") {
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <SharedContentCard content={sharedData} isMine={isMine} />
                      </div>
                    );
                  }
                } catch (e) {
                  console.error("Failed to parse shared content", e);
                }
              }

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"} group relative items-center gap-2`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] w-fit p-3 rounded-2xl text-sm break-words transition-colors duration-1000 ${
                      isMine
                        ? "bg-lily text-white rounded-br-none"
                        : "bg-pink-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.reply_to && (
                      <div className="bg-black/10 rounded-lg p-2 mb-2 border-l-4 border-lily/60">
                        <span className="text-xs font-bold block mb-0.5 opacity-80">{msg.reply_to.sender_username || "User"}</span>
                        <span className="text-xs opacity-90 line-clamp-2">{msg.reply_to.content || "📷 Media"}</span>
                      </div>
                    )}
                    
                    {msg.media && (
                      <div className={`mb-2 overflow-hidden rounded-xl`}>
                        {msg.media.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={msg.media} controls className="max-w-[220px] sm:max-w-[260px] h-auto max-h-[240px] bg-black/5" />
                        ) : (
                          <img src={msg.media} alt="Attached media" className="max-w-[220px] sm:max-w-[260px] h-auto max-h-[240px] object-cover bg-black/5 cursor-pointer hover:opacity-90 transition-opacity" />
                        )}
                      </div>
                    )}

                    {content && content !== "📷 Image" && (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {content}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-end gap-1 mt-1 relative">
                      <p className="text-[10px] opacity-70 text-right">
                        {new Date(msg.timestamp || new Date()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {isMine && (
                        <span className="ml-0.5">
                          <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </span>
                      )}
                      
                      <div className="relative flex items-center ml-1">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                          className={`${isMine ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-gray-600"} p-0.5 opacity-60 hover:opacity-100 transition-opacity`}
                        >
                          <EllipsisVertical className="w-3 h-3" />
                        </button>
                        {openMenuId === msg.id && (
                          <div className={`absolute ${isMine ? "right-0" : "left-0"} bottom-full mb-1 bg-white border shadow-lg rounded-xl z-10 w-32 py-1 overflow-hidden text-gray-800`}>
                            <button onClick={() => { setReplyingTo(msg); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"><Reply className="w-3 h-3"/> Reply</button>
                            <button onClick={() => { navigator.clipboard.writeText(content); toast.success("Copied"); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"><Copy className="w-3 h-3"/> Copy</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="shrink-0 flex flex-col bg-white border-t border-gray-100">
        {replyingTo && (
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center relative">
            <div className="flex-1 flex flex-col border-l-4 border-lily pl-3 overflow-hidden">
              <span className="text-xs font-bold text-lily mb-0.5">Replying to {replyingTo.isMine ? "yourself" : conversation?.customer_name || "User"}</span>
              <span className="text-xs text-gray-600 truncate">{replyingTo.content || "📷 Media"}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600 ml-2 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {selectedFile && (
          <div className="p-3 border-b border-gray-100 flex items-start bg-gray-50">
            <div className="relative inline-block shadow-sm rounded-lg">
              {selectedFile.type?.startsWith('video/') ? (
                <video src={URL.createObjectURL(selectedFile)} className="h-24 w-auto rounded-lg" controls />
              ) : (
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  className="h-24 w-auto rounded-lg object-cover" 
                />
              )}
              <button 
                onClick={() => setSelectedFile(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        <div className="p-3 flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*"
          />
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 focus:outline-none text-sm border border-transparent focus:border-lily/30 transition-colors"
          />

          <div className="flex items-center gap-1 shrink-0 bg-gray-100 rounded-full p-1">
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
              onClick={() => fileInputRef.current?.click()}
              title="Attach media"
            >
              <Camera className="h-6 w-6" />
            </button>

            <button 
              onClick={handleSend} 
              disabled={sending || (!text.trim() && !selectedFile)} 
              className={`p-2 rounded-full transition-colors ${
                sending || (!text.trim() && !selectedFile) 
                  ? "bg-transparent" 
                  : "bg-lily hover:bg-lily/90"
              }`}
            >
              <SendHorizontal
                className={`h-5 w-5 ${
                  sending || (!text.trim() && !selectedFile) ? "text-gray-400" : "text-white"
                } transition-all`}
              />
            </button>
          </div>
        </div>
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

  const convos = Array.isArray(conversations)
    ? conversations
    : (conversations?.results ?? []);

  return (
    <VendorLayout title="Messages">
      <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:-mx-4 md:-mb-4 bg-white md:border md:border-gray-100 md:rounded-2xl overflow-hidden shadow-sm">
        
        {/* Left Side: Conversations List */}
        <div className={`w-full md:w-[350px] flex-col border-r border-gray-100 ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-[#111813]">Chats</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {isError && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 flex items-center justify-between mb-4 mx-2">
                <p className="text-xs text-orange-700">⚠️ Couldn't refresh</p>
                <button onClick={refetch} className="text-xs text-lily font-semibold">Retry</button>
              </div>
            )}

            {convos.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-1">
                {convos.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setActiveConvo(convo)}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 transition-colors text-left ${activeConvo?.id === convo.id ? 'bg-lily/5 border border-lily/20' : 'bg-transparent hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-lily/10 flex items-center justify-center text-base font-bold text-lily">
                        {convo.customer_name?.charAt(0) ?? "?"}
                      </div>
                      {(convo.unread_count ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-lily text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-sm font-bold text-[#111813] truncate pr-2">
                          {convo.customer_name}
                        </p>
                        <p className="text-[10px] text-gray-400 shrink-0">
                          {convo.last_message_time}
                        </p>
                      </div>
                      <p className={`text-xs truncate ${convo.unread_count ? 'text-[#111813] font-bold' : 'text-gray-500'}`}>
                        {convo.last_message}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Chat View */}
        <div className={`flex-1 flex-col bg-[#FDFDFD] min-h-0 overflow-hidden ${activeConvo ? 'flex' : 'hidden md:flex'}`}>
          {activeConvo ? (
            <ChatView
              conversation={activeConvo}
              onBack={() => setActiveConvo(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-1 text-gray-400">Choose a chat from the left to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </VendorLayout>
  );
};

export default VendorMessagesPage;
