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
import SignUp from "./components/auth/signup";
import ForgotPassword from "./components/auth/forgotPassword";
import VerifyEmail from "./components/auth/verifyEmail";
import VerifyCode from "./components/auth/verifyCode";
import ResetVerifyCode from "./components/auth/Reset_Password/verifyCode";
import ResetPasswordPage from "./components/auth/Reset_Password/resetPasswordPage";

/* ---------------- FEED ---------------- */
import Feed from "./pages/feed";
import VendorsList from "./pages/VendorsList";
import FeedProductDetails from "./pages/feedProductDetails";
import SearchResults from "./pages/searchResults";

/* ---------------- PROFILE ---------------- */
import Profile from "./pages/profile";
import ProfileVisiting from "./pages/profileVisiting";
import Followers from "./pages/followers";
import Following from "./pages/following";

/* ---------------- WALLET ---------------- */
import Wallet from "./pages/wallet";
import Deposit from "./pages/deposit";
import Withdraw from "./pages/withdraw";
import ConfirmWithdrawal from "./pages/confirmWithdrawal";
import WithdrawSuccess from "./pages/withdrawSuccess";

/* ---------------- ORDERS ---------------- */
import CartPage from "./pages/cart";




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

/* ---------------- USER PREMIUM ---------------- */
import UserSubscriptionPage from "./pages/UserSubscriptionPage";
import UserSubscriptionSuccessPage from "./pages/UserSubscriptionSuccessPage";
import UserSubscriptionCallbackPage from "./pages/UserSubscriptionCallbackPage";

/* ---------------- SETTINGS ---------------- */
import Settings from "./pages/settings";

/* ---------------- OTHER ---------------- */
import LilyChat from "./components/ai/lilyChat";
import VendorDashboard from "./pages/VendorDashboard";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CreateSubscriptionVendor from "./components/subscription/CreateSubscriptionVendor";

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

        {/* Vendor subscription browsing */}
        <Route
          path="/vendor-subscription/:vendorId"
          element={<VendorSubscriptionPage />}
        />

        {/* ================= PROTECTED ROUTES ================= */}

        <Route element={<ProtectedRoute />}>

          {/* Feed Layout Wrapper */}
          <Route element={<FeedLayout />}>

            {/* Feed */}
            <Route path="/" element={<Feed />} />
            <Route path="/food" element={<VendorsList />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product-details/:productId" element={<FeedProductDetails />} />

            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<ProfileVisiting />} />
            <Route path="/profile/:userId/followers" element={<Followers />} />
            <Route path="/profile/:userId/following" element={<Following />} />

            {/* Wallet */}
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/withdraw/confirm" element={<ConfirmWithdrawal />} />
            <Route path="/withdraw/success" element={<WithdrawSuccess />} />

            {/* Orders */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-summary" element={<OrderSummaryPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/order/:orderId" element={<OrderDetailPage />} />

            {/* Subscription */}
            <Route path="/create-vendor" element={<CreateSubscriptionVendor />} />

            {/* Customer subscriptions */}
            <Route path="/subscriptions" element={<CustomerSubscriptionsPage />} />
            <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
            <Route path="/subscription-callback" element={<SubscriptionCallbackPage />} />

            {/* User premium subscription */}
            <Route path="/user-subscription" element={<UserSubscriptionPage />} />
            <Route path="/user-subscription/success" element={<UserSubscriptionSuccessPage />} />
            <Route path="/user-subscription/callback" element={<UserSubscriptionCallbackPage />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />

            {/* AI */}
            <Route path="/lily-chat" element={<LilyChat />} />

          </Route>

        </Route>


        {/* ================= VENDOR ROLE ROUTES ================= */}

        <Route element={<RoleProtectedRoute requiredRole="vendor" />}>

          <Route path="/vendor-dashboard" element={<VendorDashboard />} />

          {/* Vendor subscription management */}
          <Route path="/vendor/subscriptions" element={<VendorSubscriptionsOverview />} />

          <Route path="/vendor/plans" element={<ManageVendorPlansPage />} />

          <Route path="/vendor/plans/create" element={<CreateSubscriptionPlanPage />} />

          <Route path="/vendor/plans/:planId" element={<PlanDetailsPage />} />

          <Route path="/vendor/plans/:planId/edit" element={<EditPlanPage />} />

          {/* Meal plans */}
          <Route path="/subscription/create-meal-plan" element={<CreateMealPlanPage />} />

          <Route path="/subscription/create-meal-plan/:planId" element={<EditPlanPage />} />

        </Route>


      </Routes>
    </FeedProvider>
  );
}

export default App;
