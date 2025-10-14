import Home from "./pages/home";
import MyShop from "./pages/myShop";
import Ratings from "./components/shop/ratings";
import CreateShop from "./pages/createShop";
import EditShop from "./pages/editShop";
import ShopDetails from "./pages/shopDetails";
import Settings from "./pages/settings";
import Login from "./pages/login";
import { Route, Routes } from "react-router";
import SignUp from "./pages/signUp";
import PurchaseAds from "./pages/purchaseAds";
import PaymentInitiation from "./components/ads/paymentInitiation";
import Step1 from "./components/ads/step1";
import ForgotPassword from "./pages/forgotPassword";
import SearchResults from "./pages/searchResults";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout } from "./redux/authSlice";
import Messages from "./pages/messagePage";
import ScrollToTop from "./components/common/scrollToTop";
import LilyChat from "./pages/lilyChat";
import AddProducts from "./pages/addProducts";
import Products from "./pages/products";
import EditProducts from "./pages/editProducts";
import VerifyTransaction from "./components/ads/verifyTransaction";
import FetchAdDetails from "./pages/fetchAdDetails";
import useIdleTimeout from "./hooks/useIdleTimeout";
import IdleTimeoutPopup from "./components/common/idleTimeoutPopup";
import { HelmetProvider } from "react-helmet-async";
import SEO from "./components/common/SEO";
import VerifyEmail from "./components/auth/verifyEmail";
import VerifyCode from "./components/auth/verifyCode";
import CreateUsername from "./components/auth/createUsername";
import UploadProfilePic from "./components/auth/optionalAuthFeats/uploadProfilePic";
import BirthdayPicker from "./components/auth/optionalAuthFeats/birthdayPicker";
import ResetVerifyCode from "./components/auth/Reset_Password/verifyCode";
import ResetPasswordPage from "./components/auth/Reset_Password/resetPasswordPage";
import Feed from "./pages/feed";
import Profile from "./pages/profile";
import Notifications from "./pages/notifications";
import Account from "./pages/account";
import CreateContentPage from "./pages/createContent";
import About from "./components/about/About";
import WalletPage from "./pages/wallet";
import TransactionHistory from "./pages/transaction-history";
import DepositPage from "./pages/deposit";
import WithdrawPage from "./pages/withdraw";
import AddBankAccountPage from "./pages/addBankAccount";
import BankAccountDetailsPage from "./pages/bankAccountDetails";
import ConfirmWithdrawal from "./pages/ConfirmWithdrawal";
import WithdrawSuccessPage from "./pages/withdrawSuccess";


export default function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => !!state.auth.user_data);
  const [showIdlePopup, setShowIdlePopup] = useState(false);

  useEffect(() => {
    if (localStorage.user_data) {
      dispatch(loginSuccess({ user_data: localStorage.user_data }));
    }
  }, [dispatch]);

  const handleIdle = () => {
    if (isAuthenticated) {
      dispatch(logout());
      setShowIdlePopup(true);
    }
  };

  useIdleTimeout(handleIdle, 5 * 60 * 1000);

  const closeIdlePopup = () => {
    setShowIdlePopup(false);
  };

  return (
    <HelmetProvider>
      <SEO />
      <ScrollToTop />
      {/* {!isLilyChatPage && !isLoginPage && !isSignupPage && <Header />} */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/myShop" element={<MyShop />} />
        <Route path="/rating" element={<Ratings />} />
        <Route path="/createShop" element={<CreateShop />} />
        <Route path="/shop/:id" element={<ShopDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-verify-code" element={<ResetVerifyCode />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/create-username" element={<CreateUsername />} />
        <Route path="/upload-profile-pic" element={<UploadProfilePic />} />
        <Route path="/birthday-picker" element={<BirthdayPicker />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/createContent" element={<CreateContentPage />} />
        <Route path="/purchaseAds" element={<PurchaseAds />} />
        <Route path="/shop/:shop_id/step1" element={<Step1 />} />
        <Route
          path="/shop/:shop_id/paymentInitiation"
          element={<PaymentInitiation />}
        />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/searchResults" element={<SearchResults />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/editShop/:shop_id/edit-shop" element={<EditShop />} />
        <Route path="/shop/:shop_id/products" element={<Products />} />
        <Route path="/shop/:shop_id/add-products" element={<AddProducts />} />
        <Route
          path="/shop/:product_id/edit-products"
          element={<EditProducts />}
        />
         <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/lilyChat" element={<LilyChat />} />
        <Route path="/fetchAdDetails" element={<FetchAdDetails />} />
        <Route path="/account" element={<Account />} />
        <Route path="/verify-transaction" element={<VerifyTransaction />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/transaction-history" element={<TransactionHistory />} />
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/withdraw" element={<WithdrawPage />} />
        <Route path="/addBankAccount" element={<AddBankAccountPage />} />
        <Route path="/bankAccountDetails" element={<BankAccountDetailsPage />} />
        <Route path="/confirmWithdrawal" element={<ConfirmWithdrawal />} />
        <Route path="/withdrawSuccess" element={<WithdrawSuccessPage />} />
      

      </Routes>
      {/* {!isLilyChatPage && !isLoginPage && !isSignupPage && <Nav />} */}

      {/* {!isLoginPage && !isSignupPage && !isLilyChatPage && <Footer />} */}

      {showIdlePopup && <IdleTimeoutPopup onClose={closeIdlePopup} />}
    </HelmetProvider>
  );
}

