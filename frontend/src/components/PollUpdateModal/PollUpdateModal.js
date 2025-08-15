// src/components/PollUpdateModal/PollUpdateModal.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./PollUpdateModal.module.css"; // Create this CSS module next
import { XCircle } from "lucide-react"; // For close icon (npm install lucide-react)
import { useAuthContext } from "../../hooks/useAuthContext";

const PollUpdateModal = ({ poll, onClose, onUpdateSuccess }) => {
  const { user } = useAuthContext();
  const [question, setQuestion] = useState(poll.question);
  const [options, setOptions] = useState(
    poll.options.map((opt) => ({ option: opt.option, _id: opt._id }))
  ); // Store options, keep _id for matching
  const [category, setCategory] = useState(poll.category);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableCategories = [
    "Technology",
    "Entertainment",
    "Science",
    "Sports",
    "Food",
    "Travel & Leisure",
    "Food & Drink",
    "Media",
    "Lifestyle",
    "Education",
    "Health",
    "Politics",
    "Other",
  ];

  // Effect to sync poll prop changes (though for a modal, it's usually mounted with fixed poll)
  useEffect(() => {
    if (poll) {
      setQuestion(poll.question);
      setOptions(
        poll.options.map((opt) => ({ option: opt.option, _id: opt._id }))
      );
      setCategory(poll.category);
    }
  }, [poll]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].option = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, { option: "", _id: `new-${Date.now()}` }]); // Assign a temporary _id for new options
  };

  const handleRemoveOption = (indexToRemove) => {
    // Only allow removing if more than 2 options (minimum for a poll)
    if (options.length > 2) {
      setOptions(options.filter((_, index) => index !== indexToRemove));
    } else {
      setError("Polls must have at least 2 options.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (
      !question ||
      options.some((opt) => !opt.option.trim()) ||
      options.length < 2 ||
      !category
    ) {
      setError("Please fill all fields and ensure at least 2 options.");
      setLoading(false);
      return;
    }

    try {
      const payloadOptions = options.map((opt) => ({
        option: opt.option,
        votes: poll.options.find((pOpt) => pOpt._id === opt._id)?.votes || 0,
      }));

      const response = await axios.patch(
        `/api/polls/${poll._id}`,
        { question, options: payloadOptions, category },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Assuming your backend updatePoll returns the updated poll
        const updatedPoll = response.data;
        // The backend's updatePoll doesn't calculate totalVotes or creatorUsername.
        // We'll mimic the structure returned by getAllPolls/getUserPolls/getPollById
        const totalVotes = updatedPoll.options.reduce(
          (sum, opt) => sum + opt.votes,
          0
        );
        const pollToDispatch = {
          ...updatedPoll,
          totalVotes,
          creatorUsername: poll.creatorUsername, // Keep the original creatorUsername as it's not changed by update
        };
        onUpdateSuccess(pollToDispatch); // Call success callback to update parent state/context
      } else {
        throw new Error(response.statusText || "Failed to update poll");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <XCircle size={24} />
        </button>
        <h2>Update Poll</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="question">Question:</label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Options:</label>
            {options.map((opt, index) => (
              <div key={opt._id || index} className={styles.optionInputGroup}>
                <input
                  type="text"
                  value={opt.option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {options.length > 2 && ( // Only show remove if more than 2 options
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className={styles.removeOptionButton}
                    title="Remove option"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className={styles.addOptionButton}
            >
              + Add Another Option
            </button>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Poll"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PollUpdateModal;
