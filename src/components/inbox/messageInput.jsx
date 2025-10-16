/* eslint-disable react/prop-types */
import { useState } from "react";

export default function MessageInput({ sendMessage }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() !== "") {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex items-center p-2 w-full">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 p-2 border rounded-md"
        placeholder="Type a message..."
      />
      <button
        onClick={handleSend}
        className="ml-2 bg-[#075e54] text-white px-4 py-2 rounded-md hover:bg-[#064c44]"
      >
        Send
      </button>
    </div>
  );
}
