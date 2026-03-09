import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { useSelector } from "react-redux";

const Following = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const loggedInUserId = auth?.user_data?.id;

  const targetId = id || username || loggedInUserId;

  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowingList = async () => {
      if (!targetId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get(`/auth/following/${targetId}/`);

        // Fix: Explicitly check for res.data.following
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.following || res.data?.results || [];

        setFollowing(data);
      } catch (err) {
        console.error("Failed to fetch following", err);
        setError("Failed to load following users.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingList();
  }, [targetId]);

  return (
    <div className="bg-white min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <ChevronLeft
          size={30}
          className="mr-3 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h2 className="font-semibold text-lg flex-1 text-center pr-8">
          Following {loading ? "" : `(${following.length})`}
        </h2>
      </div>

      {/* List */}
      <div className="mt-3">
        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lily"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 mt-10">{error}</p>
        ) : following.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            Not following anyone yet.
          </p>
        ) : (
          following.map((user, i) => (
            <div
              key={i}
              className="flex items-center px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => navigate(`/profile/${user.id || user.username}`)}
            >
              <img
                src={user.profile_pic || user.img || "/profile-icon.svg"}
                alt={user.name || user.username}
                className="w-10 h-10 rounded-full mr-3 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/profile-icon.svg";
                }}
              />
              <div>
                <p className="font-medium">
                  {user.name || user.full_name || user.username || "User"}
                </p>
                <p className="text-gray-500 text-sm">
                  @{user.username || "username"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Following;
