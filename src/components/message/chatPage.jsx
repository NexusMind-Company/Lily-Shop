/* eslint-disable react/prop-types */
import { useState } from "react";
import MessageInput from "./MessageInput";

export default function ChatPage({ chat, goBack }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello!", sender: "user" },
    { id: 2, text: "How can I help you?", sender: "shop" },
    { id: 3, text: "I want to order more.", sender: "user" },
  ]);

  const sendMessage = (message) => {
    setMessages([
      ...messages,
      { id: messages.length + 1, text: message, sender: "user" },
    ]);
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-[#fdf8e9]">
      {/* Chat Header */}
      <div className="flex items-center gap-2 border-b pb-2">
        <button onClick={goBack} className="text-xl">
          ⬅️
        </button>
        <h2 className="font-bold">{chat.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`my-2 p-2 rounded-md max-w-xs ${
              msg.sender === "user"
                ? "bg-gray-300 self-end"
                : "bg-blue-500 self-baseline"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <MessageInput sendMessage={sendMessage} />
    </div>
  );
}
