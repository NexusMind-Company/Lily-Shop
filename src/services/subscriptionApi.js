import {
  fetchPublicProfile,
  fetchSubscriptionStats as apiFetchSubscriptionStats,
  fetchRecentSubscriptions as apiFetchRecentSubscriptions,
  fetchAllSubscriptions as apiFetchAllSubscriptions,
  fetchCustomerSubscriptions as apiFetchCustomerSubscriptions,
  fetchVendorSubscriptionPlans as apiFetchVendorSubscriptionPlans,
  createMealPlan as apiCreateMealPlan,
  createMeal as apiCreateMeal,
  fetchMealPlansByVendor as apiFetchMealPlansByVendor,
  fetchMealsByVendor as apiFetchMealsByVendor,
  fetchFoodVendor,
  fetchAllFoodVendors,
  fetchMealPlan,
  subscribeToPlan,
  unsubscribeFromPlan,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  partialUpdateSubscriptionPlan,
  deleteMealPlan,
  deleteMeal,
  updateReview,
  partialUpdateReview,
  deleteReview,
  fetchVendorReviews,
  createVendorReview,
  deleteVendorProfile,
  fetchSubscribedVendors,
  fetchVendorSubscriptions,
  api,
} from "./api";

/**
 * Fetch vendor profile by vendor ID
 * @param {string} vendorId - The vendor's unique ID
 * @returns {Promise<Object>} Vendor profile data
 */
export const fetchVendorProfile = async (vendorId) => {
  try {
    const data = await fetchPublicProfile(vendorId);
    return data;
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    throw error;
  }
};

/**
 * Fetch subscription statistics for a vendor
 * @param {string} vendorId - The vendor's unique ID
 * @returns {Promise<Object>} Stats object with activeSubs, revenue, pending
 */
export const fetchSubscriptionStats = async (vendorId) => {
  try {
    const data = await apiFetchSubscriptionStats(vendorId);
    return data;
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    throw error;
  }
};

/**
 * Fetch recent subscriptions for a vendor
 * @param {string} vendorId - The vendor's unique ID
 * @param {number} limit - Number of recent subscriptions to fetch (default 5)
 * @returns {Promise<Array>} Array of recent subscription objects
 */
export const fetchRecentSubscriptions = async (vendorId, limit = 5) => {
  try {
    const data = await apiFetchRecentSubscriptions(vendorId, limit);
    return data;
  } catch (error) {
    console.error("Error fetching recent subscriptions:", error);
    throw error;
  }
};

/**
 * Fetch vendor details for subscription page
 * @param {string} vendorId - The vendor's unique ID
 * @returns {Promise<Object>} Vendor details object
 */
export const fetchAllVendors = async (params = {}) => {
  try {
    const data = await fetchAllFoodVendors(params);
    return data;
  } catch (error) {
    console.error("Error fetching all food vendors:", error);
    throw error;
  }
};

export const fetchVendorDetails = async (vendorId) => {
  try {
    // 1. Fetch core vendor detail
    const data = await fetchFoodVendor(vendorId);
    
    // 2. Data Stitching: The detail view often omits media seen in the list view
    if (data && !data.all_media_urls) {
      try {
        const vendorList = await fetchAllFoodVendors();
        const listData = (vendorList.results || vendorList).find(v => v.id === vendorId);
        if (listData && listData.all_media_urls) {
          data.all_media_urls = listData.all_media_urls;
        }
      } catch (e) {
        console.warn("Could not stitch vendor list media", e);
      }
    }

    // 3. User Avatar: Inject the vendor's actual associated user profile picture
    if (data && data.user && !data.profile_pic) {
      try {
        const userId = typeof data.user === 'string' ? data.user : data.user.id;
        const profile = await fetchPublicProfile(userId);
        if (profile) {
           data.user_profile = profile;
           data.profile_pic = profile.profile_pic;
           // If address is still missing, maybe it's listed in the user's bio/metadata
           if (!data.address && profile.address) data.address = profile.address;
        }
      } catch (err) {
         console.warn("Could not fetch associated user profile for vendor avatar", err);
      }
    }

    // 4. Address Fallback: If vendor has no address, check their meal plans
    if (data && !data.address) {
      try {
        const plans = await apiFetchMealPlansByVendor(vendorId);
        const firstPlanWithAddress = (plans.results || plans).find(p => p.address);
        if (firstPlanWithAddress) {
          data.address = firstPlanWithAddress.address;
        }
      } catch (e) {
        console.warn("Could not fetch fallback address from plans", e);
      }
    }

    return data;
  } catch (error) {
    console.error("Error fetching vendor details:", error);
    if (error?.response?.status === 500 || error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updatePlan = async (planId, planData) => {
  try {
    const data = await updateSubscriptionPlan(planId, planData);
    return data;
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    throw error;
  }
};

export const partialUpdatePlan = async (planId, planData) => {
  try {
    const data = await partialUpdateSubscriptionPlan(planId, planData);
    return data;
  } catch (error) {
    console.error("Error partially updating subscription plan:", error);
    throw error;
  }
};

/**
 * Fetch all subscriptions for a vendor (for overview page) with pagination
 * @param {string} vendorId - The vendor's unique ID (would come from auth context)
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number (default 1)
 * @param {number} params.page_size - Number of results per page (default 10)
 * @returns {Promise<Object>} Paginated response with count, next, previous, and results
 */
export const fetchAllSubscriptions = async (
  vendorId,
  { page = 1, page_size = 10 } = {},
) => {
  try {
    const data = await apiFetchAllSubscriptions(vendorId, { page, page_size });
    return data;
  } catch (error) {
    console.error("Error fetching all subscriptions:", error);
    throw error;
  }
};

/**
 * Fetch vendor subscription plans with pagination
 * @param {string} vendorId - The vendor's unique ID
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number (default 1)
 * @param {number} params.page_size - Number of results per page (default 10)
 * @returns {Promise<Object>} Paginated response with count, next, previous, and results
 */
export const fetchVendorSubscriptionPlans = async (
  vendorId,
  { page = 1, page_size = 10 } = {},
) => {
  try {
    const data = await apiFetchVendorSubscriptionPlans(vendorId, {
      page,
      page_size,
    });
    console.log(" API fetchVendorSubscriptionPlans response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching vendor subscription plans:", error);
    throw error;
  }
};

/**
 * Fetch customer subscriptions (for customer view)
 * @param {string} customerId - The customer's unique ID (would come from auth context)
 * @returns {Promise<Array>} Array of customer subscription objects
 */
export const fetchCustomerSubscriptions = async (customerId) => {
  try {
    const data = await apiFetchCustomerSubscriptions();

    if (!data) {
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching customer subscriptions:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch subscriptions");
  }
};

/**
 * Create a meal plan
 * @param {Object} mealPlanData - The meal plan data with optional media file
 * @returns {Promise<Object>} Created meal plan data
 */
export const createMealPlan = async (payload) => {
  try {
    let response;
    // Check if we have media files (single File or array of Files)
    const hasMedia = payload.media && (payload.media instanceof File || (Array.isArray(payload.media) && payload.media.length > 0));
    if (hasMedia) {
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        if (key === 'media') {
          if (Array.isArray(payload.media)) {
            payload.media.forEach(file => {
              formData.append('media', file);
            });
          } else if (payload.media instanceof File) {
            formData.append('media', payload.media);
          }
        } else if (key === 'features') {
          payload.features.forEach(feature => {
            formData.append('features', feature);
          });
        } else {
          formData.append(key, payload[key]);
        }
      });
      // The endpoint must accept multipart/form-data
      response = await api.post("/foods/subscriptions/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      // Fallback JSON if no media
      response = await api.post("/foods/subscriptions/create/", payload);
    }
    
    console.log(" API createMealPlan response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating meal plan:", error.response?.data || error);
    throw error;
  }
};
/**
 * Create a meal
 * @param {string} vendorId - The vendor's unique ID (not used, for consistency)
 * @param {Object} mealData - The meal data
 * @returns {Promise<Object>} Created meal data
 */
export const createMeal = async (vendorId, mealData) => {
  try {
    const data = await apiCreateMeal(mealData);
    return data;
  } catch (error) {
    console.error("Error creating meal:", error);
    throw error;
  }
};

/**
 * Fetch meal plans for a vendor
 * @param {string} vendorId - The vendor's unique ID
 * @returns {Promise<Array>} Array of meal plan objects
 */
export const fetchMealPlans = async (vendorId) => {
  try {
    const data = await apiFetchMealPlansByVendor(vendorId);
    return data;
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    throw error;
  }
};

/**
 * Fetch available meals for a vendor
 * @param {string} vendorId - The vendor's unique ID
 * @returns {Promise<Array>} Array of meal objects
 */
export const fetchAvailableMeals = async (vendorId) => {
  try {
    const data = await apiFetchMealsByVendor(vendorId);
    return data;
  } catch (error) {
    console.error("Error fetching available meals:", error);
    throw error;
  }
};

/**
 * Fetch food vendor details
 * @param {string} vendorId - The vendor's unique ID
 * @returns {Promise<Object>} Vendor details object
 */
export const fetchFoodVendorDetails = async (vendorId) => {
  try {
    const data = await fetchFoodVendor(vendorId);
    return data;
  } catch (error) {
    console.error("Error fetching food vendor details:", error);
    throw error;
  }
};

/**
 * Fetch meal plan details
 * @param {string} mealPlanId - The meal plan's unique ID
 * @returns {Promise<Object>} Meal plan details object
 */
export const fetchMealPlanDetails = async (mealPlanId) => {
  try {
    const data = await fetchMealPlan(mealPlanId);
    return data;
  } catch (error) {
    console.error("Error fetching meal plan details:", error);
    throw error;
  }
};

/**
 * Subscribe to a meal plan
 * @returns {Promise<Object>} Subscription result
 */
export const subscribeToMealPlan = async () => {
  try {
    const data = await subscribeToPlan();
    return data;
  } catch (error) {
    console.error("Error subscribing to meal plan:", error);
    throw error;
  }
};

/**
 * Unsubscribe from a meal plan
 * @param {string} planId - The plan's unique ID
 * @returns {Promise<Object>} Unsubscription result
 */
export const unsubscribeFromMealPlan = async (planId) => {
  try {
    const data = await unsubscribeFromPlan(planId);
    return data;
  } catch (error) {
    console.error("Error unsubscribing from meal plan:", error);
    throw error;
  }
};

/**
 * Create a subscription plan
 * @param {Object} planData - The plan data
 * @returns {Promise<Object>} Created plan object
 */
export const createVendorSubscriptionPlan = async (planData) => {
  try {
    const data = await createSubscriptionPlan(planData);
    return data;
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    throw error;
  }
};

/**
 * Delete a meal plan
 * @param {string} mealPlanId - The meal plan ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteVendorMealPlan = async (mealPlanId) => {
  try {
    const data = await deleteMealPlan(mealPlanId);
    return data;
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    throw error;
  }
};

/**
 * Delete a meal
 * @param {string} mealId - The meal ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteVendorMeal = async (mealId) => {
  try {
    const data = await deleteMeal(mealId);
    return data;
  } catch (error) {
    console.error("Error deleting meal:", error);
    throw error;
  }
};

/**
 * Update a review
 * @param {string} reviewId - The review ID
 * @param {Object} reviewData - The review data
 * @returns {Promise<Object>} Updated review
 */
export const updateVendorReview = async (reviewId, reviewData) => {
  try {
    const data = await updateReview(reviewId, reviewData);
    return data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

/**
 * Partially update a review
 * @param {string} reviewId - The review ID
 * @param {Object} reviewData - The review data
 * @returns {Promise<Object>} Updated review
 */
export const partialUpdateVendorReview = async (reviewId, reviewData) => {
  try {
    const data = await partialUpdateReview(reviewId, reviewData);
    return data;
  } catch (error) {
    console.error("Error partially updating review:", error);
    throw error;
  }
};

/**
 * Delete a review
 * @param {string} reviewId - The review ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteVendorReview = async (reviewId) => {
  try {
    const data = await deleteReview(reviewId);
    return data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

/**
 * Fetch reviews for a vendor
 * @param {string} vendorId - The vendor ID
 * @returns {Promise<Array>} Array of reviews
 */
export const fetchReviewsForVendor = async (vendorId) => {
  try {
    const data = await fetchVendorReviews(vendorId);
    console.log(" API fetchReviewsForVendor response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching vendor reviews:", error);
    throw error;
  }
};

/**
 * Create a review for a vendor
 * @param {string} vendorId - The vendor ID
 * @param {Object} reviewData - The review data
 * @returns {Promise<Object>} Created review
 */
export const createReviewForVendor = async (vendorId, reviewData) => {
  try {
    const data = await createVendorReview(vendorId, reviewData);
    return data;
  } catch (error) {
    console.error("Error creating vendor review:", error);
    throw error;
  }
};

/**
 * Delete the authenticated user's vendor profile
 * @returns {Promise<Object>} Deletion result
 */
export const deleteUserVendorProfile = async () => {
  try {
    const data = await deleteVendorProfile();
    return data;
  } catch (error) {
    console.error("Error deleting vendor profile:", error);
    throw error;
  }
};

/**
 * Fetch vendors the user is subscribed to
 * @returns {Promise<Array>} Array of subscribed vendors
 */
export const fetchUserSubscribedVendors = async () => {
  try {
    const data = await fetchSubscribedVendors();
    return data;
  } catch (error) {
    console.error("Error fetching subscribed vendors:", error);
    throw error;
  }
};

/**
 * Fetch subscriptions to a specific vendor
 * @param {string} vendorId - The vendor ID
 * @returns {Promise<Array>} Array of subscriptions
 */
export const fetchSubscriptionsToVendor = async (vendorId) => {
  try {
    const data = await fetchVendorSubscriptions(vendorId);
    return data;
  } catch (error) {
    console.error("Error fetching subscriptions to vendor:", error);
    throw error;
  }
};

/**
 * Update a meal plan
 * @param {string} id - The meal plan ID
 * @param {Object} payload - The meal plan data with optional media file
 * @returns {Promise<Object>} Updated meal plan data
 */
export const updateMealPlan = async (id, payload) => {
  const { plan_name, price, trial_days, description, meals_per_cycle, media } =
    payload;

  // Check if media is a single File or array of Files
  const hasMedia = media && (media instanceof File || (Array.isArray(media) && media.length > 0));
  
  if (hasMedia) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    
    // Validate media type
    const filesToValidate = Array.isArray(media) ? media : [media];
    for (const file of filesToValidate) {
      if (file instanceof File && !allowedTypes.includes(file.type)) {
        throw new Error(
          "Only image files (JPEG, PNG, GIF, WEBP) are allowed for media",
        );
      }
    }

    const formData = new FormData();
    formData.append("plan_name", plan_name);
    formData.append("price", price.toString());

    if (trial_days !== undefined && trial_days !== null) {
      formData.append("trial_days", trial_days.toString());
    }

    if (description !== undefined && description !== null) {
      formData.append("description", description);
    }

    if (meals_per_cycle !== undefined && meals_per_cycle !== null) {
      formData.append("meals_per_cycle", meals_per_cycle.toString());
    }

    // Append media - handle both single File and array
    if (Array.isArray(media)) {
      media.forEach((file) => {
        formData.append("media", file);
      });
    } else if (media instanceof File) {
      formData.append("media", media);
    }

    const response = await api.patch(
      `/foods/subscriptions/${id}/update/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  }

  // Otherwise use JSON
  const response = await api.patch(
    `/foods/subscriptions/${id}/update/`,
    payload,
  );
  return response.data;
};

// Note: The following functions have been removed because the corresponding backend endpoints don't exist:
// - fetchMenuItems
// - updateMealSelection
//
// These will need to be implemented on the backend or the frontend components will need to be updated
// to work without these features.

/**
 * Update subscription preferences (dietary, allergies, portion size, etc.)
 * @param {string} subscriptionId - The subscription ID
 * @param {Object} preferencesData - The preferences data
 * @param {string} preferencesData.preferred_delivery_days - Array of delivery days
 * @param {Object} preferencesData.dietary_preferences - Dietary preferences
 * @param {Array} preferencesData.allergies - List of allergies
 * @param {string} preferencesData.portion_size - Portion size (small, regular, large)
 * @param {string} preferencesData.special_instructions - Special instructions
 * @returns {Promise<Object>} Updated subscription data
 */
export const updateSubscriptionPreferences = async (subscriptionId, preferencesData) => {
  try {
    const response = await api.patch(
      `/foods/subscriptions/${subscriptionId}/preferences/`,
      preferencesData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating subscription preferences:", error);
    throw error;
  }
};
