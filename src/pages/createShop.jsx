import CreateShop from "../components/shop/createShop";
import SEO from "../components/common/SEO";

const createShop = () => {
  return (
    <>
      <SEO
        title="Create Your Shop - Lily Shops"
        description="Start your journey as a shop owner on Lily Shops. Create your shop profile, set up your business, and start selling to your community."
        keywords="create shop, new shop, shop setup, business profile, Lily Shops, shop owner"
        type="website"
      />
      <section>
        <CreateShop />
      </section>
    </>
  );
};

export default createShop;
