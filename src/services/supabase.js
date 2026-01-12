import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// Create Supabase client WITHOUT auth (using backend auth system instead)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Disable Supabase session persistence
    autoRefreshToken: false, // Disable auto refresh
    detectSessionInUrl: false, // Disable URL session detection
  },
  global: {
    headers: {
      "X-Client-Info": "lily-shop-react-app",
    },
  },
});

// Helper function to handle Supabase errors consistently
export const handleSupabaseError = (error) => {
  console.error("Supabase Error:", error);

  // Handle specific error types
  if (error?.code === "PGRST116") {
    return new Error("No data found");
  }

  if (error?.code === "23505") {
    return new Error("This record already exists");
  }

  if (error?.code === "42501") {
    return new Error("You do not have permission to perform this action");
  }

  if (error?.code === "PGRST301") {
    return new Error("Authentication required. Please log in again.");
  }

  // Network errors
  if (!navigator.onLine) {
    return new Error("No internet connection. Please check your network.");
  }

  // Return original error message or generic message
  return error?.message || "An unexpected error occurred. Please try again.";
};

// Helper function to check if user is authenticated (using backend auth)
export const isAuthenticated = () => {
  const accessToken = localStorage.getItem("access_token");
  return !!accessToken;
};

// Helper function to get current user from Redux state
// This will be called from components that need user info
export const getCurrentUser = () => {
  // This function will be implemented in components using Redux state
  // For now, return null as we bypass Supabase auth
  return null;
};

// Helper function to get user ID from Redux state
export const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const user = JSON.parse(userData);
      return user?.id || user?.user_id || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting user ID from localStorage:", error);
    return null;
  }
};
