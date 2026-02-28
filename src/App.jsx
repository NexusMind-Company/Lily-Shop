import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { fetchProfile } from "./redux/profileSlice";

import FeedLayout from "./layouts/feedLayouts";
import ScrollToTop from "./components/common/scrollToTop";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleProtectedRoute from "./components/common/RoleProtectedRoute";
import { FeedProvider } from "./context/feedContext";

/* ---------------- AUTH ---------------- */
import Login from "./components/auth/login";
import SignUp from "./components/auth/signUp";
import ForgotPassword from "./components/auth/forgotPassword";
import VerifyEmail from "./components/auth/verifyEmail";
import VerifyCode from "./components/auth/verifyCode";
import ResetVerifyCode from "./components/auth/Reset_Password/verifyCode";
import ResetPasswordPage from "./components/auth/Reset_Password/resetPasswordPage";

/* ---------------- FEED ---------------- */
import Feed from "./pages/feed";
import SearchResults from "./pages/searchResults";
import ProductDetails from "./components/feed/product/productDetails";
import VendorsList from "./pages/VendorsList";
import FeedProductDetails from "./pages/feedProductDetails";

/* ---------------- PROFILE ---------------- */
import Profile from "./pages/profile";
import ProfileVisiting from "./pages/profileVisiting";
import FollowersPage from "./pages/followers";
import FollowingPage from "./pages/following";
import InboxPage from "./pages/inbox";
import ChatPage from "./components/inbox/chatPage";
import NotificationPage from "./pages/notifications";
import ActivityPage from "./pages/activity";
import AccountPage from "./pages/account";

/* ---------------- WALLET ---------------- */
import Wallet from "./pages/wallet";
import Deposit from "./pages/deposit";
import Withdraw from "./pages/withdraw";
import ConfirmWithdrawal from "./pages/ConfirmWithdrawal";
import WithdrawSuccess from "./pages/withdrawSuccess";
import WalletTopUpPage from "./pages/WalletTopUpPage";

/* ---------------- ORDERS ---------------- */
import CartPage from "./pages/cart";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CheckoutPage from "./pages/CheckoutPage";

/* ---------------- SUBSCRIPTIONS ---------------- */
import VendorSubscriptionPage from "./pages/VendorSubscriptionPage";
import VendorSubscriptionsOverview from "./pages/VendorSubscriptionsOverview";
import ManageVendorPlansPage from "./pages/ManageVendorPlansPage";
import CreateSubscriptionPlanPage from "./pages/CreateSubscriptionPlanPage";
import CreateMealPlanPage from "./pages/CreateMealPlanPage";
import EditPlanPage from "./pages/EditPlanPage";
import PlanDetailsPage from "./pages/PlanDetailsPage";
import CustomerSubscriptionsPage from "./pages/CustomerSubscriptionsPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import SubscriptionCallbackPage from "./pages/SubscriptionCallbackPage";
import UserSubscriptionPage from "./pages/UserSubscriptionPage";
import UserSubscriptionSuccessPage from "./pages/UserSubscriptionSuccessPage";
import UserSubscriptionCallbackPage from "./pages/UserSubscriptionCallbackPage";

import SubscriptionPaymentPage from "./pages/SubscriptionPaymentPage";
import SubscriptionProcessingPage from "./pages/SubscriptionProcessingPage";
// import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";

/* ---------------- OTHER ---------------- */
import Settings from "./pages/settings";
import LilyChat from "./components/ai/lilyChat";
import VendorDashboard from "./pages/VendorDashboard";
import VerificationPage from "./pages/VerificationPage";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <FeedProvider>
      <ScrollToTop />
      <Toaster position="top-center" />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-verify-code" element={<ResetVerifyCode />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route element={<ProtectedRoute />}>
          {/* Layout wrapper */}
          <Route element={<FeedLayout />}>
            {/* Feed */}
            <Route path="/" element={<Feed />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/food" element={<VendorsList />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route
              path="/product-details/:id"
              element={<FeedProductDetails />}
            />

            {/* Vendor browsing */}
            <Route
              path="/vendor-subscription/:vendorId"
              element={<VendorSubscriptionPage />}
            />

            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<ProfileVisiting />} />
            <Route
              path="/profile/:userId/followers"
              element={<FollowersPage />}
            />
            <Route
              path="/profile/:userId/following"
              element={<FollowingPage />}
            />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/account" element={<AccountPage />} />

            {/* Inbox & Social */}
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/activity" element={<ActivityPage />} />

            {/* Wallet */}
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/withdraw/confirm" element={<ConfirmWithdrawal />} />
            <Route path="/withdraw/success" element={<WithdrawSuccess />} />
            <Route path="/wallet/topup" element={<WalletTopUpPage />} />

            {/* Orders */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-summary" element={<OrderSummaryPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/order/:orderId" element={<OrderDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Customer Subscriptions */}
            <Route
              path="/subscriptions"
              element={<CustomerSubscriptionsPage />}
            />
            <Route
              path="/subscription-success"
              element={<SubscriptionSuccessPage />}
            />
            <Route
              path="/subscription-callback"
              element={<SubscriptionCallbackPage />}
            />

            <Route
              path="/subscription/payment/:planId"
              element={<SubscriptionPaymentPage />}
            />
            {/* <Route path="/subscription/success" element={<SubscriptionSuccessPage />} /> */}
            {/* User Premium */}
            <Route
              path="/user-subscription"
              element={<UserSubscriptionPage />}
            />
            <Route
              path="/user-subscription/success"
              element={<UserSubscriptionSuccessPage />}
            />
            <Route
              path="/user-subscription/callback"
              element={<UserSubscriptionCallbackPage />}
            />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* ================= VENDOR ROLE ROUTES ================= */}
          <Route element={<RoleProtectedRoute requiredRole="vendor" />}>
            <Route
              path="/vendor/subscriptions"
              element={<VendorSubscriptionsOverview />}
            />
            <Route path="/vendor/plans" element={<ManageVendorPlansPage />} />
            <Route
              path="/vendor/plans/create"
              element={<CreateSubscriptionPlanPage />}
            />
            <Route path="/vendor/plans/:planId" element={<PlanDetailsPage />} />
            <Route
              path="/vendor/plans/:planId/edit"
              element={<EditPlanPage />}
            />
            <Route
              path="/subscription/create-meal-plan"
              element={<CreateMealPlanPage />}
            />
            <Route
              path="/subscription/create-meal-plan/:planId"
              element={<EditPlanPage />}
            />
          </Route>
        </Route>
      </Routes>
    </FeedProvider>
  );
}

export default App;
