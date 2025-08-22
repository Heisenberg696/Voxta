// src/components/PollCard/PollCard.js
import React from "react";
import { Link } from "react-router-dom";
import styles from "./PollCard.module.css";
import { Trash2, Edit } from "lucide-react";

// Helper function to format timestamp
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const createdDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - createdDate) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// Helper function to get category color
const getCategoryColor = (category) => {
  const categoryColors = {
    Technology: "#DD6B20", // Orange
    Entertainment: "#E53E3E", // Red
    Science: "#38A169", // Green
    Sports: "#3182CE", // Blue
    Food: "#D69E2E", // Yellow
    "Travel & Leisure": "#6B46C1", // Purple
    "Food & Drink": "#38B2AC", // Teal
    Media: "#ED64A6", // Pink
    Lifestyle: "#ECC94B", // Light Yellow
    Education: "#4299E1", // Light Blue
    Health: "#48BB78", // Light Green
    Politics: "#9F7AEA", // Light Purple
    Other: "#718096", // Gray
  };

  return categoryColors[category] || "#6B46C1"; // Default to purple
};

const PollCard = ({
  poll,
  showVoteButton = true,
  showActionButtons = false,
  onDelete,
  onUpdate,
}) => {
  const { _id, question, category, creatorUsername, totalVotes, createdAt } =
    poll;

  return (
    <Link to={`/poll/${_id}`} className={styles.cardLink}>
      <div className={styles.pollCard}>
        <div className={styles.votesContainer}>
          <span className={styles.votesCount}>{totalVotes}</span>
          <span className={styles.votesText}>votes</span>
        </div>

        <div className={styles.content}>
          <div
            className={styles.categoryBadge}
            style={{ backgroundColor: getCategoryColor(category) }}
          >
            {category}
          </div>

          <h3 className={styles.question}>{question}</h3>

          <div className={styles.footer}>
            <p className={styles.creator}>by @{creatorUsername || "Unknown"}</p>
            {createdAt && (
              <span className={styles.timestamp}>
                {formatTimeAgo(createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* Conditionally render Vote button OR Action buttons */}
        {showVoteButton && <button className={styles.voteButton}>Vote</button>}

        {showActionButtons && (
          <div className={styles.actionButtons}>
            <button
              className={styles.updateButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUpdate && onUpdate(poll);
              }}
              title="Edit Poll"
            >
              <Edit size={20} />
            </button>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete && onDelete(_id);
              }}
              title="Delete Poll"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PollCard;
