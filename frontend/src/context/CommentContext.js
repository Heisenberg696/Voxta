import React, { createContext, useReducer } from "react";

// Initial state
const initialState = {
  comments: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  hasMore: false,
  totalComments: 0,
};

// Action types
export const COMMENT_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_COMMENTS: "SET_COMMENTS",
  ADD_COMMENT: "ADD_COMMENT",
  UPDATE_COMMENT: "UPDATE_COMMENT",
  DELETE_COMMENT: "DELETE_COMMENT",
  ADD_REPLY: "ADD_REPLY",
  LOAD_MORE_REPLIES: "LOAD_MORE_REPLIES",
  CLEAR_COMMENTS: "CLEAR_COMMENTS",
};

// Reducer function
const commentReducer = (state, action) => {
  switch (action.type) {
    case COMMENT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case COMMENT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case COMMENT_ACTIONS.SET_COMMENTS:
      return {
        ...state,
        comments: action.payload.comments,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        hasMore: action.payload.hasMore,
        totalComments: action.payload.totalComments,
        loading: false,
        error: null,
      };

    case COMMENT_ACTIONS.ADD_COMMENT:
      return {
        ...state,
        comments: [action.payload, ...state.comments],
        totalComments: state.totalComments + 1,
        error: null,
      };

    case COMMENT_ACTIONS.UPDATE_COMMENT:
      return {
        ...state,
        comments: state.comments.map((comment) =>
          comment._id === action.payload._id
            ? { ...comment, ...action.payload }
            : comment
        ),
        error: null,
      };

    case COMMENT_ACTIONS.DELETE_COMMENT: {
      const { type, comment, commentId } = action.payload;

      // Helper function to recursively update comments and replies
      const updateCommentsRecursively = (comments, targetId, updateFn) => {
        return comments.map((c) => {
          // Check if this is the comment we want to update
          if (c._id === targetId) {
            return updateFn(c);
          }

          // If this comment has replies, check them recursively
          if (c.replies && c.replies.length > 0) {
            const updatedReplies = updateCommentsRecursively(
              c.replies,
              targetId,
              updateFn
            );
            // Only update if replies actually changed
            if (updatedReplies !== c.replies) {
              return { ...c, replies: updatedReplies };
            }
          }

          return c;
        });
      };

      // Helper function to recursively filter comments and replies
      const filterCommentsRecursively = (comments, targetId) => {
        return comments.reduce((acc, c) => {
          // If this is the comment to delete, don't include it
          if (c._id === targetId) {
            return acc;
          }

          // If this comment has replies, filter them recursively
          if (c.replies && c.replies.length > 0) {
            const filteredReplies = filterCommentsRecursively(
              c.replies,
              targetId
            );
            acc.push({ ...c, replies: filteredReplies });
          } else {
            acc.push(c);
          }

          return acc;
        }, []);
      };

      if (type === "hard_deleted") {
        // Remove the comment completely from the state (works for both top-level and replies)
        return {
          ...state,
          comments: filterCommentsRecursively(state.comments, commentId),
          totalComments: state.totalComments - 1,
          error: null,
        };
      } else if (type === "soft_deleted" && comment) {
        // Update the comment to show it's deleted but keep the structure
        return {
          ...state,
          comments: updateCommentsRecursively(
            state.comments,
            comment._id,
            () => ({
              ...comment,
              isDeleted: true,
              content: "[This comment has been deleted]",
            })
          ),
          error: null,
        };
      }

      return state;
    }

    case COMMENT_ACTIONS.ADD_REPLY:
      return {
        ...state,
        comments: state.comments.map((comment) => {
          if (comment._id === action.payload.parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), action.payload.reply],
              replyCount: comment.replyCount + 1,
            };
          }
          return comment;
        }),
        error: null,
      };

    case COMMENT_ACTIONS.LOAD_MORE_REPLIES:
      return {
        ...state,
        comments: state.comments.map((comment) => {
          if (comment._id === action.payload.commentId) {
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                ...action.payload.newReplies,
              ],
              hasMoreReplies: action.payload.hasMore,
            };
          }
          return comment;
        }),
        error: null,
      };

    case COMMENT_ACTIONS.CLEAR_COMMENTS:
      return initialState;

    default:
      return state;
  }
};

// Create context
export const CommentContext = createContext();

// Context provider component
export const CommentContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(commentReducer, initialState);

  return (
    <CommentContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CommentContext.Provider>
  );
};
