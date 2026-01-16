import { FeedProvider } from "./context/feedContext";
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
import FeedLayout from "./layouts/feedLayouts";
import ResetVerifyCode from "./components/auth/Reset_Password/verifyCode";
import ResetPasswordPage from "./components/auth/Reset_Password/resetPasswordPage";
import Profile from "./pages/profile";
import ProfileVisiting from "./pages/profileVisiting";
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
import OrdersPage from "./pages/orders";
import ActivityPage from "./pages/activity";
import InboxPage from "./pages/inbox";
import Messages from "./pages/messages";
import NotificationPage from "./pages/notifications";
import ChangeDOBPage from "./pages/ChangeDOB";
import ChangePhonePage from "./pages/ChangePhone";
import ChangePasswordPage from "./pages/ChangePassword";
import ChangeUsernamePage from "./pages/ChangeUsername";
import DeleteAccountPage from "./pages/DeleteAccount";
import ConfirmPhonePage from "./pages/ConfirmPhone";
import EditProfilePage from "./pages/editProfile";
import FollowingPage from "./pages/following";
import FollowersPage from "./pages/followers";
import FeedProductDetails from "./pages/feedProductDetails";
import Cart from "./pages/cart";
import ReceiptPage from "./pages/reciept";
import WalletCallbackPage from "./pages/wallet-callback";
import ChooseAddressPage from "./pages/chooseAddressPage.jsx";
import AddAddressPage from "./pages/AddAddressPage";
import PickupAddressPage from "./pages/PickupAddressPage.jsx";
import ChooseCardPage from "./pages/ChooseCardPage";
// import AddCardPage from "./pages/AddCardPage";a\ zz
import PasswordModalPage from "./pages/PasswordModalPage";
import PaymentLoadingPage from "./pages/paymentLoading";
import BankTransferPage from "./pages/BankTransferPage";
import PaymentSuccessPage from "./pages/paymentsSucessPage";
import PaymentFailedPage from "./pages/paymentFailedPage";
import Feed from "./pages/feed";
import OrderSummaryPage from "./pages/OrderSummaryPage.jsx";
import VendorDashboard from "./pages/VendorDashboard";
import VendorSubscriptionPage from "./pages/VendorSubscriptionPage";
import VendorSubscriptionsOverview from "./pages/VendorSubscriptionsOverview";
import CustomerSubscriptionsPage from "./pages/CustomerSubscriptionsPage";
import MealSelectionPage from "./pages/MealSelectionPage";
import ManageVendorPlansPage from "./pages/ManageVendorPlansPage";
import CreateSubscriptionPlanPage from "./pages/CreateSubscriptionPlanPage";
import EditPlanPage from "./pages/EditPlanPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import SubscriptionCallbackPage from "./pages/SubscriptionCallbackPage";
import { getCurrentUserId } from "./services/supabase";

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

      <FeedProvider>
        <Routes>
          {/* Public Routes - No Authentication Required */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-verify-code" element={<ResetVerifyCode />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/about" element={<About />} />

          {/* Feed Layout Routes - Mixed Access */}
          <Route element={<FeedLayout />}>
            <Route path="/" element={<Feed />} />
            <Route
              path="/product-details/:id"
              element={<FeedProductDetails />}
            />
            <Route path="/shop/:id" element={<ShopDetails />} />
            <Route path="/profile/:username" element={<ProfileVisiting />} />
          </Route>

          {/* Protected Routes - Authentication Required */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route path="/paystack/callback" element={<PaystackCallbackPage />} />
          <Route
            path="/myShop"
            element={
              <ProtectedRoute>
                <MyShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating"
            element={
              <ProtectedRoute>
                <Ratings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/createShop"
            element={
              <ProtectedRoute>
                <CreateShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-username"
            element={
              <ProtectedRoute>
                <CreateUsername />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-profile-pic"
            element={
              <ProtectedRoute>
                <UploadProfilePic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/birthday-picker"
            element={
              <ProtectedRoute>
                <BirthdayPicker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/createContent"
            element={
              <ProtectedRoute>
                <CreateContentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchaseAds"
            element={
              <ProtectedRoute>
                <PurchaseAds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/:shop_id/step1"
            element={
              <ProtectedRoute>
                <Step1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/:shop_id/paymentInitiation"
            element={
              <ProtectedRoute>
                <PaymentInitiation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/searchResults"
            element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editShop/:shop_id/edit-shop"
            element={
              <ProtectedRoute>
                <EditShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/:shop_id/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/:shop_id/add-products"
            element={
              <ProtectedRoute>
                <AddProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/:product_id/edit-products"
            element={
              <ProtectedRoute>
                <EditProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lilyChat"
            element={
              <ProtectedRoute>
                <LilyChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fetchAdDetails"
            element={
              <ProtectedRoute>
                <FetchAdDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-transaction"
            element={
              <ProtectedRoute>
                <VerifyTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaction-history"
            element={
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <DepositPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <WithdrawPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addBankAccount"
            element={
              <ProtectedRoute>
                <AddBankAccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bankAccountDetails"
            element={
              <ProtectedRoute>
                <BankAccountDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/confirmWithdrawal" element={<ConfirmWithdrawal />} />
          <Route path="/withdrawSuccess" element={<WithdrawSuccessPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/ChangeDOB" element={<ChangeDOBPage />} />
          <Route path="/ChangePhone" element={<ChangePhonePage />} />
          <Route path="/ChangePassword" element={<ChangePasswordPage />} />
          <Route path="/ChangeUsername" element={<ChangeUsernamePage />} />
          <Route path="/DeleteAccount" element={<DeleteAccountPage />} />
          <Route path="/ConfirmPhone" element={<ConfirmPhonePage />} />
          <Route path="/editProfile" element={<EditProfilePage />} />
          <Route path="/followers" element={<FollowersPage />} />
          <Route path="/following" element={<FollowingPage />} />
          <Route path="/editProfile" element={<EditProfilePage />} />
          <Route path="/followers" element={<FollowersPage />} />
          <Route path="/following" element={<FollowingPage />} />
          <Route path="/reciept" element={<ReceiptPage />} />
          <Route path="/walletCallback" element={<WalletCallbackPage />} />
          <Route path="/choose-address" element={<ChooseAddressPage />} />
          <Route path="/add-address" element={<AddAddressPage />} />
          <Route path="/choose-pickup" element={<PickupAddressPage />} />
          <Route path="/choose-card" element={<ChooseCardPage />} />
          <Route path="/order-summary" element={<OrderSummaryPage />} />
          {/* <Route path="/add-card" element={<AddCardPage />} /> */}
          <Route path="/password" element={<PasswordModalPage />} />
          <Route path="/bank-transfer" element={<BankTransferPage />} />
          <Route path="/payment-loading" element={<PaymentLoadingPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-failed" element={<PaymentFailedPage />} />
          <Route
            path="/vendor-dashboard"
            element={<VendorDashboard vendorId={getCurrentUserId()} />}
          />
          <Route
            path="/subscriptions"
            element={<VendorSubscriptionsOverview />}
          />
          <Route
            path="/my-subscriptions"
            element={<CustomerSubscriptionsPage />}
          />
          <Route
            path="/vendor/subscribe"
            element={<VendorSubscriptionPage />}
          />
          <Route
            path="/meal-selection/:subscriptionId"
            element={<MealSelectionPage />}
          />
          <Route
            path="/subscription/plans"
            element={<CustomerSubscriptionsPage />}
          />
          <Route
            path="/subscription/create"
            element={<CreateSubscriptionPlanPage />}
          />
          <Route
            path="/subscription/manage"
            element={<ManageVendorPlansPage />}
          />
          <Route path="/subscription/edit" element={<EditPlanPage />} />
          <Route
            path="/subscription-success"
            element={<SubscriptionSuccessPage />}
          />
          <Route
            path="/subscription-callback"
            element={<SubscriptionCallbackPage />}
          />
          {/* <Route path="/order-details" element={<OrderDetailsPage />} /> */}
        </Routes>
      </FeedProvider>

      {showIdlePopup && <IdleTimeoutPopup onClose={closeIdlePopup} />}
    </HelmetProvider>
  );
}
