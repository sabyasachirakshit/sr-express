// routes/chat.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Chat = require("../models/ChatModel");
const User = require("../models/User");

//get all users
router.get('/users', async (req, res) => {
  try {
    // Fetch all users, returning only their _id and username
    const users = await User.find({}, '_id username');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// Get all chats for a user with a specific participant
router.get("/:participantId", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $all: [req.user.id, req.params.participantId] }
    }).populate("participants", "username").populate("messages.sender", "username");;
    res.json(chats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Send a message
router.post("/message", auth, async (req, res) => {
  const { receiverId, message } = req.body;
  try {
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, receiverId] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [req.user.id, receiverId],
        messages: [{ sender: req.user.id, message }],
      });
    } else {
      chat.messages.push({ sender: req.user.id, message });
    }

    await chat.save();
    res.json(chat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
