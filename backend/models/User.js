const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
});

// STATIC SIGNUP METHOD
userSchema.statics.signup = async function (username, email, password) {
  if (!username || !email || !password) {
    throw Error("All fields are required");
  }
  if (!validator.isEmail(email)) {
    throw Error("A valid email is required");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("Provide a stronger password");
  }

  const emailExists = await this.findOne({ email });
  if (emailExists) {
    throw Error("Email already exists");
  }

  const usernameExists = await this.findOne({ username });
  if (usernameExists) {
    throw Error("Username already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ username, email, password: hash });

  return user;
};

// STATIC LOGIN METHOD
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields are required");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
