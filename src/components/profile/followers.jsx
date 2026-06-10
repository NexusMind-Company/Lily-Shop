import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { fetchFollowersList } from "../../services/api";

const Followers = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const loggedInUserId = auth?.user_data?.id;

  const targetId = id || username || loggedInUserId;

  const {
    data: followers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["followers", targetId],
    queryFn: () => fetchFollowersList(targetId),
    enabled: !!targetId,
  });

  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load followers.";

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
          Followers {isLoading ? "" : `(${followers.length})`}
        </h2>
      </div>

      {/* List */}
      <div className="mt-3">
        {isLoading ? (
          <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lily"></div>
          </div>
        ) : isError ? (
          <p className="text-center text-red-500 mt-10">{errorMessage}</p>
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
