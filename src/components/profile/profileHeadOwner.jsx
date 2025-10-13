import { EllipsisVertical } from "lucide-react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Link } from "react-router-dom";

// Profile Heading Component for Owner
const ProfileHeadOwner = () => {
  const user = useSelector((state) => state.profile.user);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative w-full h-[25%] bg-lily rounded-b-[40px] text-white pt-15">
      <div className="absolute top-[10%] right-[5%] flex items-center z-10">
        <button onClick={() => setMenuOpen((open) => !open)} className="focus:outline-none">
          <EllipsisVertical className="text-white" size={28} />
        </button>
        {menuOpen && (
          <ul className="bg-white text-black w-[140px] rounded shadow-lg ml-2 absolute top-0 right-full">
            <Link to="/settings">
              <li className="p-2 hover:bg-gray-200 cursor-pointer border-b border-gray-400">
                Settings
              </li>
            </Link>
            <Link to="">
              <li className="p-2 hover:bg-gray-200 cursor-pointer">Remove Ads</li>
            </Link>
          </ul>
        )}
      </div>
      <img
        src={user?.profileImage || "./profile-icon.svg"}
        alt="profile"
        className="w-[100px] h-[100px] mx-auto rounded-full"
      />
      <div className="flex justify-center items-center gap-2 py-2">
        <p className="text-center text-xl font-bold ">{user?.name || "Profile Name"}</p>
        <img src="./check.png" alt="check icon" className="w-4 h-4" />
      </div>
      <div className="flex justify-center gap-2 pb-15 text-nowrap flex-wrap px-2">
        <p>{user?.followers ? `${user.followers} followers` : "0 followers"}</p>
        <span>.</span>
        <p>{user?.views ? `${user.views} views` : "0 views"}</p>
        <span>.</span>
        <p>{user?.videos ? `${user.videos} contents` : "0 contents"}</p>
        <span>.</span>
        <p>{user?.shops?.length ? `${user.shops.length} shops` : "0 shops"}</p>
      </div>
    </div>
  );
};

export default ProfileHeadOwner;
