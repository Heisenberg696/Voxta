import { useCallback } from "react";
import API_BASE_URL from "../config/api";
import axios from "axios";
import { useCommentContext } from "./useCommentContext";
import { useAuthContext } from "./useAuthContext";
import { COMMENT_ACTIONS } from "../context/CommentContext";

export const useComments = () => {
  const { dispatch } = useCommentContext();
  const { user } = useAuthContext();

  // Fetch comments for a poll
  const fetchComments = useCallback(
    async (pollId, page = 1) => {
      dispatch({ type: COMMENT_ACTIONS.SET_LOADING, payload: true });

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/comments/poll/${pollId}?page=${page}`,
          {
            headers: {
              Authorization: user ? `Bearer ${user.token}` : "",
            },
          }
        );

        if (response.status === 200) {
          dispatch({
            type: COMMENT_ACTIONS.SET_COMMENTS,
            payload: response.data,
          });
        }
      } catch (error) {
        dispatch({
          type: COMMENT_ACTIONS.SET_ERROR,
          payload:
            error.response?.data?.error ||
            error.message ||
            "Failed to fetch comments",
        });
      }
    },
    [dispatch, user]
  );

  // Create a new comment
  const createComment = useCallback(
    async (commentData) => {
      if (!user) {
        dispatch({
          type: COMMENT_ACTIONS.SET_ERROR,
          payload: "You must be logged in to comment",
        });
        return false;
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/comments`,
          commentData,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (response.status === 201) {
          const newComment = response.data.comment;

          if (commentData.parentCommentId) {
            // It's a reply
            dispatch({
              type: COMMENT_ACTIONS.ADD_REPLY,
              payload: {
                parentCommentId: commentData.parentCommentId,
                reply: newComment,
              },
            });
          } else {
            // It's a top-level comment
            dispatch({
              type: COMMENT_ACTIONS.ADD_COMMENT,
              payload: newComment,
            });
          }
          return true;
        }
      } catch (error) {
        dispatch({
          type: COMMENT_ACTIONS.SET_ERROR,
          payload:
            error.response?.data?.error ||
            error.message ||
            "Failed to create comment",
        });
        return false;
      }
    },
    [dispatch, user]
  );

  // Update a comment
  const updateComment = useCallback(
    async (commentId, content) => {
      if (!user) {
        dispatch({
          type: COMMENT_ACTIONS.SET_ERROR,
          payload: "You must be logged in to update comments",
        });
        return false;
      }

      try {
        const response = await axios.patch(
          `${API_BASE_URL}/api/comments/${commentId}`,
          { content },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (response.status === 200) {
          dispatch({
            type: COMMENT_ACTIONS.UPDATE_COMMENT,
            payload: response.data.comment,
          });
          return true;
        }
      } catch (error) {
        dispatch({
          type: COMMENT_ACTIONS.SET_ERROR,
          payload:
            error.response?.data?.error ||
            error.message ||
            "Failed to update comment",
        });
        return false;
      }
    },
    [dispatch, user]
  );

  // Delete a comment
  const deleteComment = useCallback(
    async (commentId) => {
      if (!user) {
        dispatch({
          type: COMMENT_ACTIONS.SET_ERROR,
          payload: "You must be logged in to delete comments",
        });
        return false;
      }

      try {
        const response = await axios.delete(
          `${API_BASE_URL}/api/comments/${commentId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (response.status === 200) {
          dispatch({
            type: COMMENT_ACTIONS.DELETE_COMMENT,
            payload: {
              type: response.data.type,
              comment: response.data.comment,
              commentId: response.data.commentId,
            },
          });
          return true;
        }
      } catch (error) {
        dispatch({
          type: COMMENT_ACTIONS.SET_ERROR,
          payload:
            error.response?.data?.error ||
            error.message ||
            "Failed to delete comment",
        });
        return false;
      }
    },
    [dispatch, user]
  );

  // Load more replies for a comment
  const loadMoreReplies = useCallback(
    async (commentId, page = 2) => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/comments/${commentId}/replies?page=${page}`,
          {
            headers: {
              Authorization: user ? `Bearer ${user.token}` : "",
            },
          }
        );

        if (response.status === 200) {
          dispatch({
            type: COMMENT_ACTIONS.LOAD_MORE_REPLIES,
            payload: {
              commentId,
              newReplies: response.data.replies,
              hasMore: response.data.hasMore,
            },
          });
          return true;
        }
      } catch (error) {
        dispatch({
          type: COMMENT_ACTIONS.SET_ERROR,
          payload:
            error.response?.data?.error ||
            error.message ||
            "Failed to load more replies",
        });
        return false;
      }
    },
    [dispatch, user]
  );

  // Clear comments (useful when leaving a poll page)
  const clearComments = useCallback(() => {
    dispatch({ type: COMMENT_ACTIONS.CLEAR_COMMENTS });
  }, [dispatch]);

  return {
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    loadMoreReplies,
    clearComments,
  };
};
