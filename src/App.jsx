import Header from "./components/header";
import Nav from "./components/navbar";
import Home from "./pages/home";
<<<<<<< Updated upstream

=======
import AIButton from "./components/ai/AIButton"
>>>>>>> Stashed changes
import CreateShop from "./pages/createShop";

import CreateForm from "./pages/createForm";
import EditForm from "./pages/editForm";
import EditShop from "./pages/editShop";
import ProductDetails from "./pages/productDetails";
import Settings from "./pages/settings";
import Login from "./pages/login";
import { BrowserRouter as Router, Route, Routes } from "react-router";
import SignUp from "./pages/signUp";
import PurchaseAds from "./pages/purchaseAds";
import Step2 from "./components/ads/step2";
import CreateAdsForm from "./components/ads/createAdsForm";
import ForgotPassword from "./pages/forgotPassword";
import SearchResults from "./pages/searchResults";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./store/authSlice";
import Messages from "./pages/messagePage";
<<<<<<< Updated upstream
=======
import ScrollToTop from "./components/scrollToTop";
import Chat from "./pages/chat";
>>>>>>> Stashed changes

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.user_data) {
      dispatch(loginSuccess({ user_data: localStorage.user_data }));
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/createShop" element={<CreateShop />} />
        <Route path="/createForm" element={<CreateForm />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/purchaseAds" element={<PurchaseAds />} />
        <Route path="/step2" element={<Step2 />} />
        <Route path="/createAdsForm" element={<CreateAdsForm />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/searchResults" element={<SearchResults />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/editform" element={<EditForm />} />
        <Route path="/editShop" element={<EditShop />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
      <AIButton />
      <Nav />
    </Router>
  );
}
