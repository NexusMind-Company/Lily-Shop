import ShopCard from "../components/shop/shopCard";
import PageSEO from "../components/common/PageSEO";
import BottomNav from "../components/shop/bottomNav";
import Header from "../components/common/header";
import { useState } from "react";

const Shops = () => {
  
    const [activePage, setActivePage] = useState("shops");
  return (
    <>
      <PageSEO />
        <Header />
        <ShopCard />
        
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </>
  );
};

export default Shops;
