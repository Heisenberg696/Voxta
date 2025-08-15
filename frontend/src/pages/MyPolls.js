// src/pages/MyPolls.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./MyPolls.module.css";
import PollCard from "../components/PollCard/PollCard";
import PollUpdateModal from "../components/PollUpdateModal/PollUpdateModal";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePollContext } from "../hooks/usePollContext";

const MyPolls = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPolls, setUserPolls] = useState([]); // Local state for user polls
  const { user } = useAuthContext();
  const { dispatch: pollDispatch } = usePollContext(); // Only for global updates

  // State for the update modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPollForEdit, setSelectedPollForEdit] = useState(null);

  const fetchUserPolls = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user's polls specifically
      const response = await axios.get("/api/polls/user/mypolls", {
        headers: {
          Authorization: user ? `Bearer ${user.token}` : "",
        },
      });

      if (response.status === 200) {
        console.log("Frontend: Data fetched for My Polls:", response.data);
        setUserPolls(response.data);
        setError(null);
      } else {
        throw new Error(response.statusText || "Failed to fetch my polls");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "An unknown error occurred"
      );
      setUserPolls([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserPolls();
    } else {
      setUserPolls([]);
      setLoading(false);
      setError("Please log in to view your created polls.");
    }
  }, [user, fetchUserPolls]);

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm("Are you sure you want to delete this poll?")) {
      return;
    }
    try {
      const response = await axios.delete(`/api/polls/${pollId}`, {
        headers: {
          Authorization: user ? `Bearer ${user.token}` : "",
        },
      });

      if (response.status === 200) {
        // Remove from local state
        setUserPolls((prev) => prev.filter((poll) => poll._id !== pollId));
        // Also remove from global context if it exists there
        pollDispatch({ type: "DELETE_POLL", payload: pollId });
        setError(null);
      } else {
        throw new Error(response.statusText || "Failed to delete poll");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "An unknown error occurred during deletion"
      );
    }
  };

  const handleUpdateClick = (poll) => {
    setSelectedPollForEdit(poll);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateModalClose = () => {
    setIsUpdateModalOpen(false);
    setSelectedPollForEdit(null);
    setError(null); // Clear any modal-related errors
  };

  const handleUpdateSuccess = (updatedPoll) => {
    // Update the poll in local state
    setUserPolls((prev) =>
      prev.map((poll) => (poll._id === updatedPoll._id ? updatedPoll : poll))
    );
    // Also update in global context
    pollDispatch({ type: "UPDATE_POLL", payload: updatedPoll });
    handleUpdateModalClose(); // Close modal after successful update
  };

  if (loading)
    return <div className={styles.container}>Loading your polls...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.myPollsPage}>
      <h1 className={styles.title}>My Created Polls</h1>
      <div className={styles.pollList}>
        {userPolls && userPolls.length > 0 ? (
          userPolls.map((poll) => (
            <PollCard
              key={poll._id}
              poll={poll}
              showVoteButton={false} // Hide vote button
              showActionButtons={true} // Show update/delete buttons
              onDelete={handleDeletePoll}
              onUpdate={handleUpdateClick}
            />
          ))
        ) : !user ? (
          <p className={styles.loginPrompt}>
            Please log in to see polls you've created.
          </p>
        ) : (
          <p>You haven't created any polls yet.</p>
        )}
      </div>

      {isUpdateModalOpen && selectedPollForEdit && (
        <PollUpdateModal
          poll={selectedPollForEdit}
          onClose={handleUpdateModalClose}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default MyPolls;
