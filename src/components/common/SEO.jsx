import { Helmet } from "react-helmet-async";

const SEO = ({
  title = "Lily Shops - Your Local Marketplace",
  description = "Discover local shops and businesses in your area. Browse through a curated list of shops, view their products, and connect with shop owners.",
  keywords = "local shops, marketplace, shopping, local businesses, Lily Shops",
  ogImage = "/path-to-your-default-og-image.jpg", // You'll need to add this image
  ogUrl = "https://lilyshops.com", // Replace with your actual domain
  type = "website",
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={ogUrl} />
    </Helmet>
  );
};

export default SEO;
