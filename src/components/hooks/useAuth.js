import { useState } from "react";
import axios from "axios";

const useAuth = () => {
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const authentication = async (url, credentials) => {
    setError([]);
    setLoading(true);

    try {
      const response = await axios.post(url, credentials);
      setData(response.data);
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 400 || err.response.status === 401)
      ) {
        console.error("Backend Error Response:", err.response.data);

        const backendErrors = err.response.data;
        const formattedErrors = Object.keys(backendErrors).map((key) => ({
          [key]: backendErrors[key],
        }));
        setError(formattedErrors);
      } else {
        setError([{ others: "Network error! Please try again later." }]);
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (url, credentials) => {
    return await authentication(url, credentials);
  };

  const signup = async (url, credentials) => {
    return await authentication(url, credentials);
  };

  return { login, signup, loading, error, data };
};

export default useAuth;
