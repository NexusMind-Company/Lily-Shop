import SignUp from "../components/auth/signUp";
import SEO from "../components/common/SEO";

const signUp = () => {
  return (
    <>
      <SEO
        title="Create Account - Lily Shops"
        description="Join Lily Shops to create your shop, list your products, and connect with customers in your community."
        keywords="sign up, create account, register, Lily Shops, shop owner, create shop"
        type="website"
      />
      <section>
        <SignUp />
      </section>
    </>
  );
};

export default signUp;
