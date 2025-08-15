// src/pages/Home.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Home.module.css";
import PollCard from "../components/PollCard/PollCard";
import PollForm from "../components/PollForm/PollForm";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePollContext } from "../hooks/usePollContext";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();
  const { polls, dispatch: pollDispatch } = usePollContext();

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/polls");

        if (response.status === 200) {
          pollDispatch({ type: "SET_POLLS", payload: response.data });
          setError(null);
        } else {
          throw new Error(response.statusText || "Failed to fetch polls");
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      // Only fetch if polls is null (not fetched yet) or if we need to refresh
      if (polls === null) {
        fetchPolls();
      } else {
        setLoading(false);
      }
    } else {
      pollDispatch({ type: "SET_POLLS", payload: [] });
      setLoading(false);
      setError("Please log in to view polls.");
    }
  }, [user, pollDispatch, polls]);

  if (loading) return <div className={styles.container}>Loading polls...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.home}>
      <div className={styles.leftSection}>
        <h1 className={styles.title}>Explore Polls</h1>
        <div className={styles.filterBar}>
          <select className={styles.categorySelect}>
            <option>All Categories</option>
            {/* Add other categories dynamically or hardcoded */}
          </select>
        </div>
        <div className={styles.pollList}>
          {polls && polls.length > 0 ? (
            polls.map((poll) => <PollCard key={poll._id} poll={poll} />)
          ) : !user ? (
            <p className={styles.loginPrompt}>
              Please log in to see available polls.
            </p>
          ) : (
            <p>No polls found.</p>
          )}
        </div>
      </div>

      <div className={styles.rightSection}>
        <PollForm />
      </div>
    </div>
  );
};

export default Home;
