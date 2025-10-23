// SEO utility functions

// Generate dynamic meta descriptions based on content
export const generateMetaDescription = (content, maxLength = 160) => {
  if (!content) return '';
  
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  return cleanContent.length > maxLength 
    ? cleanContent.substring(0, maxLength - 3) + '...'
    : cleanContent;
};

// Generate keywords from content
export const generateKeywords = (title, description, tags = []) => {
  const baseKeywords = ['lily shop', 'online store', 'e-commerce'];
  const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
  const descWords = description.toLowerCase().split(' ').filter(word => word.length > 4);
  
  return [...baseKeywords, ...titleWords, ...descWords, ...tags]
    .filter((keyword, index, arr) => arr.indexOf(keyword) === index)
    .slice(0, 15)
    .join(', ');
};

// Generate structured data for products
export const generateProductStructuredData = (product) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Lily Shop"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": product.seller || "Lily Shop"
      }
    }
  };
};

// Generate structured data for shops
export const generateShopStructuredData = (shop) => {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": shop.name,
    "description": shop.description,
    "image": shop.logo,
    "url": `https://lilyshop.com/shop/${shop.id}`,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": shop.country || "US"
    },
    "aggregateRating": shop.rating ? {
      "@type": "AggregateRating",
      "ratingValue": shop.rating,
      "reviewCount": shop.reviewCount || 0
    } : null
  };
};

// Generate Open Graph image URL
export const generateOGImage = (title, description) => {
  // This would typically generate a dynamic OG image
  // For now, return the default logo
  return '/lilly-logo.jpg';
};

// Validate and clean URLs for canonical links
export const generateCanonicalUrl = (path) => {
  const baseUrl = 'https://lilyshop.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};