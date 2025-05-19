import MyShop from "../components/shop/myShop";
import SEO from "../components/common/SEO";

const myShop = () => {
  return (
    <>
      <SEO
        title="My Shop - Lily Shops"
        description="Manage your shop on Lily Shops. Update your shop details, manage products, view orders, and connect with customers."
        keywords="shop management, my shop, shop dashboard, Lily Shops, shop owner, manage products"
        type="website"
      />
      <section>
        <MyShop />
      </section>
    </>
  );
};

export default myShop;
