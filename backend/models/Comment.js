const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, // Reasonable limit for comments
    },
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null for top-level comments, ObjectId for replies
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // Track reply count for performance
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // Add indexes for better query performance
    indexes: [
      { pollId: 1, createdAt: -1 }, // For fetching poll comments
      { parentCommentId: 1, createdAt: 1 }, // For fetching replies
      { userId: 1, createdAt: -1 }, // For user's comments
    ],
  }
);

// Virtual to get replies
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentCommentId",
  match: { isDeleted: false },
});

// Ensure virtual fields are serialized
commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });

// Pre-save middleware to handle soft deletion
commentSchema.pre("save", function (next) {
  if (this.isModified("isDeleted") && this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  next();
});

// Static method to soft delete a comment
commentSchema.statics.softDelete = async function (commentId, userId) {
  const comment = await this.findOne({
    _id: commentId,
    userId: userId,
    isDeleted: false,
  });

  if (!comment) {
    throw new Error("Comment not found or unauthorized");
  }

  // Check if comment has replies
  const replyCount = await this.countDocuments({
    parentCommentId: commentId,
    isDeleted: false,
  });

  if (replyCount > 0) {
    // Soft delete - keep structure for replies
    comment.isDeleted = true;
    comment.content = "[Comment deleted by author]";
    await comment.save();
    return { type: "soft_deleted", comment };
  } else {
    // Hard delete - no replies exist
    await this.findByIdAndDelete(commentId);

    // Update parent comment reply count if this was a reply
    if (comment.parentCommentId) {
      await this.findByIdAndUpdate(comment.parentCommentId, {
        $inc: { replyCount: -1 },
      });
    }

    return { type: "hard_deleted", commentId };
  }
};

// Static method to get comments with replies for a poll
commentSchema.statics.getCommentsForPoll = async function (
  pollId,
  options = {}
) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  // Get top-level comments
  const comments = await this.find({
    pollId: pollId,
    parentCommentId: null,
    isDeleted: false,
  })
    .populate("userId", "username")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get replies for each comment (limit replies to avoid overloading)
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await this.find({
        parentCommentId: comment._id,
        isDeleted: false,
      })
        .populate("userId", "username")
        .sort({ createdAt: 1 })
        .limit(5); // Limit initial replies load

      return {
        ...comment.toObject(),
        replies: replies,
        hasMoreReplies: comment.replyCount > replies.length,
      };
    })
  );

  const totalComments = await this.countDocuments({
    pollId: pollId,
    parentCommentId: null,
    isDeleted: false,
  });

  return {
    comments: commentsWithReplies,
    totalComments,
    currentPage: page,
    totalPages: Math.ceil(totalComments / limit),
    hasMore: page < Math.ceil(totalComments / limit),
  };
};

module.exports = mongoose.model("Comment", commentSchema);
