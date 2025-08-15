import { useState } from "react";
import axios from "axios";
import { useAuthContext } from "./useAuthContext";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const signup = async (username, email, password) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post("/api/user/signup", {
        username,
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(response.data));
      dispatch({ type: "AUTHENTICATE", payload: response.data });

      setError(null);
      setIsLoading(false);
      console.log("User signed up:", response.data);
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        setError(
          error.response.data.error ||
            error.response.data.message ||
            "Server error occurred"
        );
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return { signup, isLoading, error };
};
