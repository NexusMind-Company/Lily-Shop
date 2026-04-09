import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { fetchProfile } from "./redux/profileSlice";
import { fetchCart } from "./redux/cartSlice";

import FeedLayout from "./layouts/feedLayouts";
import ScrollToTop from "./components/common/scrollToTop";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleProtectedRoute from "./components/common/RoleProtectedRoute";
import LoaderSd from "./components/loaders/loaderSd";
import { FeedProvider } from "./context/feedContext";
import { ThemeProvider } from "./context/themeContext";
import { FadeTransition } from "./components/common/PageTransition";

const Login = lazy(() => import("./components/auth/login"));
const SignUp = lazy(() => import("./components/auth/signUp"));
const ForgotPassword = lazy(() => import("./components/auth/forgotPassword"));
const VerifyEmail = lazy(() => import("./components/auth/verifyEmail"));
const VerifyCode = lazy(() => import("./components/auth/verifyCode"));
const ResetVerifyCode = lazy(
  () => import("./components/auth/Reset_Password/verifyCode"),
);
const ResetPasswordPage = lazy(
  () => import("./components/auth/Reset_Password/resetPasswordPage"),
);
const Feed = lazy(() => import("./pages/feed"));
const SearchResults = lazy(() => import("./pages/searchResults"));
const VendorsList = lazy(() => import("./pages/VendorsList"));
const FeedProductDetails = lazy(() => import("./pages/feedProductDetails"));
const CreateShop = lazy(() => import("./pages/createShop"));
const MyShop = lazy(() => import("./pages/myShop"));
const ShopDetails = lazy(() => import("./pages/shopDetails"));
const Ratings = lazy(() => import("./components/shop/ratings"));
const EditShop = lazy(() => import("./pages/editShop"));
const AddProducts = lazy(() => import("./pages/addProducts"));
const Profile = lazy(() => import("./pages/profile"));
const ProfileVisiting = lazy(() => import("./pages/profileVisiting"));
const FollowersPage = lazy(() => import("./pages/followers"));
const FollowingPage = lazy(() => import("./pages/following"));
const EditProfile = lazy(() => import("./components/profile/editProfile"));
const VerificationPage = lazy(() => import("./pages/VerificationPage"));
const AccountPage = lazy(() => import("./pages/account"));
const InboxPage = lazy(() => import("./pages/inbox"));
const ChatPage = lazy(() => import("./components/inbox/chatPage"));
const NotificationPage = lazy(() => import("./pages/notifications"));
const ActivityPage = lazy(() => import("./pages/activity"));
const Wallet = lazy(() => import("./pages/wallet"));
const Deposit = lazy(() => import("./pages/deposit"));
const Withdraw = lazy(() => import("./pages/withdraw"));
const ConfirmWithdrawal = lazy(() => import("./pages/ConfirmWithdrawal"));
const WithdrawSuccess = lazy(() => import("./pages/withdrawSuccess"));
const WalletTopUpPage = lazy(() => import("./pages/WalletTopUpPage"));
const WalletCallbackPage = lazy(() => import("./pages/wallet-callback"));
const TransactionHistoryPage = lazy(
  () => import("./pages/transaction-history"),
);
const CartPage = lazy(() => import("./pages/CartPage"));
const OrderSummaryPage = lazy(() => import("./pages/OrderSummaryPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const VendorSubscriptionPage = lazy(
  () => import("./pages/VendorSubscriptionPage"),
);
const VendorSubscriptionsOverview = lazy(
  () => import("./pages/VendorSubscriptionsOverview"),
);
const ManageVendorPlansPage = lazy(
  () => import("./pages/ManageVendorPlansPage"),
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
const UserSubscriptionPage = lazy(
  () => import("./pages/UserSubscriptionPage"),
);
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
const Settings = lazy(() => import("./pages/settings"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePassword"));
const DeleteAccountPage = lazy(() => import("./pages/DeleteAccount"));
const PasswordModalPage = lazy(() => import("./pages/PasswordModalPage"));
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
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));

const ScrollToTopAuto = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const RouteFallback = () => <LoaderSd />;

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <ThemeProvider>
      <FeedProvider>
        <ScrollToTopAuto />
        <ScrollToTop />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }}
        />

        <Suspense fallback={<RouteFallback />}>
          <FadeTransition>
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
            <Route element={<FeedLayout />}>
              <Route path="/" element={<Feed />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/searchResults" element={<SearchResults />} />

              <Route path="/product/:id" element={<FeedProductDetails />} />
              <Route
                path="/product-details/:id"
                element={<FeedProductDetails />}
              />

              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="add-address" element={<AddAddressPage />} />
              <Route path="add-card" element={<AddCardPage />} />
              <Route
                path="choose-pickup"
                element={<ChoosePickupAddressPage />}
              />
              <Route path="choose-card" element={<ChooseCardPage />} />
              <Route path="choose-address" element={<ChooseAddressPage />} />

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

              <Route
                path="/vendor-subscription/:vendorId"
                element={<VendorSubscriptionPage />}
              />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />

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
              <Route path="/about" element={<About />} />

              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/chat/:conversationId" element={<ChatPage />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/activity" element={<ActivityPage />} />

              <Route path="/wallet" element={<Wallet />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/withdraw/confirm" element={<ConfirmWithdrawal />} />
              <Route path="/withdraw/success" element={<WithdrawSuccess />} />
              <Route path="/wallet/topup" element={<WalletTopUpPage />} />
              <Route
                path="/wallet/callback"
                element={<WalletCallbackPage />}
              />
              <Route
                path="/transaction-history"
                element={<TransactionHistoryPage />}
              />

              <Route path="/order-summary" element={<OrderSummaryPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/order/:orderId" element={<OrderDetailPage />} />

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
                path="/subscription/payment/:planId"
                element={<SubscriptionPaymentPage />}
              />
              <Route
                path="/subscription/processing"
                element={<SubscriptionProcessingPage />}
              />

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

              <Route path="/settings" element={<Settings />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/ChangePassword" element={<ChangePasswordPage />} />
              <Route path="/delete-account" element={<DeleteAccountPage />} />
              <Route path="/DeleteAccount" element={<DeleteAccountPage />} />
              <Route path="/password" element={<PasswordModalPage />} />
            </Route>

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
              <Route path="/payment-failed" element={<PaymentFailedPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />

              <Route path="/lily-chat" element={<LilyChat />} />
              <Route path="/lilyChat" element={<LilyChat />} />
            </Route>
          </Route>
        </Routes>
          </FadeTransition>
        </Suspense>
      </FeedProvider>
    </ThemeProvider>
  );
}

export default App;
