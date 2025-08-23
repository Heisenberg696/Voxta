const User = require("../models/User");
const jwt = require("jsonwebtoken");

// helper to create JWT
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// login controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for email:", email);

  try {
    console.log("Attempting User.login...");
    const user = await User.login(email, password);
    console.log("User login successful, creating token...");
    const token = createToken(user._id);
    console.log("Token created successfully");

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    console.error("Login error stack:", error.stack);
    res.status(400).json({ error: error.message });
  }
};

// signup controller
const signupUser = async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Signup attempt for:", { username, email });

  try {
    console.log("Attempting User.signup...");
    const user = await User.signup(username, email, password);
    console.log("User signup successful, creating token...");
    const token = createToken(user._id);
    console.log("Token created successfully");

    res.status(200).json({
      _id: user._id,
      username,
      email,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    console.error("Signup error stack:", error.stack);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { loginUser, signupUser };
