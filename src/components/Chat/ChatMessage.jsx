import React from "react";
import ball from '../../assets/ball.png'

const ChatMessage = ({ text, sender, time }) => {
  const isUser = sender === "user";
  return (
      
    <div className={`flex relative z-20  ${isUser ? "justify-end" : "justify-start"}`}>
     <img src={ball} alt="bot image" className={`w-6 h-6 mt-5 ${isUser?"hidden":"block"}`} />
      <div className={`p-2 rounded-[15px] ml-2  ${isUser ? "bg-[#90BBB2] text-white" : "bg-[#DDF0EC] text-black"} max-w-xs`}>
          <div>
         {text}
         <span className={`text-xs  block mt-1 text-right ${isUser?"text-white":"text-gray-900"} `}>{time}</span>
         </div>
      </div>
    </div>
    
  );
};

export default ChatMessage;
