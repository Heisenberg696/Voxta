const Comment = require("../models/Comment");
const Poll = require("../models/Polls");

// Create a new comment
const createComment = async (req, res) => {
  const { content, pollId, parentCommentId } = req.body;
  const userId = req.user._id;

  try {
    // Verify poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // If it's a reply, verify parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findOne({
        _id: parentCommentId,
        pollId: pollId,
        isDeleted: false,
      });

      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found" });
      }
    }

    // Create the comment
    const comment = await Comment.create({
      content: content.trim(),
      pollId,
      userId,
      parentCommentId: parentCommentId || null,
    });

    // Update parent comment reply count if this is a reply
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { replyCount: 1 },
      });
    }

    // Populate user data for response
    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "username"
    );

    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get comments for a specific poll
const getCommentsForPoll = async (req, res) => {
  const { pollId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  try {
    // Verify poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const result = await Comment.getCommentsForPoll(pollId, { page, limit });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get replies for a specific comment
const getRepliesForComment = async (req, res) => {
  const { commentId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Verify parent comment exists
    const parentComment = await Comment.findOne({
      _id: commentId,
      isDeleted: false,
    });

    if (!parentComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const replies = await Comment.find({
      parentCommentId: commentId,
      isDeleted: false,
    })
      .populate("userId", "username")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const totalReplies = await Comment.countDocuments({
      parentCommentId: commentId,
      isDeleted: false,
    });

    res.status(200).json({
      replies,
      totalReplies,
      currentPage: page,
      totalPages: Math.ceil(totalReplies / limit),
      hasMore: page < Math.ceil(totalReplies / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a comment (only by the author)
const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  try {
    const comment = await Comment.findOneAndUpdate(
      {
        _id: commentId,
        userId: userId,
        isDeleted: false,
      },
      {
        content: content.trim(),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("userId", "username");

    if (!comment) {
      return res
        .status(404)
        .json({ error: "Comment not found or unauthorized" });
    }

    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a comment (soft delete if has replies, hard delete if no replies)
const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    const result = await Comment.softDelete(commentId, userId);

    res.status(200).json({
      message: "Comment deleted successfully",
      ...result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get comments by current user (for user profile/management)
const getUserComments = async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const comments = await Comment.find({
      userId: userId,
      isDeleted: false,
    })
      .populate("pollId", "question")
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await Comment.countDocuments({
      userId: userId,
      isDeleted: false,
    });

    res.status(200).json({
      comments,
      totalComments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      hasMore: page < Math.ceil(totalComments / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createComment,
  getCommentsForPoll,
  getRepliesForComment,
  updateComment,
  deleteComment,
  getUserComments,
};
