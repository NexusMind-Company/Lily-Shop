import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SEO = ({
  title = "Lily Shop - Turn Every Scroll into a Purchase | Social Commerce for Nigerian Creators",
  description = "Turn every scroll into a purchase. Discover creators, shop real products from real people, and support small businesses in Nigeria. Lily Shop is the easiest way for creators and vendors to sell online and earn money through social commerce.",
  keywords = [
    "social commerce",
    "buy from real people",
    "marketplace",
    "sell online",
    "creator",
    "vendors",
    "online shopping",
    "earn money as a creator in Nigeria",
    "where to sell handmade products in Nigeria",
    "Nigerian vendors online store",
    "how to make money in Nigeria",
    "social media app Nigeria",
    "shop products from creators",
    "small businesses in Nigeria",
    "support local vendors",
    "how to sell online",
    "real products from real people",
    "best app for Nigerian creators",
    "how to make money online",
    "best websites for creators",
  ].join(", "),
  ogImage = "/lily-logo.jpg",
  ogUrl,
  type = "website",
}) => {
  const location = useLocation();
  const currentUrl = ogUrl || `https://lilyshop.com${location.pathname}`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lily Shop",
    url: "https://lilyshop.com",
    description:
      "Discover creators, shop authentic products, and sell online easily. Lily Shop connects Nigerian creators and vendors with buyers through a social commerce experience.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://lilyshop.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

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
      <meta property="og:image:alt" content="Lily Shop - Social Commerce Platform" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_NG" />

      {/* SEO Indexing */}
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={currentUrl} />

      {/* Favicon */}
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Preload */}
      <link rel="preload" href="/lily-logo.jpg" as="image" />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
};

/* ✅ PropTypes Validation */
SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  ogImage: PropTypes.string,
  ogUrl: PropTypes.string,
  type: PropTypes.string,
  article: PropTypes.shape({
    author: PropTypes.string,
    publishedTime: PropTypes.string,
    modifiedTime: PropTypes.string,
    section: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default SEO;
