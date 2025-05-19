import Login from "../components/auth/login";
import SEO from "../components/common/SEO";

const login = () => {
  return (
    <>
      <SEO
        title="Login - Lily Shops"
        description="Sign in to your Lily Shops account to manage your shop, view messages, and connect with customers."
        keywords="login, sign in, Lily Shops, account, shop management"
        type="website"
      />
      <section>
        <Login />
      </section>
    </>
  );
};

export default login;
