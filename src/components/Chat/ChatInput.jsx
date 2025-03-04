

// export default ChatInput;
import React, { useState, useEffect } from "react";
import sendIcon from "../../assets/send-message.png";
import clip from "../../assets/clip.png";
import mic from "../../assets/mic.png";

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSendMessage(`📎 File uploaded: ${file.name}`);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
  };

  const stopRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordingDuration > 0) {
        onSendMessage(`🎤 Voice message recorded: ${recordingDuration}s`);
      }
    }
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setRecordingDuration(0);
  };

  return (
    <div className=" flex justify-center p-2 relative items-center">
      {isRecording && (
        <div className="absolute top-[0px] bg-[#90BBB2] text-white px-4 py-1 rounded-md text-sm">
          {`Recording... ${recordingDuration}s`}
        </div>
      )}

      <div className="flex w-[70%] px-4 py-2 bg-[#DDF0EC] shadow-md rounded-md items-center ">
        <label htmlFor="file-upload">
          <img src={clip} alt="Attach file" className="w-4 h-4 cursor-pointer" />
        </label>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />

        <input
          type="text"
          className="flex-1 focus:outline-none ml-2 bg-transparent"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Your message..."
        />

        <img
          src={mic}
          alt="Record voice message"
          className={`ml-2 cursor-pointer transition-transform ${isRecording ? "w-6 h-6" : "w-4 h-4"}`}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={cancelRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          onTouchCancel={cancelRecording}
        />
      </div>

      <button
        className="ml-2 p-4 bg-[#90BBB2] rounded-[360px] hover:scale-105 transition-transform"
        onClick={handleSend}
      >
        <img src={sendIcon} alt="Send message" className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ChatInput;
