import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";
import api from "../../services/api"; // axios instance with token

const ChangeUsername = () => {
  const navigate = useNavigate();
  const [oldUsername, setOldUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    if (!newUsername) {
      setError("New username is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.patch("/auth/username/set/", {
        username: newUsername,
      });

      console.log("Username updated:", res.data);

      setSuccess("Username updated successfully");
      setTimeout(() => {
        navigate("/profile");
      }, 2000);

      setSuccess("Username updated successfully");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.username?.[0] ||
          err.response?.data?.detail ||
          "Failed to update username"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={30} className="mr-3" />
          </button>
          <h2 className="font-semibold text-lg flex-1 text-center">Change Username</h2>
        </div>

        <div className="mt-8 px-4">
          {success && (
            <p className="text-green-500 bg-green-100 py-2 rounded-3xl m-4 text-center">
              {success}
            </p>
          )}

          {error && (
            <p className="text-red-500 bg-red-100  py-2 rounded-3xl m-4 text-center">{error}</p>
          )}
          <label htmlFor="old-username" className="text-sm">
            Old Username
          </label>
          <input
            id="old-username"
            type="text"
            placeholder="Enter old username"
            value={oldUsername}
            onChange={(e) => setOldUsername(e.target.value)}
            className="w-full bg-gray-200 rounded-3xl px-3 py-2 mb-4 mt-2"
          />

          <label htmlFor="new-username" className="text-sm">
            New Username
          </label>
          <input
            id="new-username"
            type="text"
            placeholder="Enter new username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full bg-gray-200 rounded-3xl px-3 py-2 mb-1 mt-2"
          />

          <p className="flex gap-1 items-center text-gray-600 text-sm mt-1">
            <Info size={20} />
            username can only be changed every 90 days
          </p>
        </div>
      </div>

      <div className="px-4 pb-6">
        <button
          disabled={loading}
          onClick={handleSave}
          className={`px-4 py-2 rounded-3xl w-full text-white ${
            loading ? "bg-lily/60" : "bg-lily"
          }`}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default ChangeUsername;
