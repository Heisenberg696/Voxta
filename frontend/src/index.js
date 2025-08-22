import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { PollContextProvider } from "./context/PollContext";
import { AuthContextProvider } from "./context/AuthContext";
import { CommentContextProvider } from "./context/CommentContext"; // Add this import

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <PollContextProvider>
        <CommentContextProvider>
          <App />
        </CommentContextProvider>
      </PollContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
