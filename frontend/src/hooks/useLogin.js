import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import axios from "axios";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post("/api/user/login", {
        email,
        password,
      });
      localStorage.setItem("user", JSON.stringify(response.data));
      dispatch({ type: "AUTHENTICATE", payload: response.data });
      setError(null);
      setIsLoading(false);
      console.log("User logged in:", response.data);
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

  return { login, isLoading, error };
};
