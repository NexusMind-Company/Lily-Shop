import SEO from './SEO';

// Page-specific SEO configurations
export const pageSEOConfig = {
  home: {
    title: "Lily Shop - Create Your Online Store | AI-Powered E-commerce Platform",
    description: "Start selling online today! Create your virtual store without a physical shop. Features AI chatbot support, easy product management, and global reach.",
    keywords: "create online store, e-commerce platform, virtual shop, AI chatbot, sell online, digital marketplace, business platform"
  },
  
  shops: {
    title: "Browse Shops - Lily Shop | Discover Online Stores",
    description: "Discover amazing online stores and products from entrepreneurs worldwide. Browse categories, find unique items, and support small businesses.",
    keywords: "online shops, browse stores, discover products, small business, marketplace, shopping"
  },
  
  createShop: {
    title: "Create Your Shop - Lily Shop | Start Selling Online",
    description: "Launch your online business in minutes. Create your virtual store, add products, and start selling with our AI-powered platform.",
    keywords: "create shop, start business, online store builder, e-commerce setup, sell products online"
  },
  
  login: {
    title: "Login - Lily Shop | Access Your Store",
    description: "Login to your Lily Shop account to manage your store, track orders, and grow your online business.",
    keywords: "login, sign in, account access, store management"
  },
  
  signup: {
    title: "Sign Up - Lily Shop | Join Our Platform",
    description: "Join thousands of entrepreneurs selling online. Create your free account and start building your virtual store today.",
    keywords: "sign up, register, create account, join platform, start selling"
  },
  
  about: {
    title: "About Us - Lily Shop | Empowering Online Businesses",
    description: "Learn about Lily Shop's mission to empower businesses to sell online easily with AI-powered tools and comprehensive e-commerce solutions.",
    keywords: "about lily shop, company info, mission, e-commerce platform, online business tools"
  }
};

// Component for easy page-specific SEO implementation
const PageSEO = ({ page, customTitle, customDescription, customKeywords, ...props }) => {
  const config = pageSEOConfig[page] || pageSEOConfig.home;
  
  return (
    <SEO
      title={customTitle || config.title}
      description={customDescription || config.description}
      keywords={customKeywords || config.keywords}
      {...props}
    />
  );
};

export default PageSEO;