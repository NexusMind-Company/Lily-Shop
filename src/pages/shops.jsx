import ShopCard from "../components/shop/shopCard";
import SEO from "../components/common/SEO";
import BottomNav from "../components/shop/bottomNav";
import Header from "../components/common/header";
import { useState } from "react";

const Shops = () => {
  
    const [activePage, setActivePage] = useState("shops");
  return (
    <>
      <SEO
        title="Lily Shops - Discover Local Businesses"
        description="Explore local shops and businesses in your area. Find unique products, connect with shop owners, and support your community through Lily Shops."
        keywords="local shops, marketplace, shopping, local businesses, community, Lily Shops, discover shops"
        type="website"
      />
        <Header />
        <ShopCard />
        
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </>
  );
};

export default Shops;
