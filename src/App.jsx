import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { fetchProfile } from "./redux/profileSlice";
import { fetchCart } from "./redux/cartSlice";

import FeedLayout from "./layouts/feedLayouts";
import ScrollToTop from "./components/common/scrollToTop";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleProtectedRoute from "./components/common/RoleProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { FeedProvider } from "./context/feedContext.jsx";

/* ---------------- AUTH ---------------- */
import Login from "./components/auth/login";
import SignUp from "./components/auth/signUp";
import ForgotPassword from "./components/auth/forgotPassword";
import VerifyEmail from "./components/auth/verifyEmail";
import VerifyCode from "./components/auth/verifyCode";
import VerificationSentPage from "./pages/VerificationSentPage";
import ResetPasswordPage from "./components/auth/Reset_Password/resetPasswordPage";

/* ---------------- FEED - Critical, load immediately ---------------- */
import Feed from "./pages/feed";
import VendorsList from "./pages/VendorsList";
import FeedProductDetails from "./pages/feedProductDetails";

/* ================= LAZY LOADED PAGES ================= */

/* SHOP */
const CreateShop = lazy(() => import("./pages/createShop"));
const MyShop = lazy(() => import("./pages/myShop"));
const ShopDetails = lazy(() => import("./pages/shopDetails"));
const EditShop = lazy(() => import("./pages/editShop"));
const AddProducts = lazy(() => import("./pages/addProducts"));
const Ratings = lazy(() => import("./components/shop/ratings"));

/* PROFILE */
const Profile = lazy(() => import("./pages/profile"));
const ProfileVisiting = lazy(() => import("./pages/profileVisiting"));
const FollowersPage = lazy(() => import("./pages/followers"));
const FollowingPage = lazy(() => import("./pages/following"));
const EditProfile = lazy(() => import("./components/profile/editProfile"));
const VerificationPage = lazy(() => import("./pages/VerificationPage"));
const AccountPage = lazy(() => import("./pages/account"));

/* SOCIAL & INBOX */
const InboxPage = lazy(() => import("./pages/inbox"));
const MessagesPage = lazy(() => import("./pages/messages"));
const ChatPage = lazy(() => import("./components/inbox/chatPage"));
const NotificationPage = lazy(() => import("./pages/notifications"));
const ActivityPage = lazy(() => import("./pages/activity"));

/* WALLET */
const Wallet = lazy(() => import("./pages/wallet"));
const Deposit = lazy(() => import("./pages/deposit"));
const Withdraw = lazy(() => import("./pages/withdraw"));
const ConfirmWithdrawal = lazy(() => import("./pages/ConfirmWithdrawal"));
const WithdrawSuccess = lazy(() => import("./pages/withdrawSuccess"));
const WalletTopUpPage = lazy(() => import("./pages/WalletTopUpPage"));
const AddBankAccountPage = lazy(() => import("./pages/addBankAccount"));
const BankAccountDetailsPage = lazy(() => import("./pages/bankAccountDetails"));
const TransactionHistoryPage = lazy(
  () => import("./pages/transaction-history"),
);
const ReceiptPage = lazy(() => import("./pages/reciept"));
const WalletCallbackPage = lazy(() => import("./pages/wallet-callback"));

/* ORDERS */
const CartPage = lazy(() => import("./pages/CartPage"));
const OrderSummaryPage = lazy(() => import("./pages/OrderSummaryPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const AdsOrderSuccessPage = lazy(() => import("./pages/AdsOrderSuccessPage"));

/* SUBSCRIPTIONS */
const VendorSubscriptionPage = lazy(
  () => import("./pages/VendorSubscriptionPage"),
);
const VendorSubscriptionsOverview = lazy(
  () => import("./pages/VendorSubscriptionsOverview"),
);
const ManageVendorPlansPage = lazy(
  () => import("./pages/ManageVendorPlansPage"),
);
const SubscriptionDetailsPage = lazy(
  () => import("./pages/SubscriptionDetailsPage"),
);
const CreateSubscriptionPlanPage = lazy(
  () => import("./pages/CreateSubscriptionPlanPage"),
);
const CreateMealPlanPage = lazy(() => import("./pages/CreateMealPlanPage"));
const EditPlanPage = lazy(() => import("./pages/EditPlanPage"));
const PlanDetailsPage = lazy(() => import("./pages/PlanDetailsPage"));
const CustomerSubscriptionsPage = lazy(
  () => import("./pages/CustomerSubscriptionsPage"),
);
const SubscriptionSuccessPage = lazy(
  () => import("./pages/SubscriptionSuccessPage"),
);
const SubscriptionCallbackPage = lazy(
  () => import("./pages/SubscriptionCallbackPage"),
);
const UserSubscriptionPage = lazy(() => import("./pages/UserSubscriptionPage"));
const UserSubscriptionSuccessPage = lazy(
  () => import("./pages/UserSubscriptionSuccessPage"),
);
const UserSubscriptionCallbackPage = lazy(
  () => import("./pages/UserSubscriptionCallbackPage"),
);
const SubscriptionPaymentPage = lazy(
  () => import("./pages/SubscriptionPaymentPage"),
);
const SubscriptionProcessingPage = lazy(
  () => import("./pages/SubscriptionProcessingPage"),
);
const MealSelectionPage = lazy(() => import("./pages/MealSelectionPage"));

/* SETTINGS & ACCOUNT */
const Settings = lazy(() => import("./pages/settings"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePassword"));
const DeleteAccountPage = lazy(() => import("./pages/DeleteAccount"));
const DeleteVendorProfilePage = lazy(
  () => import("./pages/DeleteVendorProfilePage"),
);
const PasswordModalPage = lazy(() => import("./pages/PasswordModalPage"));

/* ADS & PAYMENTS */
const PurchaseAds = lazy(() => import("./pages/purchaseAds"));
const FetchAdDetails = lazy(() => import("./pages/fetchAdDetails"));
const PaymentInitiation = lazy(
  () => import("./components/ads/paymentInitiation"),
);
const VerifyTransaction = lazy(
  () => import("./components/ads/verifyTransaction"),
);
const PaymentFailedPage = lazy(() => import("./pages/paymentFailedPage"));
const PaymentSuccessPage = lazy(() => import("./pages/paymentsSucessPage"));
const PaymentLoadingPage = lazy(() => import("./pages/paymentLoading"));
const PaystackCallbackPage = lazy(() => import("./pages/PaystackCallbackPage"));

/* VENDOR DASHBOARD */
const VendorDashboardOverview = lazy(
  () => import("./pages/vendor/VendorDashboardOverview"),
);
const VendorOrdersPage = lazy(() => import("./pages/vendor/VendorOrdersPage"));
const VendorSubscriptionsPage = lazy(
  () => import("./pages/vendor/VendorSubscriptionsPage"),
);
const VendorMenuPage = lazy(() => import("./pages/vendor/VendorMenuPage"));
const VendorAvailabilityPage = lazy(
  () => import("./pages/vendor/VendorAvailabilityPage"),
);
const VendorCutoffPage = lazy(() => import("./pages/vendor/VendorCutoffPage"));
const VendorPauseShopPage = lazy(
  () => import("./pages/vendor/VendorPauseShopPage"),
);
const VendorEarningsPage = lazy(
  () => import("./pages/vendor/VendorEarningsPage"),
);
const VendorAddonsPage = lazy(() => import("./pages/vendor/VendorAddonsPage"));
const VendorMessagesPage = lazy(
  () => import("./pages/vendor/VendorMessagesPage"),
);
const VendorBroadcastPage = lazy(
  () => import("./pages/vendor/VendorBroadcastPage"),
);
const VendorRatingsPage = lazy(
  () => import("./pages/vendor/VendorRatingsPage"),
);
const VendorChurnPage = lazy(() => import("./pages/vendor/VendorChurnPage"));
const VendorAnalyticsPage = lazy(
  () => import("./pages/vendor/VendorAnalyticsPage"),
);
const VendorPackagesPage = lazy(
  () => import("./pages/vendor/VendorPackagesPage"),
);
const VendorEditProfilePage = lazy(
  () => import("./pages/vendor/VendorEditProfilePage"),
);
const SupportPage = lazy(() => import("./pages/SupportPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StaffOperationsPage = lazy(() => import("./pages/StaffOperationsPage"));

/* OTHER */
const About = lazy(() => import("./components/about/About"));
const LilyChat = lazy(() => import("./components/ai/lilyChat"));
const CreatePost = lazy(() => import("./components/content/CreatePost"));
const AddAddressPage = lazy(() => import("./pages/AddAddressPage"));
const AddCardPage = lazy(() => import("./pages/AddCardPage"));
const ChoosePickupAddressPage = lazy(
  () => import("./pages/ChoosePickupAddressPage"),
);
const ChooseCardPage = lazy(() => import("./pages/ChooseCardPage"));
const ChooseAddressPage = lazy(() => import("./pages/chooseAddressPage"));
const CreateSubscriptionVendor = lazy(
  () => import("./components/subscription/CreateSubscriptionVendor"),
);

/* ================= LAZY LOADING FALLBACK ================= */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen w-full">
    <div className="w-10 h-10 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ScrollToTopAuto = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <FeedProvider>
      <ScrollToTopAuto />
      <ScrollToTop />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: "Inter, sans-serif" },
        }}
      />

      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-email-sent" element={<VerificationSentPage />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/password-reset/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="/about" element={<About />} />
            <Route element={<FeedLayout />}>
              <Route path="/" element={<Feed />} />
              <Route path="/feed" element={<Navigate to="/" replace />} />
            </Route>

            {/* ================= PROTECTED ROUTES ================= */}
            <Route element={<ProtectedRoute />}>
              <Route element={<FeedLayout />}>
                {/* Feed - Critical pages, immediate load */}
                {/* <Route path="/" element={<Feed />} />
                <Route path="/feed" element={<Navigate to="/" replace />} />*/}
                <Route path="/product/:id" element={<FeedProductDetails />} />
                <Route
                  path="/product-details/:id"
                  element={<FeedProductDetails />}
                />

                {/* Shop */}
                <Route path="/create-shop" element={<CreateShop />} />
                <Route path="/createShop" element={<CreateShop />} />
                <Route path="/my-shop" element={<MyShop />} />
                <Route path="/myShop" element={<MyShop />} />
                <Route path="/createContent" element={<CreatePost />} />
                <Route path="/shop/:shopId" element={<ShopDetails />} />
                <Route path="/rating" element={<Ratings />} />
                <Route path="/edit-shop/:shopId" element={<EditShop />} />
                <Route
                  path="/shop/add-products/:shopId"
                  element={<AddProducts />}
                />
                <Route path="/food" element={<VendorsList />} />
                <Route path="/support" element={<SupportPage />} />

                {/* Staff Routes */}
                <Route element={<RoleProtectedRoute requiredRole="staff" />}>
                  <Route
                    path="/lilyshop/workers"
                    element={<StaffOperationsPage />}
                  />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

                <Route
                  path="/vendor-subscription/:vendorId"
                  element={<VendorSubscriptionPage />}
                />
                <Route
                  path="/vendor-dashboard"
                  element={<Navigate to="/vendor/dashboard" replace />}
                />
                <Route
                  path="/subscription/details"
                  element={<SubscriptionDetailsPage />}
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
                <Route path="/followers" element={<FollowersPage />} />
                <Route path="/followers/:id" element={<FollowersPage />} />
                <Route path="/following" element={<FollowingPage />} />
                <Route path="/following/:id" element={<FollowingPage />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/editProfile" element={<EditProfile />} />

                {/* Inbox & Social */}
                <Route path="/inbox" element={<InboxPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/new" element={<MessagesPage />} />
                <Route path="/chat/:conversationId" element={<ChatPage />} />
                <Route path="/notifications" element={<NotificationPage />} />
                <Route path="/activity" element={<ActivityPage />} />

                {/* Wallet */}
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/deposit" element={<Deposit />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route
                  path="/withdraw/confirm"
                  element={<ConfirmWithdrawal />}
                />
                <Route path="/withdraw/success" element={<WithdrawSuccess />} />
                <Route path="/wallet/topup" element={<WalletTopUpPage />} />
                <Route
                  path="/transaction-history"
                  element={<TransactionHistoryPage />}
                />
                <Route
                  path="/addBankAccount"
                  element={<AddBankAccountPage />}
                />
                <Route
                  path="/bankAccountDetails"
                  element={<BankAccountDetailsPage />}
                />
                <Route path="/receipt" element={<ReceiptPage />} />
                <Route path="/reciept" element={<ReceiptPage />} />

                {/* Orders */}
                <Route path="/order-summary" element={<OrderSummaryPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/order/:orderId" element={<OrderDetailPage />} />

                {/* Customer Subscriptions */}
                <Route
                  path="/subscriptions"
                  element={<CustomerSubscriptionsPage />}
                />
                <Route
                  path="/create-vendor"
                  element={<CreateSubscriptionVendor />}
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
                  path="/subscription/payment/"
                  element={<SubscriptionPaymentPage />}
                />
                <Route
                  path="/subscription/processing"
                  element={<SubscriptionProcessingPage />}
                />
                <Route
                  path="/subscription/success"
                  element={<SubscriptionSuccessPage />}
                />
                <Route
                  path="/meal-selection/:subscriptionId"
                  element={<MealSelectionPage />}
                />

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

                {/* Extras */}
                <Route path="/settings" element={<Settings />} />
                <Route
                  path="/change-password"
                  element={<ChangePasswordPage />}
                />
                <Route
                  path="/ChangePassword"
                  element={<ChangePasswordPage />}
                />
                <Route path="/delete-account" element={<DeleteAccountPage />} />
                <Route path="/DeleteAccount" element={<DeleteAccountPage />} />
                <Route path="/password" element={<PasswordModalPage />} />

                {/* Address & Card Selection */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/add-address" element={<AddAddressPage />} />
                <Route path="/add-card" element={<AddCardPage />} />
                <Route
                  path="/choose-pickup"
                  element={<ChoosePickupAddressPage />}
                />
                <Route path="/choose-card" element={<ChooseCardPage />} />
                <Route path="/choose-address" element={<ChooseAddressPage />} />
              </Route>

              <Route path="/payment-loading" element={<PaymentLoadingPage />} />
              <Route path="/payment-failed" element={<PaymentFailedPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route
                path="/paystack-callback"
                element={<PaystackCallbackPage />}
              />
              <Route
                path="/paystack/callback"
                element={<PaystackCallbackPage />}
              />
              <Route path="/wallet-callback" element={<WalletCallbackPage />} />
              <Route path="/wallet/callback" element={<WalletCallbackPage />} />

              {/* ================= VENDOR ROLE ROUTES ================= */}
              <Route element={<RoleProtectedRoute requiredRole="vendor" />}>
                <Route
                  path="/vendor/dashboard"
                  element={<VendorDashboardOverview />}
                />
                <Route
                  path="/vendor/dashboard/orders"
                  element={<VendorOrdersPage />}
                />
                <Route
                  path="/vendor/dashboard/subscriptions"
                  element={<VendorSubscriptionsPage />}
                />
                <Route
                  path="/vendor/dashboard/menu"
                  element={<VendorMenuPage />}
                />
                <Route
                  path="/vendor/dashboard/availability"
                  element={<VendorAvailabilityPage />}
                />
                <Route
                  path="/delete-vendor-profile"
                  element={<DeleteVendorProfilePage />}
                />
                <Route
                  path="/vendor/dashboard/cutoff"
                  element={<VendorCutoffPage />}
                />
                <Route
                  path="/vendor/dashboard/pause"
                  element={<VendorPauseShopPage />}
                />
                <Route
                  path="/vendor/dashboard/earnings"
                  element={<VendorEarningsPage />}
                />
                <Route
                  path="/vendor/dashboard/addons"
                  element={<VendorAddonsPage />}
                />
                <Route
                  path="/vendor/dashboard/messages"
                  element={<VendorMessagesPage />}
                />
                <Route
                  path="/vendor/dashboard/broadcast"
                  element={<VendorBroadcastPage />}
                />
                <Route
                  path="/vendor/dashboard/ratings"
                  element={<VendorRatingsPage />}
                />
                <Route
                  path="/vendor/dashboard/churn"
                  element={<VendorChurnPage />}
                />
                <Route
                  path="/vendor/dashboard/analytics"
                  element={<VendorAnalyticsPage />}
                />
                <Route
                  path="/vendor/dashboard/packages"
                  element={<VendorPackagesPage />}
                />
                <Route
                  path="/vendor/dashboard/profile"
                  element={<VendorEditProfilePage />}
                />

                <Route
                  path="/vendor/subscriptions"
                  element={<VendorSubscriptionsOverview />}
                />
                <Route
                  path="/vendor/plans"
                  element={<ManageVendorPlansPage />}
                />
                <Route
                  path="/vendor/plans/create"
                  element={<CreateSubscriptionPlanPage />}
                />
                <Route
                  path="/vendor/plans/:planId"
                  element={<PlanDetailsPage />}
                />
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

                {/* Ads */}
                <Route path="/ads" element={<PurchaseAds />} />
                <Route path="/purchaseAds" element={<PurchaseAds />} />
                <Route path="/ads/details" element={<FetchAdDetails />} />
                <Route path="/fetchAdDetails" element={<FetchAdDetails />} />
                <Route path="/ads/payment" element={<PaymentInitiation />} />
                <Route path="/ads/verify" element={<VerifyTransaction />} />
                <Route
                  path="/verify-transaction"
                  element={<VerifyTransaction />}
                />
                <Route
                  path="/ads/order/success"
                  element={<AdsOrderSuccessPage />}
                />

                {/* AI Chat */}
                <Route path="/lily-chat" element={<LilyChat />} />
                <Route path="/lilyChat" element={<LilyChat />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </FeedProvider>
  );
}

export default App;
