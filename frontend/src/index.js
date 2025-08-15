import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { PollContextProvider } from "./context/PollContext";
import { AuthContextProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <PollContextProvider>
        <App />
      </PollContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
