import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
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

  // Network errors
  if (!navigator.onLine) {
    return new Error("No internet connection. Please check your network.");
  }

  // Return original error message or generic message
  return error?.message || "An unexpected error occurred. Please try again.";
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return !!user;
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};
