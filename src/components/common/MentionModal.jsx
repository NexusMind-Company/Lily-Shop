import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fetchPublicProfile } from "../../services/api";

const MentionModal = ({ username, isOpen, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && username) {
      const loadProfile = async () => {
        try {
          setLoading(true);
          const data = await fetchPublicProfile(username);
          setProfile(data);
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        } finally {
          setLoading(false);
        }
      };
      loadProfile();
    }
  }, [isOpen, username]);

  if (!isOpen) return null;

  const profilePic =
    profile?.profile_pic ||
    profile?.user?.profile_pic ||
    "/user.png";

  const displayName = profile?.username || profile?.user?.username || username;
  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.user?.first_name || "Lily User"
    : "Loading...";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-end justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white rounded-t-[30px] border-x border-t border-black p-6 pb-10 shadow-2xl z-10"
          style={{ minHeight: "22vh" }}
        >
          {/* Pull Tab */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full" />

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lily" />
            </div>
          ) : profile ? (
            <div className="flex flex-col gap-5 mt-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border border-black overflow-hidden shrink-0 bg-gray-50">
                  <img
                    src={profilePic}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "/user.png")}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-black">
                    @{displayName}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {fullName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  navigate(`/profile/${displayName}`);
                  onClose();
                }}
                className="w-full py-3 bg-lily hover:bg-darklily text-white font-bold rounded-xl border-2 border-black transition-all active:scale-[0.98]"
              >
                View Profile
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 font-medium">User not found</p>
              <button
                onClick={onClose}
                className="mt-4 text-lily font-bold"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MentionModal;
