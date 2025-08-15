import { useContext } from "react";
import { PollContext } from "../context/PollContext";

export const usePollContext = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error("usePollContext must be used inside a PollContextProvider");
  }
  return context;
};
