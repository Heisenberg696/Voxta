// src/components/PollCard/PollCard.js
import React from "react";
import { Link } from "react-router-dom";
import styles from "./PollCard.module.css";
// Import icons for update/delete if you want them (e.g., from lucide-react)
import { Trash2, Edit } from "lucide-react"; // npm install lucide-react if not installed

// Add showVoteButton, showActionButtons, onDelete, onUpdate props
const PollCard = ({
  poll,
  showVoteButton = true,
  showActionButtons = false,
  onDelete,
  onUpdate,
}) => {
  const { _id, question, category, creatorUsername, totalVotes } = poll;

  return (
    // Link the whole card to PollDetail page
    <Link to={`/poll/${_id}`} className={styles.cardLink}>
      <div className={styles.pollCard}>
        <div className={styles.votesContainer}>
          <span className={styles.votesCount}>{totalVotes}</span>
          <span className={styles.votesText}>votes</span>
        </div>

        <div className={styles.content}>
          <div className={styles.categoryBadge}>{category}</div>
          <h3 className={styles.question}>{question}</h3>
          <p className={styles.creator}>by @{creatorUsername || "Unknown"}</p>
        </div>

        {/* Conditionally render Vote button OR Action buttons */}
        {showVoteButton && <button className={styles.voteButton}>Vote</button>}

        {showActionButtons && (
          <div className={styles.actionButtons}>
            <button
              className={styles.updateButton}
              onClick={(e) => {
                e.preventDefault(); // Prevent navigating to PollDetail
                e.stopPropagation(); // Prevent Link from being clicked
                onUpdate && onUpdate(poll); // Pass the whole poll object
              }}
              title="Edit Poll"
            >
              <Edit size={20} /> {/* Lucide edit icon */}
            </button>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                e.preventDefault(); // Prevent navigating to PollDetail
                e.stopPropagation(); // Prevent Link from being clicked
                onDelete && onDelete(_id); // Pass poll ID for deletion
              }}
              title="Delete Poll"
            >
              <Trash2 size={20} /> {/* Lucide trash icon */}
            </button>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PollCard;
