import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
import ResetVerifyCode from "./components/auth/Reset_Password/verifyCode";
import ResetPasswordPage from "./components/auth/Reset_Password/resetPasswordPage";

// --- Pages: Feed & Content ---
import Feed from "./pages/feed";
import SearchResults from "./pages/searchResults";
import ProductDetails from "./components/feed/product/productDetails";
import FeedProductDetails from "./pages/feedProductDetails";
import CreateContentPage from "./pages/createContent"; 

// --- Pages: Shop ---
import CreateShop from "./pages/createShop";
import MyShop from "./pages/myShop";
import EditShop from "./pages/editShop";
import AddProducts from "./pages/addProducts";
import EditProducts from "./pages/editProducts";
import Products from "./pages/products";
import ShopDetails from "./pages/shopDetails";
import Ratings from "./components/shop/ratings";
import Step1 from "./components/ads/step1";

// --- Pages: Profile & Social ---
import Profile from "./pages/profile";
import EditProfilePage from "./pages/editProfile"; 
import ProfileVisiting from "./pages/profileVisiting";
import FollowersPage from "./pages/followers"; 
import FollowingPage from "./pages/following"; 
import InboxPage from "./pages/inbox"; 
import ChatPage from "./components/inbox/chatPage";
import NotificationPage from "./pages/notifications"; 
import ActivityPage from "./pages/activity"; 
import UploadProfilePic from "./components/auth/optionalAuthFeats/uploadProfilePic";
import BirthdayPicker from "./components/auth/optionalAuthFeats/birthdayPicker";
import Account from "./pages/account";

// --- Pages: Wallet & Payment ---
import WalletPage from "./pages/wallet"; 
import DepositPage from "./pages/deposit"; 
import WithdrawPage from "./pages/withdraw"; 
import AddBankAccountPage from "./pages/addBankAccount"; 
import BankAccountDetailsPage from "./pages/bankAccountDetails"; 
import TransactionHistory from "./pages/transaction-history";
import WalletCallbackPage from "./pages/wallet-callback"; 
import CheckoutPage from "./pages/CheckoutPage";
import ChooseCardPage from "./pages/ChooseCardPage";
import PaystackCallbackPage from "./pages/PaystackCallbackPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AddAddressPage from "./pages/AddAddressPage";
import ChooseAddressPage from "./pages/chooseAddressPage";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import CartPage from "./pages/CartPage";
import Cart from "./pages/cart";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ReceiptPage from "./pages/reciept"; 
import ConfirmWithdrawal from "./pages/ConfirmWithdrawal";
import WithdrawSuccessPage from "./pages/withdrawSuccess"; 
import OrdersPage from "./pages/orders";
import PickupAddressPage from "./pages/PickupAddressPage.jsx";
import PasswordModalPage from "./pages/PasswordModalPage";
import BankTransferPage from "./pages/BankTransferPage";
import PaymentLoadingPage from "./pages/paymentLoading";

// --- Pages: Vendor Subscription ---
import VendorSubscriptionPage from "./pages/VendorSubscriptionPage";
import VendorSubscriptionsOverview from "./pages/VendorSubscriptionsOverview";
import ManageVendorPlansPage from "./pages/ManageVendorPlansPage";
import CreateSubscriptionPlanPage from "./pages/CreateSubscriptionPlanPage";
import CreateMealPlanPage from "./pages/CreateMealPlanPage";
import EditPlanPage from "./pages/EditPlanPage";
import CreateSubscriptionVendorPage from "./pages/createSubscriptionVendor";
import CustomerSubscriptionsPage from "./pages/CustomerSubscriptionsPage";
import MealSelectionPage from "./pages/MealSelectionPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import SubscriptionCallbackPage from "./pages/SubscriptionCallbackPage";
import VendorDashboard from "./pages/VendorDashboard";

// --- Pages: Settings & Ads ---
import Settings from "./pages/settings";
import ChangePasswordPage from "./pages/ChangePassword"; 
import DeleteAccountPage from "./pages/DeleteAccount"; 
import ChangeDOBPage from "./pages/ChangeDOB"; 
import ChangePhonePage from "./pages/ChangePhone"; 
import ConfirmPhonePage from "./pages/ConfirmPhone"; 
import ChangeUsernamePage from "./pages/ChangeUsername"; 
import About from "./components/about/About";
import PurchaseAds from "./pages/purchaseAds";
import FetchAdDetails from "./pages/fetchAdDetails";
import PaymentInitiation from "./components/ads/paymentInitiation";
import VerifyTransaction from "./components/ads/verifyTransaction";
import PaymentFailedPage from "./pages/paymentFailedPage";
import PaymentSuccessPage from "./pages/paymentsSucessPage"; 

import VerificationPage from "./pages/VerificationPage";
import Messages from "./pages/messages";

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
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <FeedProvider>
      <ScrollToTopAuto />
      <ScrollToTop />
      <Toaster position="top-center" />

      <FeedProvider>
        <Routes>
          <Route element={<FeedLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Feed />} />
            <Route
              path="/product-details/:id"
              element={<FeedProductDetails />}
            />
            <Route path="/checkout" element={<Cart />} />
          </Route>
          <Route path="/myShop" element={<MyShop />} />
          <Route path="/rating" element={<Ratings />} />
          <Route path="/createShop" element={<CreateShop />} />
          <Route
            path="/createSubscriptionVendor"
            element={<CreateSubscriptionVendorPage />}
          />
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
          <Route path="/createContent" element={<CreateContentPage />} />
          <Route path="/purchaseAds" element={<PurchaseAds />} />
          <Route path="/shop/:shop_id/step1" element={<Step1 />} />
          <Route
            path="/shop/:shop_id/paymentInitiation"
            element={<PaymentInitiation />}
          />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/searchResults" element={<SearchResults />} />
          <Route path="/editShop/:shop_id/edit-shop" element={<EditShop />} />
          <Route path="/shop/:shop_id/products" element={<Products />} />
          <Route path="/shop/:shop_id/add-products" element={<AddProducts />} />
          <Route
            path="/shop/:product_id/edit-products"
            element={<EditProducts />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<ProfileVisiting />} />
          <Route path="/lilyChat" element={<LilyChat />} />
          <Route path="/fetchAdDetails" element={<FetchAdDetails />} />
          <Route path="/account" element={<Account />} />
          <Route path="/verify-transaction" element={<VerifyTransaction />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/withdraw" element={<WithdrawPage />} />
          <Route path="/addBankAccount" element={<AddBankAccountPage />} />
          <Route
            path="/bankAccountDetails"
            element={<BankAccountDetailsPage />}
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
            element={<VendorDashboard vendorId={user?.id} />}
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
          <Route
            path="/subscription/create-meal-plan"
            element={<CreateMealPlanPage />}
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
      <Routes>
        {/* --- Public Routes (Auth) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/create-username" element={<CreateUsername />} />
        <Route path="/verify-code" element={<VerifyCode />} />

        {/* --- Protected Routes (Require Login) --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<FeedLayout />}>
            <Route path="/" element={<Feed />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/searchResults" element={<SearchResults />} />

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
            <Route path="/product/:id" element={<ProductDetails />} />

            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/editProfile" element={<EditProfilePage />} />
            
            <Route path="/verify" element={<VerificationPage />} />
            <Route
              path="/profile/:userId"
              element={<ProfileVisiting />}
            />
            <Route
              path="/profile/:userId/followers"
              element={<FollowersPage />}
            />
            <Route
              path="/profile/:userId/following"
              element={<FollowingPage />}
            />

            {/* Content Creation */}
            <Route path="/createContent" element={<CreateContentPage />} />

            {/* Inbox & Notifications */}
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/activity" element={<ActivityPage />} />

            {/* Wallet & Payments */}
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route
              path="/withdraw/confirm"
              element={<ConfirmWithdrawal />}
            />
            <Route
              path="/withdraw/success"
              element={<WithdrawSuccessPage />}
            />
            <Route
              path="/add-bank-account"
              element={<AddBankAccountPage />}
            />
            <Route
              path="/bank-account-details"
              element={<BankAccountDetailsPage />}
            />
            <Route
              path="/transaction-history"
              element={<TransactionHistory />}
            />
            <Route
              path="/payment/callback"
              element={<WalletCallbackPage />}
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
            <Route path="/receipt/:transactionId" element={<ReceiptPage />} />

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
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/delete-account" element={<DeleteAccountPage />} />
            <Route path="/change-dob" element={<ChangeDOBPage />} />
            <Route path="/change-phone" element={<ChangePhonePage />} />
            <Route path="/confirm-phone" element={<ConfirmPhonePage />} />
            <Route path="/change-username" element={<ChangeUsernamePage />} />
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
              element={<PaymentSuccessPage />}
            />

            {/* AI Chat */}
            <Route path="/lily-chat" element={<LilyChat />} />
          </Route>
        </Route>
      </Routes>
    </FeedProvider>
  );
};

export default App;