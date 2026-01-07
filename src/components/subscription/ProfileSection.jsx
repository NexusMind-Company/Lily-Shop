import PropTypes from "prop-types";

/**
 * ProfileSection component displaying vendor profile information
 * @param {Object} props - Component props
 * @param {Object} props.profile - Vendor profile data
 * @param {Function} props.onEditProfile - Function to handle edit profile action
 */
const ProfileSection = ({ profile, onEditProfile }) => {
  if (!profile) return null;

  return (
    <section className="flex flex-col items-center text-center space-y-4">
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-surface-light dark:border-surface-dark shadow-md"
          style={{
            backgroundImage: `url("${
              profile.profile_pic || "https://via.placeholder.com/96"
            }")`,
          }}
          alt={`${profile.name} profile picture`}
        />
        {profile.verified && (
          <div className="absolute bottom-0 right-0 bg-primary text-text-main-light p-1 rounded-full border-2 border-surface-light dark:border-surface-dark flex items-center justify-center">
            <span className="material-symbols-outlined text-sm font-bold">
              check
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">
          {profile.name}
        </h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">
          {profile.verified ? "Verified Meal Provider" : "Meal Provider"}
        </p>
      </div>
      <button
        onClick={onEditProfile}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 shadow-sm text-text-main-light dark:text-text-main-dark text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-auto"
      >
        <span className="material-symbols-outlined text-lg">edit</span>
        <span>Edit Profile</span>
      </button>
    </section>
  );
};

ProfileSection.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    profile_pic: PropTypes.string,
    verified: PropTypes.bool,
  }),
  onEditProfile: PropTypes.func.isRequired,
};

export default ProfileSection;
