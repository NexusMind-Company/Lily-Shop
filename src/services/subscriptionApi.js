import { supabase, handleSupabaseError } from "./supabase";
import { fetchPublicProfile } from "./api";

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
    // Active subscriptions count
    const { count: activeSubs, error: activeError } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", vendorId)
      .eq("status", "active");

    if (activeError) throw activeError;

    // Revenue: sum of amounts for active subscriptions
    const { data: revenueData, error: revenueError } = await supabase
      .from("subscriptions")
      .select("amount")
      .eq("vendor_id", vendorId)
      .eq("status", "active");

    if (revenueError) throw revenueError;

    const revenue = revenueData.reduce(
      (sum, sub) => sum + parseFloat(sub.amount),
      0
    );

    // Pending count
    const { count: pending, error: pendingError } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", vendorId)
      .eq("status", "pending");

    if (pendingError) throw pendingError;

    return {
      activeSubs: activeSubs || 0,
      revenue: revenue.toFixed(2),
      pending: pending || 0,
    };
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
    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        `
        id,
        plan_type,
        amount,
        status,
        started_at,
        customers (
          id,
          name,
          profile_pic
        )
      `
      )
      .eq("vendor_id", vendorId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching recent subscriptions:", error);
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
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("vendor_id", vendorId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    throw error;
  }
};

/**
 * Fetch menu items for a vendor
 * @param {string} vendorId - The vendor's unique ID
 * @param {number} limit - Number of menu items to fetch (default 10)
 * @returns {Promise<Array>} Array of menu item objects
 */
export const fetchMenuItems = async (vendorId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("vendor_id", vendorId)
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};

/**
 * Fetch vendor details for subscription page
 * @param {string} vendorId - The vendor's unique ID
 * @returns {Promise<Object>} Vendor details object
 */
export const fetchVendorDetails = async (vendorId) => {
  try {
    const data = await fetchPublicProfile(vendorId);
    return data;
  } catch (error) {
    console.error("Error fetching vendor details:", error);
    throw error;
  }
};

/**
 * Fetch available meals for a vendor
 * @param {string} vendorId - The vendor's unique ID
 * @param {number} limit - Number of meals to fetch (default 20)
 * @returns {Promise<Array>} Array of meal objects
 */
export const fetchAvailableMeals = async (vendorId, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("vendor_id", vendorId)
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching available meals:", error);
    throw error;
  }
};

/**
 * Fetch all subscriptions for a vendor (for overview page)
 * @param {string} vendorId - The vendor's unique ID (would come from auth context)
 * @returns {Promise<Array>} Array of all subscription objects
 */
export const fetchAllSubscriptions = async (vendorId) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        `
        id,
        plan_type,
        plan_name,
        amount,
        status,
        started_at,
        dietary_notes,
        customers (
          id,
          name,
          profile_pic
        )
      `
      )
      .eq("vendor_id", vendorId)
      .order("started_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching all subscriptions:", error);
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
    // If no customerId provided, try to get from localStorage (backend auth system)
    let userId = customerId;
    if (!userId) {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        userId = user?.id || user?.user_id;
      }
    }

    // If no userId, return empty array (allow viewing without login)
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        `
        id,
        vendor_name,
        vendor_image,
        plan_name,
        amount,
        frequency,
        meal_count,
        status,
        next_billing,
        next_delivery,
        paused_date,
        paused_reason,
        created_at,
        vendors (
          id,
          name,
          image
        )
      `
      )
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw handleSupabaseError(error);
    }

    if (!data) {
      return [];
    }

    // Transform the data to match our component expectations
    return data.map((sub) => ({
      ...sub,
      vendor_name: sub.vendors?.name || sub.vendor_name || "Unknown Vendor",
      vendor_image: sub.vendors?.image || sub.vendor_image,
    }));
  } catch (error) {
    console.error("Error fetching customer subscriptions:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch subscriptions");
  }
};

/**
 * Create a new meal plan for a vendor
 * @param {string} vendorId - The vendor's unique ID
 * @param {Object} planData - The plan data object
 * @param {string} planData.name - Plan name
 * @param {string} planData.type - Plan type (weekly/monthly)
 * @param {number} planData.price - Plan price
 * @param {string} planData.description - Plan description
 * @param {Array} planData.features - Array of features
 * @returns {Promise<Object>} Created plan data
 */
export const createMealPlan = async (vendorId, planData) => {
  try {
    const { data, error } = await supabase
      .from("meal_plans")
      .insert({
        vendor_id: vendorId,
        name: planData.name,
        type: planData.type,
        price: planData.price,
        description: planData.description,
        features: planData.features,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating meal plan:", error);
    throw error;
  }
};

/**
 * Create a new meal for a vendor
 * @param {string} vendorId - The vendor's unique ID
 * @param {Object} mealData - The meal data object
 * @param {string} mealData.name - Meal name
 * @param {string} mealData.description - Meal description
 * @param {string} mealData.image - Meal image URL
 * @param {number} mealData.calories - Meal calories
 * @param {Array} mealData.tags - Array of tag objects {label, type}
 * @returns {Promise<Object>} Created meal data
 */
export const createMeal = async (vendorId, mealData) => {
  try {
    const { data, error } = await supabase
      .from("meals")
      .insert({
        vendor_id: vendorId,
        name: mealData.name,
        description: mealData.description,
        image: mealData.image,
        calories: mealData.calories,
        tags: mealData.tags,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating meal:", error);
    throw error;
  }
};

/**
 * Update an existing meal plan
 * @param {string} planId - The plan ID
 * @param {Object} updates - The updates object
 * @returns {Promise<Object>} Updated plan data
 */
export const updateMealPlan = async (planId, updates) => {
  try {
    const { data, error } = await supabase
      .from("meal_plans")
      .update(updates)
      .eq("id", planId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating meal plan:", error);
    throw error;
  }
};

/**
 * Delete a meal plan
 * @param {string} planId - The plan ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteMealPlan = async (planId) => {
  try {
    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("id", planId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    throw error;
  }
};

/**
 * Update meal selection for a subscription
 * @param {string} subscriptionId - The subscription ID
 * @param {Array} selectedMealIds - Array of selected meal IDs
 * @returns {Promise<Object>} Update result
 */
export const updateMealSelection = async (subscriptionId, selectedMealIds) => {
  try {
    const { data, error } = await supabase.from("subscription_meals").upsert(
      selectedMealIds.map((mealId) => ({
        subscription_id: subscriptionId,
        meal_id: mealId,
      }))
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating meal selection:", error);
    throw error;
  }
};
