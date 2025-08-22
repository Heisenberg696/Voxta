// src/components/PollForm/PollForm.js
import React, { useState } from "react";
import API_BASE_URL from "../../config/api";
import axios from "axios";
import styles from "./PollForm.module.css";
import { useAuthContext } from "../../hooks/useAuthContext";
import { usePollContext } from "../../hooks/usePollContext";

const PollForm = () => {
  const { user } = useAuthContext();
  const { dispatch } = usePollContext();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const categories = [
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

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      // Limit to maximum 6 options
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      // Minimum 2 options required
      const updatedOptions = options.filter((_, i) => i !== index);
      setOptions(updatedOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create a poll.");
      return;
    }

    // Validation
    if (!question.trim()) {
      setError("Please enter a poll question.");
      return;
    }

    const filledOptions = options.filter((option) => option.trim());
    if (filledOptions.length < 2) {
      setError("Please provide at least 2 options.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pollData = {
        question: question.trim(),
        options: filledOptions.map((option) => ({
          option: option.trim(),
          votes: 0,
        })),
        category,
        createdBy: user._id,
      };

      const response = await axios.post(`${API_BASE_URL}/api/polls`, pollData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.status === 201) {
        // Add the new poll to context
        dispatch({ type: "CREATE_POLL", payload: response.data });

        // Reset form
        setQuestion("");
        setOptions(["", "", ""]);
        setCategory("");
        setSuccess(true);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to create poll. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.pollForm}>
        <h2 className={styles.title}>Create a Poll</h2>
        <div className={styles.loginMessage}>
          <p>Please log in to create a poll.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pollForm}>
      <h2 className={styles.title}>Create a Poll</h2>

      {error && <div className={styles.error}>{error}</div>}
      {success && (
        <div className={styles.success}>Poll created successfully!</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Poll Question</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Ask a question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
        </div>

        {options.map((option, index) => (
          <div key={index} className={styles.formGroup}>
            <div className={styles.optionHeader}>
              <label className={styles.label}>Option {index + 1}</label>
              {options.length > 2 && (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeOption(index)}
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter an option"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              disabled={loading}
            />
          </div>
        ))}

        {options.length < 6 && (
          <button
            type="button"
            className={styles.addOptionButton}
            onClick={addOption}
            disabled={loading}
          >
            + Add Another Option
          </button>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Creating Poll..." : "Create Poll"}
        </button>
      </form>
    </div>
  );
};

export default PollForm;
