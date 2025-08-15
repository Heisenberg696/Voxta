import { createContext, useReducer } from "react";

export const PollContext = createContext();

export const pollReducer = (state, action) => {
  switch (action.type) {
    case "SET_POLLS":
      // payload: array (could be [])
      return { ...state, polls: action.payload };

    case "CREATE_POLL":
      // payload: poll object
      return {
        ...state,
        polls: state.polls
          ? [action.payload, ...state.polls]
          : [action.payload],
      };

    case "UPDATE_POLL":
      // payload: updated poll object
      return {
        ...state,
        polls: state.polls
          ? state.polls.map((p) =>
              p._id === action.payload._id ? action.payload : p
            )
          : null,
      };

    case "VOTE_POLL":
      // payload: updated poll object returned by vote endpoint
      return {
        ...state,
        polls: state.polls
          ? state.polls.map((p) =>
              p._id === action.payload._id ? action.payload : p
            )
          : null,
      };

    case "DELETE_POLL":
      // payload: pollId (string)
      return {
        ...state,
        polls: state.polls
          ? state.polls.filter((p) => p._id !== action.payload)
          : null,
      };

    case "CLEAR_POLLS":
      // Clear all polls (useful for logout)
      return {
        ...state,
        polls: null,
      };

    case "REFRESH_POLLS":
      // Force refresh by setting polls to null
      return {
        ...state,
        polls: null,
      };

    default:
      return state;
  }
};

export const PollContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pollReducer, {
    polls: null, // null = not fetched yet
  });

  return (
    <PollContext.Provider value={{ ...state, dispatch }}>
      {children}
    </PollContext.Provider>
  );
};
