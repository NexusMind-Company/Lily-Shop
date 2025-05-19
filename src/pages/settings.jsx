import Settings from "../components/settings/settings";
import SEO from "../components/common/SEO";

const settings = () => {
  return (
    <>
      <SEO
        title="Account Settings - Lily Shops"
        description="Manage your Lily Shops account settings. Update your profile, preferences, and account information."
        keywords="account settings, profile settings, preferences, Lily Shops, account management"
        type="website"
      />
      <section>
        <Settings />
      </section>
    </>
  );
};

export default settings;
