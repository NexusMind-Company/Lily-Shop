import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Heart,
  UserPlus,
  MessageCircle,
  ShoppingBag,
  Megaphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchActivities } from "../../redux/activitySlice";
import BottomNav from "./bottomNav";

const iconMap = {
  like: <Heart className="text-red-500 w-5 h-5" />,
  follow: <UserPlus className="text-blue-500 w-5 h-5" />,
  comment: <MessageCircle className="text-green-500 w-5 h-5" />,
  mention: <MessageCircle className="text-green-500 w-5 h-5" />,
  order: <ShoppingBag className="text-gray-500 w-5 h-5" />,
  promotion: <Megaphone className="text-yellow-500 w-5 h-5" />,
};

const Activity = () => {
  const dispatch = useDispatch();
  const { activities, loading, error } = useSelector((state) => state.activities);
  const [activePage, setActivePage] = useState("inbox");

  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);

  return (
    <div className="bg-white min-h-screen flex flex-col relative md:w-4xl md:mx-auto">
      {/* Header */}
      <header className="flex items-center justify-center p-4 relative border-b border-gray-100">
        <Link to="/inbox" className="absolute left-4 top-4">
          <ChevronLeft className="w-7 h-7 text-gray-700" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Activity</h1>
      </header>

      {/* Loading / Empty / Coming Soon */}
      <section className="flex-1 overflow-y-auto p-4 space-y-5">
        {loading && (
          <p className="text-center text-gray-500 mt-6">Loading activities...</p>
        )}

        {/* ✅ Show “Coming soon” instead of error */}
        {error && (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <Megaphone className="w-12 h-12  mb-3" />
            <p className="text-lg font-medium text-gray-600">Coming soon</p>
            <p className="text-sm text-gray-400 mt-1">
              Activity updates will appear here once available.
            </p>
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <p className="text-center text-gray-400 mt-6">
            No activity yet.
          </p>
        )}

        {!error &&
          activities.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between border-b border-gray-100 pb-3"
            >
              {/* Left Section */}
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                  {iconMap[item.type] || (
                    <MessageCircle className="text-gray-400 w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div>
                  {/* Avatar group */}
                  <div className="flex -space-x-2 mb-1">
                    <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"></div>
                  </div>
                  <p className="text-sm text-gray-800 leading-snug">
                    {item.message || "New activity"}
                    <span className="text-xs text-gray-500 ml-1">
                      • {item.time_ago}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right-side preview */}
              <div className="w-14 h-14 bg-gray-300 rounded-lg flex-shrink-0"></div>
            </div>
          ))}
      </section>

      {/* Bottom Navigation */}
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default Activity;
