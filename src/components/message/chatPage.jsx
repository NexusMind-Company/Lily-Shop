import { useState, useRef, useEffect } from "react";
import MessageInput from "./messageInput";
import { ChevronLeft, User } from "lucide-react";

export default function ChatPage({ chat, goBack }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello!", sender: "user" },
    { id: 2, text: "How can I help you?", sender: "shop" },
    { id: 3, text: "I want to order more.", sender: "user" },
  ]);
  const messagesEndRef = useRef(null);

  const sendMessage = (message) => {
    setMessages([
      ...messages,
      { id: messages.length + 1, text: message, sender: "user" },
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FFFAE7] overflow-hidden w-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#075e54] text-white sticky top-0 z-10 shadow">
        <button onClick={goBack} className="p-1 rounded-full hover:bg-[#064c44]">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="text-[#075e54]" size={22} />
          </div>
          <h2 className="font-semibold text-base">{chat.name}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-3 sm:px-3 sm:py-4 flex flex-col gap-1.5 sm:gap-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex  ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-xl px-4 py-2 max-w-[75%] text-sm shadow whitespace-pre-wrap break-words
                ${msg.sender === "user"
                  ? "bg-[#dcf8c6] text-gray-900"
                  : "bg-white text-gray-800 border border-gray-200"
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-2 py-2 sm:px-3 sm:py-3 bg-[#f7f7f7] border-t flex items-center sticky bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)]">
        <MessageInput sendMessage={sendMessage} />
      </div>
    </div>
  );
}