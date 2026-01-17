import { useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { fetchProfile } from "./redux/profileSlice";

// --- Layouts & Common ---
import FeedLayout from "./layouts/feedLayouts";
import ScrollToTop from "./components/common/scrollToTop";
import ProtectedRoute from "./components/common/ProtectedRoute";

// --- Pages: Auth ---
import Login from "./components/auth/login";
import SignUp from "./components/auth/signUp";
import ForgotPassword from "./components/auth/forgotPassword";
import VerifyEmail from "./components/auth/verifyEmail";
import CreateUsername from "./components/auth/createUsername";
import VerifyCode from "./components/auth/verifyCode";

// --- Pages: Feed & Content ---
import Feed from "./pages/feed";
import SearchResults from "./pages/searchResults";
import ProductDetails from "./components/feed/product/productDetails";
import CreateContent from "./pages/createContent";

// --- Pages: Shop ---
import CreateShop from "./pages/createShop";
import MyShop from "./pages/myShop";
import EditShop from "./pages/editShop";
import AddProducts from "./pages/addProducts";
import EditProducts from "./pages/editProducts";
import Products from "./pages/products";
import ShopDetails from "./pages/shopDetails";

// --- Pages: Profile & Social ---
import Profile from "./pages/profile";
import EditProfile from "./pages/editProfile";
import ProfileVisiting from "./pages/profileVisiting";
import Followers from "./pages/followers";
import Following from "./pages/following";
import Inbox from "./pages/inbox";
import ChatPage from "./components/inbox/chatPage";
import Notifications from "./pages/notifications";
import Activity from "./pages/activity";

// --- Pages: Wallet & Payment ---
import Wallet from "./pages/wallet";
import Deposit from "./pages/deposit";
import Withdraw from "./pages/withdraw";
import AddBankAccount from "./pages/addBankAccount";
import BankAccountDetails from "./pages/bankAccountDetails";
import TransactionHistory from "./pages/transaction-history";
import WalletCallback from "./pages/wallet-callback";
import CheckoutPage from "./pages/CheckoutPage";
import ChooseCardPage from "./pages/ChooseCardPage";
// import AddCardPage from "./pages/AddCardPage";
import PaystackCallbackPage from "./pages/PaystackCallbackPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AddAddressPage from "./pages/AddAddressPage";
import ChooseAddressPage from "./pages/chooseAddressPage";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import CartPage from "./pages/CartPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import Receipt from "./pages/reciept";
import ConfirmWithdrawal from "./pages/ConfirmWithdrawal";
import WithdrawSuccess from "./pages/withdrawSuccess";

// --- Pages: Vendor Subscription ---
import VendorSubscriptionPage from "./pages/VendorSubscriptionPage";
import VendorSubscriptionsOverview from "./pages/VendorSubscriptionsOverview";
import ManageVendorPlansPage from "./pages/ManageVendorPlansPage";
import CreateSubscriptionPlanPage from "./pages/CreateSubscriptionPlanPage";
import EditPlanPage from "./pages/EditPlanPage";
import CustomerSubscriptionsPage from "./pages/CustomerSubscriptionsPage";
import MealSelectionPage from "./pages/MealSelectionPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import SubscriptionCallbackPage from "./pages/SubscriptionCallbackPage";

// --- Pages: Settings & Ads ---
import Settings from "./pages/settings";
import ChangePassword from "./pages/ChangePassword";
import DeleteAccount from "./pages/DeleteAccount";
import ChangeDOB from "./pages/ChangeDOB";
import ChangePhone from "./pages/ChangePhone";
import ConfirmPhone from "./pages/ConfirmPhone";
import ChangeUsername from "./pages/ChangeUsername";
import About from "./components/about/About";
import PurchaseAds from "./pages/purchaseAds";
import FetchAdDetails from "./pages/fetchAdDetails";
import PaymentInitiation from "./components/ads/paymentInitiation";
import VerifyTransaction from "./components/ads/verifyTransaction";
import PaymentFailedPage from "./pages/paymentFailedPage";
import PaymentsSuccessPage from "./pages/paymentsSucessPage";

// --- Contexts ---
import { FeedProvider } from "./context/feedContext";
import LilyChat from "./components/ai/lilyChat";

// ScrollToTop component
const ScrollToTopAuto = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <ScrollToTopAuto />
      <ScrollToTop />
      <Toaster position="top-center" />

      <Routes>
        {/* --- Public Routes (Auth) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/create-username" element={<CreateUsername />} />
        <Route path="/verify-code" element={<VerifyCode />} />

        {/* --- Public Feed & Search --- */}
        <Route element={<FeedLayout />}>
          <Route path="/" element={<Feed />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/searchResults" element={<SearchResults />} />
        </Route>

        {/* --- Protected Routes (Require Login) --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<FeedLayout />}>
            {/* Shop */}
            <Route path="/create-shop" element={<CreateShop />} />
            <Route path="/my-shop" element={<MyShop />} />
            <Route path="/edit-shop/:shopId" element={<EditShop />} />
            <Route
              path="/shop/add-products/:shopId"
              element={<AddProducts />}
            />
            <Route
              path="/shop/edit-products/:shopId"
              element={<EditProducts />}
            />
            <Route path="/shop/products/:shopId" element={<Products />} />
            <Route path="/shop/:shopId" element={<ShopDetails />} />
            <Route
              path="/product-details/:productId"
              element={<ProductDetails />}
            />

            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/editProfile" element={<EditProfile />} />
            <Route
              path="/profile/:userId"
              element={<ProfileVisiting />}
            />
            <Route
              path="/profile/:userId/followers"
              element={<Followers />}
            />
            <Route
              path="/profile/:userId/following"
              element={<Following />}
            />

            {/* Content Creation */}
            <Route path="/createContent" element={<CreateContent />} />

            {/* Inbox & Notifications */}
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/activity" element={<Activity />} />

            {/* Wallet & Payments */}
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route
              path="/withdraw/confirm"
              element={<ConfirmWithdrawal />}
            />
            <Route
              path="/withdraw/success"
              element={<WithdrawSuccess />}
            />
            <Route
              path="/add-bank-account"
              element={<AddBankAccount />}
            />
            <Route
              path="/bank-account-details"
              element={<BankAccountDetails />}
            />
            <Route
              path="/transaction-history"
              element={<TransactionHistory />}
            />
            <Route
              path="/payment/callback"
              element={<WalletCallback />}
            />

            {/* Checkout & Orders */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/select-card" element={<ChooseCardPage />} />
            {/* <Route path="/add-card" element={<AddCardPage />} /> */}
            <Route
              path="/payment/paystack-callback"
              element={<PaystackCallbackPage />}
            />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/add-address" element={<AddAddressPage />} />
            <Route
              path="/select-address"
              element={<ChooseAddressPage />}
            />
            <Route path="/order-summary" element={<OrderSummaryPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/order/:orderId" element={<OrderDetailPage />} />
            <Route path="/receipt/:transactionId" element={<Receipt />} />

            {/* Vendor Subscriptions */}
            <Route
              path="/vendor/subscribe"
              element={<VendorSubscriptionPage />}
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
              path="/vendor/plans/edit/:planId"
              element={<EditPlanPage />}
            />

            {/* Customer Subscriptions */}
            <Route
              path="/subscriptions"
              element={<CustomerSubscriptionsPage />}
            />
            <Route
              path="/subscriptions/:subscriptionId/meals"
              element={<MealSelectionPage />}
            />
            <Route
              path="/subscription-success"
              element={<SubscriptionSuccessPage />}
            />
            <Route
              path="/subscription/callback"
              element={<SubscriptionCallbackPage />}
            />

            {/* Settings & Ads */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/change-dob" element={<ChangeDOB />} />
            <Route path="/change-phone" element={<ChangePhone />} />
            <Route path="/confirm-phone" element={<ConfirmPhone />} />
            <Route path="/change-username" element={<ChangeUsername />} />
            <Route path="/about" element={<About />} />

            <Route path="/ads" element={<PurchaseAds />} />
            <Route path="/ads/details" element={<FetchAdDetails />} />
            <Route path="/ads/payment" element={<PaymentInitiation />} />
            <Route path="/ads/verify" element={<VerifyTransaction />} />
            <Route
              path="/payment-failed"
              element={<PaymentFailedPage />}
            />
            <Route
              path="/payment-success"
              element={<PaymentsSuccessPage />}
            />

            {/* AI Chat */}
            <Route path="/lily-chat" element={<LilyChat />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;