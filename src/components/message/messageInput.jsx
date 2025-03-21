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
    <div className="flex items-center p-2 border-t">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 p-2 border rounded-md"
        placeholder="Type a message..."
      />
      <button
        onClick={handleSend}
        className="ml-2 bg-green-500 text-white p-2 rounded-md"
      >
        Send
      </button>
    </div>
  );
}
