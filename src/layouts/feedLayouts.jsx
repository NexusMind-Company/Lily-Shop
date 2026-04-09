import { Outlet, useLocation } from "react-router-dom";
import { FeedProvider } from "../context/feedContext";
import BottomNav from "../components/feed/bottomNav";
import SideNav from "../components/feed/SideNav";

const FeedLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  let activePage = "home";
  if (path.includes("/createContent")) activePage = "create";
  else if (path.includes("/food")) activePage = "food";
  else if (
    path.includes("/inbox") ||
    path.includes("/messages") ||
    path.includes("/chat")
  )
    activePage = "inbox";
  else if (path.includes("/profile")) activePage = "profile";

  // EXACT MATCH ALLOWLIST: Only show on these specific main tab pages
  const mainTabs = ["/", "/inbox", "/profile"];

  // Only true if the current path exactly matches one of the main tabs
  const shouldShowBottomNav = mainTabs.includes(path);

  // The main feed needs overflow-hidden to handle its own TikTok-style snap scrolling.
  // Every other page gets standard vertical scrolling globally.
  const isFeedRoute = path === "/";

  return (
    <FeedProvider>
      <div className="flex min-h-screen w-full bg-white md:bg-gray-50 dark:bg-background-dark transition-colors duration-300">
        <SideNav activePage={activePage} />

        <main
          className={`flex-1 w-full md:ml-64 relative h-screen md:pb-0 ${
            isFeedRoute
              ? "overflow-hidden"
              : "overflow-y-auto overflow-x-hidden scrollbar-hide"
          } ${shouldShowBottomNav ? "pb-20" : "pb-0"}`}
        >
          <Outlet />
        </main>

        {/* Only render BottomNav if the current path exactly matches a main tab */}
        {shouldShowBottomNav && <BottomNav activePage={activePage} />}
      </div>
    </FeedProvider>
  );
};

export default FeedLayout;
