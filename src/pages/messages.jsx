import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import MessagesList from "../components/inbox/messagesList";
import PageSEO from "../components/common/PageSEO";

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
    <section className="h-screen">
      <PageSEO />
      <MessagesList />
    </section>
  );
}
