const express = require("express");
const {
  createComment,
  getCommentsForPoll,
  getRepliesForComment,
  updateComment,
  deleteComment,
  getUserComments,
} = require("../controllers/commentController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Apply auth middleware to all comment routes
router.use(requireAuth);

// Comment CRUD operations
router.post("/", createComment); // POST /api/comments
router.get("/poll/:pollId", getCommentsForPoll); // GET /api/comments/poll/:pollId
router.get("/:commentId/replies", getRepliesForComment); // GET /api/comments/:commentId/replies
router.patch("/:commentId", updateComment); // PATCH /api/comments/:commentId
router.delete("/:commentId", deleteComment); // DELETE /api/comments/:commentId
router.get("/user/my-comments", getUserComments); // GET /api/comments/user/my-comments

module.exports = router;
