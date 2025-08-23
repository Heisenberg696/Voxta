const User = require("../models/User");
const jwt = require("jsonwebtoken");

// helper to create JWT
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// login controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);

    // Include _id in the response
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup controller
const signupUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.signup(username, email, password);
    const token = createToken(user._id);

    // Include _id in the response
    res.status(200).json({
      _id: user._id, // Added this line
      username,
      email,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { loginUser, signupUser };
