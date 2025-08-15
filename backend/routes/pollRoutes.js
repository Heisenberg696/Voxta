const express = require("express");
const {
  createPoll,
  getAllPolls,
  getPollById,
  getUserPolls,
  updatePoll,
  deletePoll,
  voteOnPoll,
  getPollsVotedByUser,
} = require("../controllers/pollController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Public route - get all polls (no auth required)
router.get("/", getAllPolls);

// Apply auth middleware to all routes below this point
router.use(requireAuth);

// Protected routes - put specific routes BEFORE parameterized routes
router.get("/voted", getPollsVotedByUser);
router.get("/user/mypolls", getUserPolls); // Keep your existing route
router.get("/user", getUserPolls); // Add alias for frontend consistency

// Parameterized routes AFTER specific routes
router.get("/:id", getPollById);

// CRUD operations
router.post("/", createPoll);
router.patch("/:id", updatePoll);
router.delete("/:id", deletePoll);

// Voting
router.patch("/:pollId/vote", voteOnPoll);

module.exports = router;
