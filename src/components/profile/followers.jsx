import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { useSelector } from "react-redux";

const Followers = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const loggedInUserId = auth?.user_data?.id;

  const targetId = id || username || loggedInUserId;

  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowersList = async () => {
      if (!targetId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get(`/auth/followers/${targetId}/`);

        // Fix: Explicitly check for res.data.followers based on backend JSON structure
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.followers || res.data?.results || [];

        // If the data doesn't have profile pictures, we fetch them
        if (data.length > 0 && !data[0].profile_pic) {
          const updatedFollowers = await Promise.all(
            data.map(async (user) => {
              try {
                // Fetch individual profiles to get the pic
                const profileRes = await api.get(`/auth/profile/${user.id}/`);
                return {
                  ...user,
                  profile_pic:
                    profileRes.data.profile_pic ||
                    profileRes.data.user?.profile_pic,
                };
              } catch (err) {
                console.error(
                  `Failed to fetch profile for user ${user.id}`,
                  err,
                );
                return user;
              }
            }),
          );
          setFollowers(updatedFollowers);
        } else {
          setFollowers(data);
        }
      } catch (err) {
        console.error("Failed to fetch followers", err);
        setError("Failed to load followers.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowersList();
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
          Followers {loading ? "" : `(${followers.length})`}
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
        ) : followers.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No followers found.</p>
        ) : (
          followers.map((user, i) => (
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

export default Followers;
