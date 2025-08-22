// src/pages/VotedPolls.js
import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import axios from "axios";
import styles from "./VotedPolls.module.css";
import PollCard from "../components/PollCard/PollCard";
import { useAuthContext } from "../hooks/useAuthContext";

const VotedPolls = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  const [votedPolls, setVotedPolls] = useState([]);

  useEffect(() => {
    const fetchVotedPolls = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/polls/voted`, {
          headers: {
            Authorization: user ? `Bearer ${user.token}` : "",
          },
        });

        if (response.status === 200) {
          setVotedPolls(response.data);
          setError(null);
        } else {
          throw new Error(response.statusText || "Failed to fetch voted polls");
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "An unknown error occurred"
        );
        setVotedPolls([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchVotedPolls();
    } else {
      setVotedPolls([]);
      setLoading(false);
      setError("Please log in to view polls you've voted on.");
    }
  }, [user]);

  if (loading)
    return <div className={styles.container}>Loading voted polls...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.votedPollsPage}>
      <h1 className={styles.title}>Polls I've Voted On</h1>
      <div className={styles.pollList}>
        {votedPolls && votedPolls.length > 0 ? (
          // Explicitly pass showVoteButton={false} to hide the button on this page
          votedPolls.map((poll) => (
            <PollCard key={poll._id} poll={poll} showVoteButton={false} />
          ))
        ) : !user ? (
          <p className={styles.loginPrompt}>
            Please log in to see polls you've voted on.
          </p>
        ) : (
          <p>You haven't voted on any polls yet.</p>
        )}
      </div>
    </div>
  );
};

export default VotedPolls;
