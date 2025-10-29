import { useState } from "react";
import MessagesList from "../components/inbox/messagesList";
import ChatPage from "../components/inbox/chatPage";
import PageSEO from "../components/common/PageSEO";

export default function Messages() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <section className="h-screen">
    <PageSEO />
      {activeChat ? (
        <ChatPage chat={activeChat} goBack={() => setActiveChat(null)} />
      ) : (
        <MessagesList openChat={setActiveChat} />
      )}
    </section>
  );
}
