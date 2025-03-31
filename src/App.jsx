import Header from "./components/common/header";
import Nav from "./components/common/navbar";
import Home from "./pages/home";
import MyShop from "./pages/myShop";
import CreateShop from "./pages/createShop";
import EditShop from "./pages/editShop";
import ShopDetails from "./pages/shopDetails";
import Settings from "./pages/settings";
import Login from "./pages/login";
import { Route, Routes, useLocation } from "react-router";
import SignUp from "./pages/signUp";
import PurchaseAds from "./pages/purchaseAds";
import PaymentInitiation from "./components/ads/paymentInitiation";
import Step1 from "./components/ads/step1";
import ForgotPassword from "./pages/forgotPassword";
import SearchResults from "./pages/searchResults";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/authSlice";
import Messages from "./pages/messagePage";
import ScrollToTop from "./components/common/scrollToTop";
import LilyChat from "./pages/lilyChat";
import AddProducts from "./pages/addProducts";
import Products from "./pages/products";
import EditProducts from "./pages/editProducts";
import VerifyTransaction from "./components/ads/verifyTransaction";
import FetchAdDetails from "./pages/fetchAdDetails";

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  useEffect(() => {
    if (localStorage.user_data) {
      dispatch(loginSuccess({ user_data: localStorage.user_data }));
    }
  }, []);

  const isLilyChatPage = location.pathname === "/lilyChat";

  return (
    <>
      <ScrollToTop />
      {!isLilyChatPage && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/myShop" element={<MyShop />} />
        <Route path="/createShop" element={<CreateShop />} />
        <Route path="/product/:id" element={<ShopDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/purchaseAds" element={<PurchaseAds />} />
        <Route path="/shop/:shop_id/step1" element={<Step1 />} />
        <Route
          path="/shop/:shop_id/paymentInitiation"
          element={<PaymentInitiation />}
        />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/searchResults" element={<SearchResults />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/editShop/:shop_id/edit-shop" element={<EditShop />} />
        <Route path="/shop/:shop_id/products" element={<Products />} />
        <Route path="/shop/:shop_id/add-products" element={<AddProducts />} />
        <Route
          path="/shop/:product_id/edit-products"
          element={<EditProducts />}
        />
        <Route path="/lilyChat" element={<LilyChat />} />
        <Route path="/fetchAdDetails" element={<FetchAdDetails />} />
        <Route path="/verify-transaction" element={<VerifyTransaction />} />
      </Routes>
      {!isLilyChatPage && <Nav />}
    </>
  );
}
