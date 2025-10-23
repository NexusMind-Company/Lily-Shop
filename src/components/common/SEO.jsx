import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SEO = ({
  title = "Lily Shop - Create Your Online Store | AI-Powered E-commerce Platform",
  description = "Create your own virtual store and sell products online without a physical shop. Features AI-powered chatbot support, easy product management, and tools to reach customers worldwide.",
  keywords = "online store, e-commerce platform, virtual shop, AI chatbot, sell online, create store, digital marketplace, business platform, online selling, Lily Shop",
  ogImage = "/lilly-logo.jpg",
  ogUrl,
  type = "website",
  article = null,
}) => {
  const location = useLocation();
  const currentUrl = ogUrl || `https://lilyshop.com${location.pathname}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Lily Shop" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Open Graph Meta Tags */}
      <meta property="og:site_name" content="Lily Shop" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content="Lily Shop - Create Your Online Store" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@LilyShop" />
      <meta name="twitter:creator" content="@LilyShop" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Lily Shop - Create Your Online Store" />

      {/* Article specific meta tags */}
      {article && (
        <>
          <meta property="article:author" content={article.author} />
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:section" content={article.section} />
          {article.tags && article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={currentUrl} />
      
      {/* Favicon */}
      <link rel="icon" type="image/jpeg" href="/lilly-logo.jpg" />
      <link rel="apple-touch-icon" href="/lilly-logo.jpg" />
      
      {/* Preload critical resources */}
      <link rel="preload" href="/lilly-logo.jpg" as="image" />
    </Helmet>
  );
};

export default SEO;