// src/pages/Home.js
import React, { useState, useEffect, useMemo } from "react";
import API_BASE_URL from "../config/api";
import axios from "axios";
import styles from "./Home.module.css";
import PollCard from "../components/PollCard/PollCard";
import PollForm from "../components/PollForm/PollForm";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePollContext } from "../hooks/usePollContext";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const { user } = useAuthContext();
  const { polls, dispatch: pollDispatch } = usePollContext();

  // Define categories from your Poll schema enum
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

  // Filter polls based on search term and selected category
  const filteredPolls = useMemo(() => {
    if (!polls) return [];

    return polls.filter((poll) => {
      const matchesSearch = poll.question
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories" ||
        poll.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [polls, searchTerm, selectedCategory]);

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/polls`);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) return <div className={styles.container}>Loading polls...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.home}>
      <div className={styles.leftSection}>
        <h1 className={styles.title}>Explore Polls</h1>

        <div className={styles.filterBar}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search polls..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className={styles.clearButton}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            className={styles.categorySelect}
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="All Categories">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className={styles.searchInfo}>
            {filteredPolls.length} poll(s) found for "{searchTerm}"
            {selectedCategory !== "All Categories" && ` in ${selectedCategory}`}
          </div>
        )}

        <div className={styles.pollList}>
          {user ? (
            filteredPolls.length > 0 ? (
              filteredPolls.map((poll) => (
                <PollCard key={poll._id} poll={poll} />
              ))
            ) : searchTerm || selectedCategory !== "All Categories" ? (
              <div className={styles.noResults}>
                <p>No polls found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All Categories");
                  }}
                  className={styles.resetFilters}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <p>No polls found.</p>
            )
          ) : (
            <p className={styles.loginPrompt}>
              Please log in to see available polls.
            </p>
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
