const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        option: String,
        votes: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    category: {
      type: String,
      enum: [
        "Technology",
        "Entertainment",
        "Science",
        "Sports",
        "Food",
        "Travel & Leisure",
        "Food & Drink",
        "Media",
        "Lifestyle",
        "Education",
        "Health",
        "Politics",
        "Other",
      ],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Keep existing votedBy for backward compatibility
    votedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // NEW: Track specific votes with user and option details
    userVotes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        optionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        optionText: {
          type: String,
          required: true,
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);
