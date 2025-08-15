// src/pages/PollDetail.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./PollDetail.module.css";
import ResultsChart from "../components/ResultsChart/ResultsChart";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePollContext } from "../hooks/usePollContext";

const PollDetail = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { dispatch: pollDispatch } = usePollContext();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null); // Chart should always show, so showResults is effectively managed by poll data presence
  const [userAlreadyVoted, setUserAlreadyVoted] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/polls/${id}`, {
          headers: {
            Authorization: user ? `Bearer ${user.token}` : "",
          },
        });

        if (response.status === 200) {
          const data = response.data;
          setPoll(data); // Check if the logged-in user has already voted

          if (user && data.votedBy.includes(user._id)) {
            setUserAlreadyVoted(true);
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
        `/api/polls/${id}/vote`,
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
        setUserAlreadyVoted(true); // setShowResults(true); // No longer explicitly set here, it's always shown
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
      <div className={styles.optionsList}>
        {poll.options.map((option) => (
          <div
            key={option._id}
            className={`${styles.option} ${
              selectedOption?._id === option._id ? styles.selected : ""
            } ${userAlreadyVoted ? styles.disabled : ""}`}
            onClick={() => !userAlreadyVoted && setSelectedOption(option)}
          >
            <span className={styles.radioCustom}></span>
            {/* Custom radio button indicator */}
            <span className={styles.optionText}>{option.option}</span>
          </div>
        ))}
      </div>
      {!user && <p className={styles.loginMessage}>Please log in to vote.</p>}{" "}
      <button
        className={styles.submitButton}
        onClick={handleVote}
        disabled={!canVote}
      >
        {submitButtonText}
      </button>
      {/* The Results section is always displayed */}
      <div className={styles.resultsSection}>
        <h2 className={styles.resultsTitle}>Results</h2>

        <ResultsChart options={poll.options} totalVotes={poll.totalVotes} />
      </div>
    </div>
  );
};

export default PollDetail;
