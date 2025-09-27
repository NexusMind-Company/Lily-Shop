import { ChevronLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Profile Heading Component
const ProfileHead = () => {
  const user = useSelector((state) => state.profile.user);
  const navigate = useNavigate();
  const [isFollowed, setIsFollowed] = useState(user?.isFollowed || false);
  const [followers, setFollowers] = useState(parseInt(user?.followers) || 0);

  // Format number with 'k' for thousands
  const formatK = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "k";
    }
    return num;
  };

  // Handle Follow Logic
  const handleFollowToggle = () => {
    if (isFollowed) {
      setFollowers((prev) => Math.max(prev - 1, 0));
    } else {
      setFollowers((prev) => prev + 1);
    }
    setIsFollowed((prev) => !prev);
  };

  return (
    <div className="relative w-full h-[25%] bg-lily rounded-b-[40px] text-white pt-15">
      <button
        type="button"
        className="absolute top-[20px] left-[20px] bg-white rounded-full hover:bg-gray-200 transition-colors"
        onClick={() => navigate(-1)}>
        <ChevronLeft className="text-black p-[3px]" size={25} />
      </button>
      <img
        src={user?.profileImage || "./profile-icon.svg"}
        alt="profile"
        className="w-[100px] h-[100px] mx-auto rounded-full"
      />
      <div className="flex justify-center items-center gap-2 pt-5">
        <p className="text-center text-xl font-bold ">{user?.name || "Profile Name"}</p>
        <img src="./check.png" alt="check icon" className="w-4 h-4" />
      </div>
      <div className="flex justify-center gap-2 pt-4 text-nowrap flex-wrap">
        <p>{formatK(followers)} followers</p>
        <span>.</span>
        <p>{formatK(parseInt(user?.views) || 0)} views</p>
        <span>.</span>
        <p>{user?.videos || "0"} videos</p>
        <span>.</span>
        <p>{user?.shops?.length || "0"} shops</p>
      </div>
      <div className="flex justify-center gap-5 pb-5 pt-3 text-black font-semibold text-sm">
        <button
          type="button"
          className="bg-white rounded-2xl w-30 py-1 hover:bg-gray-200 transition-colors"
          onClick={handleFollowToggle}>
          {isFollowed ? "Unfollow" : "Follow"}
        </button>
        <button
          type="button"
          className="bg-white rounded-2xl w-30 py-1 hover:bg-gray-200 transition-colors">
          Message
        </button>
      </div>
    </div>
  );
};

export default ProfileHead;
