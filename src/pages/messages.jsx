import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MessagesList from "../components/inbox/messagesList";
import ChatPage from "../components/inbox/chatPage";
import PageSEO from "../components/common/PageSEO";

export default function Messages() {
  const [activeChat, setActiveChat] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { state } = location;
    if (state && state.recipientId) {
      setActiveChat({
        id: state.recipientId,
        name: state.recipientUsername,
        username: state.recipientUsername,
        profilePic: state.profilePic,
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleOpenChat = (chat) => {
    navigate(`/chat/${chat.id}`);
  };

  const handleGoBack = () => {
    navigate("/messages");
    setActiveChat(null);
  };

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
