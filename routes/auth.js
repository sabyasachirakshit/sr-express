// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");

// Register a new user

const validateRegisterInput = (
  username,
  firstname,
  lastname,
  number,
  password
) => {
  if (!username) return "Username is required";
  if (!firstname) return "First name is required";
  if (!lastname) return "Last name is required";
  if (!number) return "Phone number is required";
  if (!password) return "Password is required";
  return null;
};

router.post("/register", async (req, res) => {
  const {
    username,
    firstname,
    lastname,
    number,
    password,
    securityQuestion,
    securityAnswer,
  } = req.body;
  const validationError = validateRegisterInput(
    username,
    firstname,
    lastname,
    number,
    password
  );
  if (validationError) {
    return res.status(400).json({ msg: validationError });
  }
  try {
    let user = await User.findOne({ username });
    let num = await User.findOne({ number });
    if (user) {
      return res
        .status(400)
        .json({ msg: `User named ${username} already exists` });
    }
    if (num) {
      return res
        .status(400)
        .json({ msg: `User of the given number ${number} already exists` });
    }
    user = new User({
      username,
      firstname,
      lastname,
      number,
      password,
      securityQuestion,
      securityAnswer,
    });
    await user.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect Password" });
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// routes/auth.js
router.post("/forgot-password", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    res.status(200).json({ securityQuestion: user.securityQuestion });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/reset-password", async (req, res) => {
  const { username, securityAnswer, newPassword } = req.body;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(securityAnswer, user.securityAnswer);
    if (!isMatch) {
      return res.status(400).json({ msg: "Security answer is incorrect" });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({ msg: "Password has been reset successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
