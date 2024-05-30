// routes/user.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const ToDoModel = require("../models/ToDoModel");

// @route    GET api/user/data
// @desc     Get user data
// @access   Private
router.get("/data", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete user account
router.delete("/delete", auth, async (req, res) => {
  try {
    await ToDoModel.deleteMany({ user: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
