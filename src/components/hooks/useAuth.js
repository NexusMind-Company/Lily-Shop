import { useState } from "react";
import axios from "axios";
import { supabase, handleSupabaseError } from "../../services/supabase";

const useAuth = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const authentication = async (url, credentials) => {
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(url, credentials);
      setData(response.data);

      // Send authenticated user data to Supabase
      try {
        console.log("Profile payload:", response.data);

        await supabase.from("profiles").upsert({
          id: response.data.id,
          name: response.data.username || response.data.name,
          email: response.data.email,
          profile_pic: response.data.profile_pic,
        });
      } catch (supabaseError) {
        console.error(
          "Error saving user data to Supabase:",
          handleSupabaseError(supabaseError)
        );
      }
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 400 || err.response.status === 401)
      ) {
        console.error("Backend Error Response:", err.response.data);
        setError(
          err.response.data || {
            _error: "An unknown validation error occurred.",
          }
        );
      } else {
        setError({
          _error: "Network error or unexpected issue. Please try again later.",
        });
        console.error("Network/Server Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (url, credentials) => {
    setData(null);
    return await authentication(url, credentials);
  };

  const signup = async (url, credentials) => {
    setData(null);
    return await authentication(url, credentials);
  };

  return { login, signup, loading, error, data };
};

export default useAuth;
