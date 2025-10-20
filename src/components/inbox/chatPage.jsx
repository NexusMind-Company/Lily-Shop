import { useState, useRef } from "react";
import { Link } from "react-router";
import { Camera, SendHorizontal, File, EllipsisVertical, Phone, ChevronLeft } from "lucide-react";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      type: "product",
      orderNo: "#LS-YYYYMMDD-XXXXX",
      name: "Flowery Pattern Sundress",
      price: "₦12,500",
      qty: 1,
      color: "White",
      deliveryFee: "₦3,500",
      address: {
        name: "Balogun Adeolu",
        phone: "+234 800 123 4567",
        location: "22 Olowu Street, Ikeja, Lagos, Nigeria",
        landmark: "AY Prints",
        description: "Blue and white painted 3 story building with a white gate.",
      },
      status: "Pending",
      image: "https://via.placeholder.com/200x250.png?text=Sundress",
      time: "12:24PM",
    },
    {
      type: "text",
      text: "Hi, thank you for placing your order. We will process very soon.",
      sender: "seller",
      time: "12:24PM",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { type: "text", text: newMessage, sender: "user", time: "now" }]);
    setNewMessage("");
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newMsgs = files.map((file) => {
      const url = URL.createObjectURL(file);
      let fileType = "document";
      if (file.type.startsWith("image/")) fileType = "image";
      else if (file.type.startsWith("video/")) fileType = "video";

      return { type: fileType, fileName: file.name, fileUrl: url, sender: "user", time: "now" };
    });
    setMessages([...messages, ...newMsgs]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <Link to="/inbox"><ChevronLeft className="w-8 h-8"/></Link>
          <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-sm font-bold">
            🌸
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Bloom Threads</h2>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Phone className="h-7 w-7" />
          <EllipsisVertical className="h-7 w-7" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => {
          if (msg.type === "product") {
            return (
              <div className="flex justify-end" key={i} >
              <div className="bg-green-100 bg-opacity-10 rounded-2xl p-3 w-[85%]">
                <img src={msg.image} alt={msg.name} className="w-full rounded-lg mb-3" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Order no:</span> {msg.orderNo}
                </p>
                <p className="font-semibold text-gray-800 mt-1">{msg.name}</p>
                <p className="text-gray-700">💰 {msg.price}</p>
                <p className="text-gray-700 text-sm">Qty: {msg.qty}</p>
                <p className="text-gray-700 text-sm">Color: {msg.color}</p>
                <p className="text-gray-700 text-sm">Delivery fee: {msg.deliveryFee}</p>

                <div className="mt-2 text-sm">
                  <p className="font-semibold">Delivery address</p>
                  <p className="text-gray-700">
                    {msg.address.name} {msg.address.phone}
                  </p>
                  <p className="text-gray-700">{msg.address.location}</p>
                  <p className="text-gray-700">Nearest landmark: {msg.address.landmark}</p>
                  <p className="text-gray-700">{msg.address.description}</p>
                </div>

                <div className="mt-3 text-center">
                  <span className="border border-lily text-lily rounded-full px-4 py-1 text-sm font-medium">
                    {msg.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 text-right mt-1">{msg.time}</p>
              </div>
              </div>
            );
          }

          if (msg.type === "text") {
            return (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-green-100 text-gray-800 rounded-br-none"
                      : "bg-pink-100 text-gray-800 rounded-bl-none"
                  }`}>
                  {msg.text}
                  <p className="text-[10px] mt-1 opacity-70 text-right">{msg.time}</p>
                </div>
              </div>
            );
          }

          if (msg.type === "image" || msg.type === "video" || msg.type === "document") {
            return (
              <div key={i} className="flex justify-end">
                <div className="max-w-[75%] p-2 bg-lily bg-opacity-10 rounded-2xl">
                  {msg.type === "image" && (
                    <img src={msg.fileUrl} alt="uploaded" className="rounded-lg mb-1 max-h-60" />
                  )}
                  {msg.type === "video" && (
                    <video controls className="rounded-lg mb-1 max-h-60">
                      <source src={msg.fileUrl} type="video/mp4" />
                    </video>
                  )}
                  {msg.type === "document" && (
                    <div className="flex items-center space-x-2">
                      <File size={16} />
                      <span className="text-sm">{msg.fileName}</span>
                    </div>
                  )}
                  <p className="text-[10px] mt-1 opacity-70 text-right">{msg.time}</p>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Input Bar */}
      <div className="relative bg-white p-3 flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <input
          type="text"
          placeholder="Start typing..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-200 rounded-full px-4 py-2 focus:outline-none"
        />
        <button
          className="absolute right-[15%] text-gray-500"
          onClick={() => fileInputRef.current.click()}>
          <Camera className="h-8 w-8" />
        </button>
        <button onClick={handleSend}>
          <SendHorizontal className="text-lily h-8 w-8" />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
