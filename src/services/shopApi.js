import { api } from "./api";
import * as apiService from "./api";

// ==================== SHOP ENDPOINTS ====================

/**
 * Fetch all shops with optional filters
 * @param {Object} params - Query parameters (category, user_id, search)
 */
export const fetchShops = async (params = {}) => {
  const response = await api.get("/shops/", { params });
  return response.data;
};

/**
 * Fetch a single shop by ID
 * @param {string} shopId - Shop UUID
 */
export const fetchShopById = async (shopId) => {
  const response = await api.get(`/shops/${shopId}/`);
  return response.data;
};

/**
 * Create a new shop
 * @param {FormData} formData - Shop data with image
 */
export const createShop = async (formData) => {
  const response = await api.post("/shops/", formData);
  return response.data;
};

/**
 * Update an existing shop
 * @param {string} shopId - Shop UUID
 * @param {FormData} formData - Updated shop data
 */
export const updateShop = async (shopId, formData) => {
  const response = await api.put(`/shops/${shopId}/update/`, formData);
  return response.data;
};

/**
 * Delete a shop
 * @param {string} shopId - Shop UUID
 */
export const deleteShop = async (shopId) => {
  const response = await api.delete(`/shops/${shopId}/delete/`);
  return response.data;
};

/**
 * Toggle follow/unfollow a shop
 * @param {string} shopId - Shop UUID
 */
export const toggleFollowShop = apiService.toggleFollowShop;

// ==================== PRODUCT ENDPOINTS ====================

/**
 * Fetch all products for a shop
 * @param {string} shopId - Shop UUID
 */
export const fetchShopProducts = apiService.fetchShopProducts;

/**
 * Fetch a single product
 * @param {string} productId - Product UUID
 */
export const fetchProductById = async (productId) => {
  const response = await api.get(`/shops/products/${productId}/`);
  return response.data;
};

/**
 * Create a new product
 * @param {FormData} formData - Product data with media
 */
export const createProduct = async (formData) => {
  const response = await api.post("/shops/products/create/", formData);
  return response.data;
};

/**
 * Batch create products for a shop
 * @param {string} shopId - Shop UUID
 * @param {FormData} formData - Products data with images
 */
export const batchCreateProducts = async (shopId, formData) => {
  const response = await api.post(
    `/shops/${shopId}/products/batch-create/`,
    formData,
  );
  return response.data;
};

/**
 * Update a product
 * @param {string} productId - Product UUID
 * @param {FormData} formData - Updated product data
 */
export const updateProduct = async (productId, formData) => {
  const response = await api.put(
    `/shops/products/${productId}/update/`,
    formData,
  );
  return response.data;
};

/**
 * Delete a product
 * @param {string} productId - Product UUID
 */
export const deleteProduct = async (productId) => {
  const response = await api.delete(`/shops/products/${productId}/delete/`);
  return response.data;
};

/**
 * Toggle like/unlike a product
 * @param {string} productId - Product UUID
 */
export const toggleProductLike = async (productId) => {
  const response = await api.post(`/shops/products/${productId}/like/`, {});
  return response.data;
};

/**
 * Fetch user's liked products
 */
export const fetchLikedProducts = apiService.fetchLikedProducts;

/**
 * Fetch nearby products
 * @param {Object} params - { radius, lat, lon }
 */
export const fetchNearbyProducts = async (params = {}) => {
  const response = await api.get("/shops/products/nearby/", { params });
  return response.data;
};

// ==================== COMMENT ENDPOINTS ====================

/**
 * Fetch comments for a product
 * @param {string} productId - Product UUID
 * @param {Object} params - Pagination params
 */
export const fetchProductComments = apiService.fetchProductComments;

/**
 * Create a comment on a product
 * @param {string} productId - Product UUID
 * @param {Object} data - { comment_text, parent }
 */
export const createProductComment = async (productId, data) => {
  const response = await api.post(
    `/shops/products/${productId}/comment-create/`,
    data,
  );
  return response.data;
};

/**
 * Delete a product comment
 * @param {string} commentId - Comment UUID
 */
export const deleteProductComment = apiService.deleteProductComment;

/**
 * Toggle like on a product comment
 * @param {string} commentId - Comment UUID
 */
export const toggleProductCommentLike = async (commentId) => {
  const response = await api.post(
    `/shops/product-comments/${commentId}/like/`,
    {},
  );
  return response.data;
};

// ==================== CONTENT ENDPOINTS ====================

/**
 * Fetch all content posts
 * @param {Object} params - Query parameters
 */
export const fetchContents = async (params = {}) => {
  const response = await api.get("/shops/contents/", { params });
  return response.data;
};

/**
 * Fetch a single content post
 * @param {string} contentId - Content UUID
 */
export const fetchContentById = apiService.fetchContentById;

/**
 * Create a new content post
 * @param {FormData} formData - Content data with media
 */
export const createContent = async (formData) => {
  const response = await api.post("/shops/contents/create/", formData);
  return response.data;
};

/**
 * Update a content post
 * @param {string} contentId - Content UUID
 * @param {FormData} formData - Updated content data
 */
export const updateContent = async (contentId, formData) => {
  const response = await api.put(
    `/shops/contents/${contentId}/update/`,
    formData,
  );
  return response.data;
};

/**
 * Delete a content post
 * @param {string} contentId - Content UUID
 */
export const deleteContent = async (contentId) => {
  const response = await api.delete(`/shops/contents/${contentId}/delete/`);
  return response.data;
};

/**
 * Toggle like/unlike a content post
 * @param {string} contentId - Content UUID
 */
export const toggleContentLike = async (contentId) => {
  const response = await api.post(`/shops/contents/${contentId}/like/`, {});
  return response.data;
};

/**
 * Fetch user's liked content posts
 */
export const fetchLikedContents = async () => {
  const response = await api.get("/shops/my-liked-contents/");
  return response.data;
};

/**
 * Fetch comments for a content post
 * @param {string} contentId - Content UUID
 * @param {Object} params - Pagination params
 */
export const fetchContentComments = apiService.fetchContentComments;

/**
 * Create a comment on a content post
 * @param {string} contentId - Content UUID
 * @param {Object} data - { comment_text, parent }
 */
export const createContentComment = async (contentId, data) => {
  const response = await api.post(
    `/shops/contents/${contentId}/comment-create/`,
    data,
  );
  return response.data;
};

/**
 * Delete a content comment
 * @param {string} commentId - Comment UUID
 */
export const deleteContentComment = apiService.deleteContentComment;

/**
 * Toggle like on a content comment
 * @param {string} commentId - Comment UUID
 */
export const toggleContentCommentLike = async (commentId) => {
  const response = await api.post(
    `/shops/content-comments/${commentId}/like/`,
    {},
  );
  return response.data;
};

// ==================== FEED ENDPOINTS ====================

/**
 * Fetch personalized home feed
 * @param {Object} params - { lat, lon }
 */
export const fetchHomeFeed = async (params = {}) => {
  const response = await api.get("/shops/home/", { params });
  return response.data;
};

/**
 * Fetch all feed (products + content)
 * @param {Object} params - { search }
 */
export const fetchAllFeed = apiService.fetchAllFeed;

// ==================== REVIEW ENDPOINTS ====================

/**
 * Fetch reviews for a shop
 * @param {string} shopId - Shop UUID
 * @param {Object} params - Query params
 */
export const fetchShopReviews = async (shopId, params = {}) => {
  const response = await api.get(`/shops/${shopId}/reviews/`, { params });
  return response.data;
};

/**
 * Create a review for a shop
 * @param {Object} data - { shop_id, rating, comment }
 */
export const createReview = async (data) => {
  const response = await api.post("/shops/reviews/create/", data);
  return response.data;
};

/**
 * Fetch a specific review
 * @param {string} reviewId - Review UUID
 */
export const fetchReviewById = async (reviewId) => {
  const response = await api.get(`/shops/reviews/${reviewId}/`);
  return response.data;
};

/**
 * Update a review
 * @param {string} reviewId - Review UUID
 * @param {Object} data - { rating, comment }
 */
export const updateReview = apiService.updateReview;

/**
 * Partially update a review
 * @param {string} reviewId - Review UUID
 * @param {Object} data - { rating?, comment? }
 */
export const partialUpdateReview = apiService.partialUpdateReview;

/**
 * Delete a review
 * @param {string} reviewId - Review UUID
 */
export const deleteReview = apiService.deleteReview;

/**
 * Toggle like on a review
 * @param {string} reviewId - Review UUID
 */
export const toggleReviewLike = async (reviewId) => {
  const response = await api.post(
    `/shops/reviews/${reviewId}/like-toggle/`,
    {},
  );
  return response.data;
};

/**
 * Fetch user's reviews
 */
export const fetchUserReviews = async () => {
  const response = await api.get("/shops/user/reviews/");
  return response.data;
};

// ==================== SHIPPING PROFILE ENDPOINTS ====================

/**
 * Fetch all shipping profiles for the vendor
 */
export const fetchShippingProfiles = async () => {
  const response = await api.get("/shops/shipping-profiles/");
  return response.data;
};

/**
 * Create a new shipping profile template
 * @param {Object} data - Shipping profile data
 */
export const createShippingProfile = async (data) => {
  const response = await api.post("/shops/shipping-profiles/", data);
  return response.data;
};

/**
 * Update an existing shipping profile template
 * @param {string} id - Profile UUID
 * @param {Object} data - Updated shipping profile data
 */
export const updateShippingProfile = async (id, data) => {
  const response = await api.put(`/shops/shipping-profiles/${id}/`, data);
  return response.data;
};

/**
 * Delete a shipping profile template
 * @param {string} id - Profile UUID
 */
export const deleteShippingProfile = async (id) => {
  const response = await api.delete(`/shops/shipping-profiles/${id}/`);
  return response.data;
};

/**
 * Resolve the correct delivery zone + fee for a product given a buyer's address
 * @param {Object} data - { product_id, buyer_country, buyer_state }
 */
export const getDeliveryQuote = async (data) => {
  const response = await api.post("/shops/delivery-quote/", data);
  return response.data;
};

export default {
  // Shipping Profiles
  fetchShippingProfiles,
  createShippingProfile,
  updateShippingProfile,
  deleteShippingProfile,
  getDeliveryQuote,

  // Shops
  fetchShops,
  fetchShopById,
  createShop,
  updateShop,
  deleteShop,
  toggleFollowShop,

  // Products
  fetchShopProducts,
  fetchProductById,
  createProduct,
  batchCreateProducts,
  updateProduct,
  deleteProduct,
  toggleProductLike,
  fetchLikedProducts,
  fetchNearbyProducts,

  // Comments
  fetchProductComments,
  createProductComment,
  deleteProductComment,
  toggleProductCommentLike,

  // Content
  fetchContents,
  fetchContentById,
  createContent,
  updateContent,
  deleteContent,
  toggleContentLike,
  fetchLikedContents,
  fetchContentComments,
  createContentComment,
  deleteContentComment,
  toggleContentCommentLike,

  // Feed
  fetchHomeFeed,
  fetchAllFeed,

  // Reviews
  fetchShopReviews,
  fetchReviewById,
  createReview,
  updateReview,
  partialUpdateReview,
  deleteReview,
  toggleReviewLike,
  fetchUserReviews,
};
