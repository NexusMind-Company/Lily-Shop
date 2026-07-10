import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import MessagesList from "../components/inbox/messagesList";
import PageSEO from "../components/common/PageSEO";

import { MessageCircle } from "lucide-react";

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const recipientId =
      location.state?.recipientId ||
      searchParams.get("user") ||
      searchParams.get("seller");

    if (recipientId) {
      navigate(`/chat/${recipientId}`, { replace: true });
    }
  }, [location.state, navigate, searchParams]);

  return (
    <section className="fixed inset-0 md:left-64 flex bg-gray-50 z-20">
      <PageSEO />
      {/* Messages List - Full on mobile, Sidebar on desktop */}
      <div className="w-full md:w-[350px] border-r border-gray-200 bg-white h-full flex-col shrink-0">
        <MessagesList />
      </div>

      {/* Empty State Placeholder (Desktop Only) */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 h-full">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Lily Shops Messages
          </h2>
          <p className="text-gray-500 font-medium">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    </section>
  );
}
