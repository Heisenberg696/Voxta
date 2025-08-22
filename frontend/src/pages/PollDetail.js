// src/pages/PollDetail.js
import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./PollDetail.module.css";
import ResultsChart from "../components/ResultsChart/ResultsChart";
import CommentsSection from "../components/CommentsSection/CommentsSection";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePollContext } from "../hooks/usePollContext";

const PollDetail = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { dispatch: pollDispatch } = usePollContext();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAlreadyVoted, setUserAlreadyVoted] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/polls/${id}`, {
          headers: {
            Authorization: user ? `Bearer ${user.token}` : "",
          },
        });

        if (response.status === 200) {
          const data = response.data;
          setPoll(data);

          // Check if the logged-in user has already voted
          // Use userVote presence as the primary indicator, fallback to votedBy array
          const hasVoted =
            data.userVote || (user && data.votedBy.includes(user._id));

          if (hasVoted) {
            setUserAlreadyVoted(true);

            // If user has voted, highlight their chosen option
            if (data.userVote) {
              const votedOption = data.options.find(
                (opt) =>
                  opt._id.toString() === data.userVote.optionId.toString()
              );
              if (votedOption) {
                setSelectedOption(votedOption);
              }
            }
          } else {
            // Reset states if user hasn't voted
            setUserAlreadyVoted(false);
            setSelectedOption(null);
          }
          setError(null);
        } else {
          throw new Error(
            response.statusText || "Failed to fetch poll details"
          );
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
      fetchPoll();
    } else {
      setLoading(false);
      setError("Please log in to view poll details.");
    }
  }, [id, user]);

  const handleVote = async () => {
    if (!user) {
      setError("You must be logged in to vote.");
      return;
    }
    if (!selectedOption) {
      setError("Please select an option to vote.");
      return;
    }
    if (userAlreadyVoted) {
      setError("You have already voted on this poll.");
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/polls/${id}/vote`,
        { option: selectedOption.option, userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedPollData = response.data.poll;
        const newTotalVotes = updatedPollData.options.reduce(
          (sum, opt) => sum + opt.votes,
          0
        );

        const pollToUpdate = { ...updatedPollData, totalVotes: newTotalVotes };

        setPoll(pollToUpdate);
        pollDispatch({ type: "VOTE_POLL", payload: pollToUpdate });
        setUserAlreadyVoted(true);
        setError(null);
      } else {
        throw new Error(response.statusText || "Failed to submit vote");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "An unknown error occurred"
      );
    }
  };

  // Handle option selection - prevent changing if already voted
  const handleOptionSelect = (option) => {
    if (userAlreadyVoted) {
      // Clear any existing error and show appropriate message
      setError("You have already voted on this poll.");
      return; // Don't allow selection change if already voted
    }
    setSelectedOption(option);
    setError(null); // Clear any previous errors
  };

  if (loading)
    return <div className={styles.container}>Loading poll details...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;
  if (!poll)
    return (
      <div className={styles.container}>
        {user ? "Poll not found." : "Please log in to view poll details."}
      </div>
    );

  const canVote = user && !userAlreadyVoted && selectedOption;
  const submitButtonText = userAlreadyVoted ? "Already Voted" : "Submit Vote";

  return (
    <div className={styles.pollDetail}>
      <h1 className={styles.question}>{poll.question}</h1>

      <div className={styles.contentWrapper}>
        {/* Voting Column */}
        <div className={styles.votingColumn}>
          {!user && (
            <p className={styles.loginMessage}>
              Please log in to participate in this poll.
            </p>
          )}

          <div className={styles.optionsList}>
            {poll.options.map((option) => (
              <div
                key={option._id}
                className={`${styles.option} ${
                  selectedOption?._id === option._id ? styles.selected : ""
                } ${userAlreadyVoted ? styles.disabled : ""}`}
                onClick={() => handleOptionSelect(option)}
                style={{ cursor: userAlreadyVoted ? "not-allowed" : "pointer" }}
              >
                <span className={styles.radioCustom}></span>
                <span className={styles.optionText}>{option.option}</span>
              </div>
            ))}
          </div>

          <button
            className={styles.submitButton}
            onClick={handleVote}
            disabled={!canVote}
          >
            {submitButtonText}
          </button>

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>

        {/* Results Column */}
        <div className={styles.resultsColumn}>
          <div className={styles.resultsSection}>
            <h2 className={styles.resultsTitle}>Results</h2>
            <div className={styles.chartContainer}>
              <ResultsChart
                options={poll.options}
                totalVotes={poll.totalVotes}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {user && (
        <div className={styles.commentsWrapper}>
          <CommentsSection pollId={id} />
        </div>
      )}
    </div>
  );
};

export default PollDetail;
