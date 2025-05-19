import ShopDetails from "../components/shop/shopDetails";
import SEO from "../components/common/SEO";

const productDetails = () => {
  return (
    <>
      <SEO
        title={`${shop?.name || "Shop"} - Lily Shops`}
        description={
          shop?.description ||
          "Visit this shop on Lily Shops to discover their products and services."
        }
        keywords={`${shop?.name}, ${shop?.category}, local shop, Lily Shops`}
        ogImage={shop?.image_url}
        ogUrl={`https://lilyshops.com/shop/${shop?.id}`}
        type="business.business"
      />
      <section>
        <ShopDetails />
      </section>
    </>
  );
};

export default productDetails;
