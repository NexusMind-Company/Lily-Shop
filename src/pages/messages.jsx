import { useState } from "react";
import MessagesList from "../components/inbox/messagesList";
import ChatPage from "../components/inbox/chatPage";

export default function Messages() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <section className="h-screen">
      {activeChat ? (
        <ChatPage chat={activeChat} goBack={() => setActiveChat(null)} />
      ) : (
        <MessagesList openChat={setActiveChat} />
      )}
    </section>
  );
}
