import ShopCard from "../components/home/shopCard";
import SEO from "../components/common/SEO";
import Header from "../components/common/header";
import Footer from "../components/common/footer";
import Navbar from "../components/common/navbar";

const Home = () => {
  return (
    <>
      <SEO
        title="Lily Shops - Discover Local Businesses"
        description="Explore local shops and businesses in your area. Find unique products, connect with shop owners, and support your community through Lily Shops."
        keywords="local shops, marketplace, shopping, local businesses, community, Lily Shops, discover shops"
        type="website"
      />
      <section>
        <Header />
        <ShopCard />
        <Navbar />
        <Footer />
      </section>
    </>
  );
};

export default Home;
