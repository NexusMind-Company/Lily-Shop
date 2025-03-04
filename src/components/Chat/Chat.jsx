import React, { useState,useEffect,useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import arrow from '../../assets/right-arrow.png'


const formatTime = (date) => {
    return date
      .toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
      .toLowerCase()
      .replace(" ", "");
  };
  
  

const Chat = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! How may I assist you today?", sender: "bot", time: formatTime(new Date()) }
  ]);
 
  const chatContainerRef = useRef(null);
  const handleSendMessage = (message) => {
    if (!message.trim()) return; // Prevent empty messages

    const newMessage = { text: message, sender: "user",time: formatTime(new Date()) };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botReply = getBotResponse(message);
      const botMessage = { text: botReply, sender: "bot", time: formatTime(new Date())};

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000);
  };
  
  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Simple bot response logic
  const getBotResponse = (userMessage) => {
    userMessage = userMessage.toLowerCase();

    if (userMessage.includes("hello") || userMessage.includes("hi")) {
      return "Hi there! How can I help you?";
    } else if (userMessage.includes("shop")) {
      return "You can explore our shop section for amazing products!";
    } else if (userMessage.includes("help")) {
      return "Sure! What do you need help with?";
    } else {
      return "I'm not sure about that, but I'm here to help!";
    }
  };

  return (
    <div className="w-[100%] max-w-md mx-auto bg-[#ECF0F1] ">
      {/* Header */}
      <div className="w-full h-64 flex justify-between  relative  overflow-hidden rounded-lg">
        <h2 className="text-[32px] text-[#90BBB2] mx-8 my-8 font-semibold">Lily</h2>
        <div className="absolute -top-10 -right-10 w-[150px] h-[150px] rounded-full">
  {/* Blurred Background */}
  <div className="w-full h-full bg-[#90BBB2] blur-[17.2px] absolute rounded-full"></div>
  
  {/* Image on Top */}
  <div className="w-full h-full flex p-9 pt-20 relative">
    <img src={arrow} alt="Arrow" className="w-4 h-4" />
  </div>
</div>
 </div>
 <div className="w-[150px] h-[150px] bg-[#EFBEBE]    blur-[6.2px] flex justify-start p-8 pt-26 items-center rounded-full md:relative  absolute -left-20 md:-left-0 z-0 md:top-30 "></div>
 
      {/* Chat Messages */}
      {/* <div className="h-80 overflow-y-auto p-3 space-y-3"> */}
      <div ref={chatContainerRef} className="h-80 overflow-y-auto p-3 space-y-3 custom-scrollbar">

        {messages.map((msg, index) => (
          <ChatMessage key={index} text={msg.text} sender={msg.sender} time={msg.time} />
        ))}
      </div>
      
     
      {/* Input Field */}
      <ChatInput onSendMessage={handleSendMessage}  />
    </div>
  );
};

export default Chat;
