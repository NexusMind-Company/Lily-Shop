import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import SEO from "./SEO";

// ✅ Page-specific SEO configurations
export const pageSEOConfig = {
  feed: {
    title:
      "Lily Shop - Turn Every Scroll into a Purchase | Shop Products from Real People",
    description:
      "Turn every scroll into a purchase. Discover Nigerian creators, explore authentic products, and support small businesses directly from your feed. Lily Shop makes social commerce easy for creators and buyers.",
    keywords:
      "social commerce, buy from real people, online shopping Nigeria, shop from creators, Nigerian marketplace, sell online, creators Nigeria, small business, make money online, support vendors, best app for creators",
  },

  profile: {
    title: "Profile - Lily Shop | Discover and Connect with Creators",
    description:
      "View and manage your creator profile on Lily Shop. Showcase your products, connect with followers, and grow your brand in Nigeria’s social commerce community.",
    keywords:
      "creator profile, online shop Nigeria, seller account, creator page, social commerce Nigeria, vendor profile, sell online, creator store",
  },

  shops: {
    title: "Discover Shops - Lily Shop | Real Products from Real People",
    description:
      "Explore authentic shops and products from Nigerian creators, artisans, and local vendors. Support small businesses and shop directly from real people.",
    keywords:
      "browse shops, online stores Nigeria, discover creators, shop from real people, small business marketplace, Nigerian vendors, handmade products, shop local, online shopping Nigeria",
  },

  createShop: {
    title: "Create Your Shop - Lily Shop | Sell Products Online in Nigeria",
    description:
      "Start selling online today! Create your shop on Lily Shop and reach buyers through social commerce. Perfect for creators, vendors, and small businesses in Nigeria.",
    keywords:
      "create online shop, sell products online, start business Nigeria, online store builder, social commerce, e-commerce setup, earn money as a creator, sell handmade products in Nigeria",
  },

  products: {
    title: "Products - Lily Shop | Discover and Buy Authentic Nigerian Goods",
    description:
      "Shop trending products from real creators on Lily Shop. Explore fashion, art, beauty, and handmade goods directly from verified Nigerian vendors.",
    keywords:
      "products, shop items, buy online Nigeria, authentic goods, handmade items, discover products, local vendors, social shopping, marketplace Nigeria, real creators",
  },

  wallet: {
    title: "Wallet - Lily Shop | Manage Earnings and Transactions",
    description:
      "Access your Lily Shop wallet to view earnings, manage payouts, and track transaction history. Empowering Nigerian creators to make money online easily.",
    keywords:
      "wallet, earnings, payouts, transactions, creator income, make money online Nigeria, vendor wallet, e-commerce payments, social commerce Nigeria",
  },

  cart: {
    title: "Cart - Lily Shop | Review and Checkout Securely",
    description:
      "Review your selected items and complete secure payments on Lily Shop. Shop confidently from Nigerian creators and support real people.",
    keywords:
      "cart, checkout, online shopping, secure payment, buy products, social commerce Nigeria, shopping bag, ecommerce checkout, support creators",
  },

  login: {
    title: "Login - Lily Shop | Manage Your Online Store",
    description:
      "Login to your Lily Shop account to manage products, track orders, and grow your online business. Connect with buyers and scale your brand.",
    keywords:
      "login, account access, store management, seller login, vendor account, e-commerce dashboard, online store Nigeria",
  },

  signup: {
    title: "Sign Up - Lily Shop | Join the Social Commerce Revolution",
    description:
      "Join thousands of Nigerian creators and vendors making money online. Create your free Lily Shop account and start selling real products from your feed.",
    keywords:
      "sign up, register, create account, join platform, make money online Nigeria, social commerce app, become a creator, sell online",
  },

  about: {
    title:
      "About Lily Shop | Empowering Nigerian Creators and Small Businesses",
    description:
      "Lily Shop is a social commerce platform that empowers Nigerian creators and small businesses to sell online easily. Discover, connect, and grow your brand in the digital economy.",
    keywords:
      "about Lily Shop, Nigerian creators, e-commerce platform, social commerce Nigeria, support small business, online selling tools, digital marketplace",
  },

  settings: {
    title: "Settings - Lily Shop | Manage Your Store and Preferences",
    description:
      "Customize your store settings, manage preferences, and optimize your online selling experience. Take control of your Lily Shop creator journey.",
    keywords:
      "store settings, account management, e-commerce dashboard, online shop settings, creator tools Nigeria, vendor preferences",
  },

  inbox: {
    title: "Inbox - Lily Shop | Connect and Chat with Buyers & Sellers",
    description:
      "Access your Lily Shop inbox to chat with buyers, sellers, and creators. Stay connected and manage your social commerce conversations all in one place.",
    keywords:
      "inbox, chat, messages, buyer communication, seller chat, social commerce conversations, Nigerian marketplace messaging",
  },

  messages: {
    title: "Messages - Lily Shop | Continue Your Conversations Seamlessly",
    description:
      "Manage your ongoing messages with buyers and creators. Stay responsive and build trust with your audience through real-time chat.",
    keywords:
      "messages, chat, communication, seller messages, buyer chat, social commerce Nigeria, live messaging, customer support",
  },

  orders: {
    title: "Orders - Lily Shop | Track and Manage Purchases",
    description:
      "View your order history and track current purchases on Lily Shop. Stay updated on your transactions with Nigerian creators and sellers.",
    keywords:
      "orders, track purchases, order history, buy products online Nigeria, customer orders, delivery tracking, e-commerce transactions",
  },

  receipt: {
    title: "Receipt - Lily Shop | Payment and Transaction Details",
    description:
      "View your official Lily Shop receipt for completed orders and transactions. Keep accurate records of your online purchases and sales.",
    keywords:
      "receipt, transaction details, payment confirmation, order receipt, online shopping proof, Nigerian marketplace transactions",
  },

  deposit: {
    title: "Deposit - Lily Shop | Fund Your Wallet Securely",
    description:
      "Add funds to your Lily Shop wallet securely using multiple payment methods. Start shopping or paying vendors instantly within the app.",
    keywords:
      "deposit, fund wallet, add money, secure payment, top up wallet, e-commerce Nigeria, creator wallet deposit, online payments",
  },

  withdraw: {
    title: "Withdraw - Lily Shop | Cash Out Your Earnings",
    description:
      "Withdraw your Lily Shop earnings directly to your bank account safely and easily. Empowering Nigerian creators to access their funds instantly.",
    keywords:
      "withdraw, cash out, earnings, vendor payout, money transfer, creator wallet withdrawal, social commerce Nigeria, online income",
  },

  "transaction-history": {
    title: "Transaction History - Lily Shop | Monitor Your Financial Activity",
    description:
      "Review your complete transaction history on Lily Shop. Track deposits, withdrawals, sales, and payouts in one convenient dashboard.",
    keywords:
      "transaction history, wallet records, payment log, sales report, e-commerce transactions, financial tracking, creator payments, online income Nigeria",
  },
};

// ✅ Auto-detect route and render matching SEO
const PageSEO = ({
  customTitle,
  customDescription,
  customKeywords,
  creatorName,
  shopName,
  ...props
}) => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Route detection
  let detectedPage = "feed";
  if (path === "/" || path.includes("/feed")) detectedPage = "feed";
  else if (path.includes("/profile")) detectedPage = "profile";
  else if (path.includes("/shops")) detectedPage = "shops";
  else if (path.includes("/create-shop") || path.includes("/createshop"))
    detectedPage = "createShop";
  else if (path.includes("/products")) detectedPage = "products";
  else if (path.includes("/wallet")) detectedPage = "wallet";
  else if (path.includes("/cart")) detectedPage = "cart";
  else if (path.includes("/login")) detectedPage = "login";
  else if (path.includes("/signup") || path.includes("/sign-up"))
    detectedPage = "signup";
  else if (path.includes("/about")) detectedPage = "about";
  else if (path.includes("/settings")) detectedPage = "settings";
  else if (path.includes("/inbox")) detectedPage = "inbox";
  else if (path.includes("/messages")) detectedPage = "messages";
  else if (path.includes("/orders")) detectedPage = "orders";
  else if (path.includes("/receipt")) detectedPage = "receipt";
  else if (path.includes("/deposit")) detectedPage = "deposit";
  else if (path.includes("/withdraw")) detectedPage = "withdraw";
  else if (path.includes("/transaction-history"))
    detectedPage = "transaction-history";

  let config = pageSEOConfig[detectedPage] || pageSEOConfig.feed;

  // Dynamic titles for profile or shop
  if (detectedPage === "profile" && creatorName) {
    config = {
      ...config,
      title: `${creatorName}'s Shop – Lily Shop | Discover and Connect with Creators`,
      description: `Explore ${creatorName}'s products and collections on Lily Shop. Shop directly from creators and support local Nigerian entrepreneurs.`,
    };
  }

  if (detectedPage === "shops" && shopName) {
    config = {
      ...config,
      title: `Shop at ${shopName} – Lily Shop | Real Products from Real People`,
      description: `Discover unique products from ${shopName} on Lily Shop. Buy directly from trusted creators and vendors across Nigeria.`,
    };
  }

  return (
    <SEO
      title={customTitle || config.title}
      description={customDescription || config.description}
      keywords={customKeywords || config.keywords}
      {...props}
    />
  );
};

// ✅ PropTypes validation
PageSEO.propTypes = {
  customTitle: PropTypes.string,
  customDescription: PropTypes.string,
  customKeywords: PropTypes.string,
  creatorName: PropTypes.string,
  shopName: PropTypes.string,
};

export default PageSEO;
