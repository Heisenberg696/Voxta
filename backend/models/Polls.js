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
    //  NEW: Track users who have voted (optional use for future)
    votedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);
