import React, { useState } from "react";
import { useComments } from "../../hooks/useComments";
import { useAuthContext } from "../../hooks/useAuthContext";
import styles from "./CommentForm.module.css";

const CommentForm = ({
  pollId,
  parentCommentId = null,
  onCancel = null,
  placeholder = "Write a comment...",
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createComment } = useComments();
  const { user } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;
    if (!user) return;

    setIsSubmitting(true);

    const commentData = {
      content: content.trim(),
      pollId,
      ...(parentCommentId && { parentCommentId }),
    };

    const success = await createComment(commentData);

    if (success) {
      setContent("");
      if (onCancel) onCancel(); // Close reply form
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setContent("");
    if (onCancel) onCancel();
  };

  if (!user) {
    return (
      <div className={styles.loginPrompt}>
        <p>Please log in to comment on this poll.</p>
      </div>
    );
  }

  return (
    <form className={styles.commentForm} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <span className={styles.username}>@{user.username}</span>
      </div>
      <textarea
        className={styles.textarea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={parentCommentId ? 3 : 4}
        maxLength={1000}
        disabled={isSubmitting}
      />
      <div className={styles.formFooter}>
        <div className={styles.charCount}>{content.length}/1000</div>
        <div className={styles.buttonGroup}>
          {onCancel && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting
              ? "Posting..."
              : parentCommentId
              ? "Reply"
              : "Comment"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
