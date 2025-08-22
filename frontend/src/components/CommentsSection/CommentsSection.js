import React, { useEffect } from "react";
import { useCommentContext } from "../../hooks/useCommentContext";
import { useComments } from "../../hooks/useComments";
import CommentForm from "../CommentForm/CommentForm";
import Comment from "../Comment/Comment";
import styles from "./CommentsSection.module.css";

const CommentsSection = ({ pollId }) => {
  const { comments, loading, error, totalComments, hasMore, currentPage } =
    useCommentContext();

  const { fetchComments, clearComments } = useComments();

  useEffect(() => {
    // Fetch comments when component mounts or pollId changes
    fetchComments(pollId);

    // Cleanup when component unmounts or pollId changes
    return () => {
      clearComments();
    };
  }, [pollId, fetchComments, clearComments]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchComments(pollId, currentPage + 1);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className={styles.commentsSection}>
        <h2 className={styles.sectionTitle}>Comments</h2>
        <div className={styles.loading}>Loading comments...</div>
      </div>
    );
  }

  return (
    <div className={styles.commentsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          Comments
          {totalComments > 0 && (
            <span className={styles.commentCount}>({totalComments})</span>
          )}
        </h2>
      </div>

      {/* Comment Form */}
      <div className={styles.commentFormSection}>
        <CommentForm pollId={pollId} />
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      )}

      {/* Comments List */}
      <div className={styles.commentsList}>
        {comments.length === 0 && !loading ? (
          <div className={styles.noComments}>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                pollId={pollId}
                level={0}
                onCommentDeleted={(deletedCommentId) => {
                  console.log("Comment deleted:", deletedCommentId);
                }}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className={styles.loadMoreSection}>
                <button
                  className={styles.loadMoreButton}
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More Comments"}
                </button>
              </div>
            )}

            {/* Loading indicator for additional comments */}
            {loading && comments.length > 0 && (
              <div className={styles.loadingMore}>Loading more comments...</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
