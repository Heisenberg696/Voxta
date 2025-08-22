import React, { useState } from "react";
import { useComments } from "../../hooks/useComments";
import { useAuthContext } from "../../hooks/useAuthContext";
import CommentForm from "../CommentForm/CommentForm";
import styles from "./Comment.module.css";
// REMOVED: import { applyTimestamps } from "../../../../backend/models/User";

const Comment = ({ comment, pollId, level = 0, onCommentDeleted }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const [isDeleting, setIsDeleting] = useState(false);

  const { updateComment, deleteComment, loadMoreReplies } = useComments();
  const { user } = useAuthContext();

  // Clean user ID comparison now that _id is included in user object
  const commentUserId =
    typeof comment.userId === "object" && comment.userId?._id
      ? comment.userId._id
      : comment.userId;

  const currentUserId = user?._id;

  // Convert both to strings for comparison to handle ObjectId vs string mismatches
  const commentUserIdStr = commentUserId ? String(commentUserId) : null;
  const currentUserIdStr = currentUserId ? String(currentUserId) : null;

  const isAuthor =
    user &&
    commentUserIdStr &&
    currentUserIdStr &&
    commentUserIdStr === currentUserIdStr;

  const isDeleted = comment.isDeleted;
  const maxNestingLevel = 3; // Prevent infinite nesting

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)}d ago`;

      return date.toLocaleDateString();
    } catch (error) {
      return "Unknown time";
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      const success = await updateComment(comment._id, editContent.trim());
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this comment? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const success = await deleteComment(comment._id);
      if (success) {
        // Notify parent component about the deletion
        if (onCommentDeleted) {
          onCommentDeleted(comment._id);
        }

        // If this is a top-level comment with no replies, it will be removed from UI
        // If it has replies, it will show as [deleted] but remain visible
      } else {
        throw new Error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete comment. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLoadMoreReplies = async () => {
    try {
      const currentRepliesCount = comment.replies?.length || 0;
      const page = Math.floor(currentRepliesCount / 10) + 2; // Assuming 10 per page
      await loadMoreReplies(comment._id, page);
    } catch (error) {
      console.error("Failed to load more replies:", error);
    }
  };

  const handleReplySubmit = () => {
    setShowReplyForm(false);
  };

  const handleReplyDeleted = (replyId) => {
    // Handle when a nested reply is deleted
    // The useComments hook should handle updating the UI
    console.log(`Reply ${replyId} was deleted`);
  };

  // Don't render deleted comments that have no replies
  if (isDeleted && (!comment.replies || comment.replies.length === 0)) {
    return null;
  }

  return (
    <div
      className={`${styles.comment} ${
        level > 0 ? styles.reply : styles.topLevel
      } ${isDeleting ? styles.deleting : ""}`}
    >
      <div className={styles.commentHeader}>
        <div className={styles.userInfo}>
          <span className={styles.username}>
            {isDeleted
              ? "[Deleted User]"
              : comment.userId?.username || comment.userId || "Unknown User"}
          </span>
          <span className={styles.timestamp}>
            {formatDate(comment.createdAt)}
          </span>
          {comment.updatedAt !== comment.createdAt && !isDeleted && (
            <span className={styles.edited}>(edited)</span>
          )}
        </div>

        {/* Enhanced condition with better debugging */}
        {!isDeleted && isAuthor && !isDeleting && (
          <div className={styles.commentActions}>
            <button
              className={styles.actionButton}
              onClick={() => setIsEditing(!isEditing)}
              disabled={isDeleting}
              title="Edit comment"
            >
              Edit
            </button>
            <button
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete comment"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      <div className={styles.commentBody}>
        {isEditing ? (
          <div className={styles.editForm}>
            <textarea
              className={styles.editTextarea}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={1000}
              placeholder="Edit your comment..."
            />
            <div className={styles.editActions}>
              <button
                className={styles.saveButton}
                onClick={handleEdit}
                disabled={!editContent.trim() || isDeleting}
              >
                Save Changes
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`${styles.content} ${
              isDeleted ? styles.deletedContent : ""
            }`}
          >
            {isDeleted ? "[This comment has been deleted]" : comment.content}
          </p>
        )}
      </div>

      {!isDeleted && !isEditing && !isDeleting && (
        <div className={styles.commentFooter}>
          {level < maxNestingLevel && user && (
            <button
              className={styles.replyButton}
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </button>
          )}

          {comment.replyCount > 0 && (
            <span className={styles.replyCount}>
              {comment.replyCount}{" "}
              {comment.replyCount === 1 ? "reply" : "replies"}
            </span>
          )}
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && user && !isDeleting && (
        <div className={styles.replyFormContainer}>
          <CommentForm
            pollId={pollId}
            parentCommentId={comment._id}
            onCancel={() => setShowReplyForm(false)}
            onSubmit={handleReplySubmit}
            placeholder={`Reply to ${
              comment.userId?.username || comment.userId || "user"
            }...`}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              pollId={pollId}
              level={level + 1}
              onCommentDeleted={handleReplyDeleted}
            />
          ))}

          {comment.hasMoreReplies && (
            <button
              className={styles.loadMoreButton}
              onClick={handleLoadMoreReplies}
            >
              Load more replies...
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;
