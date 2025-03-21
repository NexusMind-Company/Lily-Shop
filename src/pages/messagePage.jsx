import { useState } from "react";
import MessageList from "../components/message/messageList"
import ChatPage from "../components/message/chatPage";

export default function Messages() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <section className="h-screen">
      {activeChat ? (
        <ChatPage chat={activeChat} goBack={() => setActiveChat(null)} />
      ) : (
        <MessageList openChat={setActiveChat} />
      )}
    </section>
  );
}
