const Poll = require("../models/Polls");
const User = require("../models/User");

// Create a new poll
const createPoll = async (req, res) => {
  const { question, options, category } = req.body;
  const createdBy = req.user._id;

  try {
    const poll = await Poll.create({
      question,
      options, // should be array of objects like { option: "Yes" }
      category,
      createdBy,
    });
    res.status(201).json(poll);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all polls
const getAllPolls = async (req, res) => {
  try {
    // Populate the createdBy field to get the user data (like username)
    const polls = await Poll.find({})
      .populate("createdBy", "username")
      .sort({ createdAt: -1 }); // Map over polls to calculate the total votes for each poll

    // --- ADD THIS CONSOLE LOG HERE ---
    console.log("Backend: Polls after population:", polls); // ---------------------------------

    const pollsWithTotalVotes = polls.map((poll) => {
      const totalVotes = poll.options.reduce(
        (sum, option) => sum + option.votes,
        0
      );
      return {
        ...poll.toObject(),
        totalVotes,
        creatorUsername: poll.createdBy.username,
      };
    });

    res.status(200).json(pollsWithTotalVotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single poll by ID
const getPollById = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id).populate("createdBy", "username");

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const totalVotes = poll.options.reduce(
      (sum, option) => sum + option.votes,
      0
    );

    res.status(200).json({
      ...poll.toObject(),
      totalVotes,
      creatorUsername: poll.createdBy.username,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get polls created by current user
const getUserPolls = async (req, res) => {
  const userId = req.user._id;
  try {
    const polls = await Poll.find({ createdBy: userId })
      .populate("createdBy", "username") // Populate the creator's username
      .sort({ createdAt: -1 });

    const pollsWithDetails = polls.map((poll) => {
      const totalVotes = poll.options.reduce(
        (sum, option) => sum + option.votes,
        0
      );
      return {
        ...poll.toObject(), // Convert Mongoose document to plain object
        totalVotes,
        creatorUsername: poll.createdBy
          ? poll.createdBy.username
          : "Unknown User", // Add creatorUsername with fallback
      };
    });

    res.status(200).json(pollsWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Update a poll
const updatePoll = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const poll = await Poll.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!poll)
      return res.status(404).json({ error: "Poll not found or unauthorized" });

    res.status(200).json(poll);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a poll
const deletePoll = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const poll = await Poll.findOneAndDelete({ _id: id, createdBy: userId });

    if (!poll)
      return res.status(404).json({ error: "Poll not found or unauthorized" });

    res.status(200).json({ message: "Poll deleted successfully", poll });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New Vote on a poll

const voteOnPoll = async (req, res) => {
  const { pollId } = req.params;
  const { option } = req.body;
  const userId = req.user._id; // Get the authenticated user's ID

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Check if user has already voted on this poll
    if (poll.votedBy.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have already voted on this poll" });
    }

    // Find the option the user wants to vote for
    const selectedOption = poll.options.find((opt) => opt.option === option);
    if (!selectedOption) {
      return res.status(400).json({ error: "Option not found in this poll" });
    }

    // Increment the vote count
    selectedOption.votes += 1;

    // Add user to votedBy array to prevent duplicate voting
    poll.votedBy.push(userId);

    // Save updated poll
    await poll.save();

    res.status(200).json({
      message: "Vote cast successfully",
      updatedOption: selectedOption,
      poll,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get polls voted by a particular user
const getPollsVotedByUser = async (req, res) => {
  const userId = req.user._id;
  try {
    // Populate the createdBy field and sort
    const polls = await Poll.find({ votedBy: userId })
      .populate("createdBy", "username") // Populate to get username
      .sort({ createdAt: -1 }); // Map over polls to calculate total votes and include creatorUsername

    const pollsWithDetails = polls.map((poll) => {
      const totalVotes = poll.options.reduce(
        (sum, option) => sum + option.votes,
        0
      );
      return {
        ...poll.toObject(), // Convert Mongoose document to plain object
        totalVotes,
        creatorUsername: poll.createdBy
          ? poll.createdBy.username
          : "Unknown User", // Add creatorUsername with fallback
      };
    });

    res.status(200).json(pollsWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  getUserPolls,
  updatePoll,
  deletePoll,
  voteOnPoll,
  getPollsVotedByUser,
};
