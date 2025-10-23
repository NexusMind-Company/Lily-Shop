import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import ProfileOwner from "./profileOwner";
import ProfileVisiting from "./profileVisiting";
import LoaderSd from "../loaders/loaderSd";

const Profiles = ({ userId }) => {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const authUserId = useSelector((state) => state.auth.user?.id);
  const navigate = useNavigate();

  const isOwner = authUserId && userId && authUserId === userId;

  // If the user is not logged in for some time, show the login prompt
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authUserId) setShowLoginPrompt(true);
    }, 7000); // 7 seconds delay before showing login/signup CTA

    return () => clearTimeout(timer);
  }, [authUserId]);

  // While checking auth state
  if (!authUserId && !showLoginPrompt) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <LoaderSd />
      </div>
    );
  }

  // If user is not logged in, show login/signup prompt
  if (!authUserId && showLoginPrompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          You need to log in to view this profile
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Please log in or create an account to continue.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-lily text-white font-semibold px-5 py-2 rounded-full hover:bg-lily/90 transition-all"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="border border-lily text-lily font-semibold px-5 py-2 rounded-full hover:bg-lily/10 transition-all"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  // Render profile owner or visiting view
  return <div>{isOwner ? <ProfileOwner /> : <ProfileVisiting />}</div>;
};

// ✅ Prop validation
Profiles.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Profiles;
