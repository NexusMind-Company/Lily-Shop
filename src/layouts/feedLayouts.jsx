import { Outlet, useLocation } from "react-router-dom";
import { FeedProvider } from "../context/feedContext";
import BottomNav from "../components/feed/bottomNav";
import SideNav from "../components/feed/SideNav";

const FeedLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  let activePage = "home";
  if (path.includes("/createContent")) activePage = "create";
  else if (path.includes("/food")) activePage = "food"; // <-- Added this line
  else if (path.includes("/inbox") || path.includes("/messages") || path.includes("/chat")) activePage = "inbox";
  else if (path.includes("/profile")) activePage = "profile";

  return (
    <FeedProvider>
      <div className="flex min-h-screen w-full bg-white md:bg-gray-50">
        <SideNav activePage={activePage} />
        <main className="flex-1 w-full md:ml-64 relative pb-16 md:pb-0 h-screen overflow-hidden">
          <Outlet />
        </main>
        <BottomNav activePage={activePage} />
      </div>
    </FeedProvider>
  );
};

export default FeedLayout;