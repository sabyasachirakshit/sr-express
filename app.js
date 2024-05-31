// app.js
const express = require('express');
const mongoose = require('mongoose');
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chatRoutes = require("./routes/chat");
const todoRoutes = require('./routes/todo');
const Chat = require("./models/ChatModel");
const User=require("./models/User")
const config = require('./config');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "https://sr-react-app.onrender.com/", // Update this to your frontend URL if different
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true
  }
});

// Connect to MongoDB
mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user/chat', chatRoutes);
app.use('/api/todo', todoRoutes);


// Map to store user sockets
const userSockets = {};

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected");

  // Store the user's socket ID
  socket.on("register", (userId) => {
    userSockets[userId] = socket.id;
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // Remove the user from the userSockets map
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
  });

  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
      let chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!chat) {
        chat = new Chat({
          participants: [senderId, receiverId],
          messages: [{ sender: senderId, message }],
        });
      } else {
        chat.messages.push({ sender: senderId, message });
      }

      const savedChat = await chat.save();

      // Fetch sender's username
      const sender = await User.findById(senderId).select('username');

      // Prepare the new message
      const newMessage = {
        sender: {
          _id: senderId,
          username: sender.username
        },
        message,
        timestamp: new Date().toISOString()
      };

      // Emit the message to the sender and receiver
      if (userSockets[senderId]) {
        console.log("Under sender",{
          senderId,
          receiverId,
          message: newMessage,
        })
        io.to(userSockets[senderId]).emit("receiveMessage", {
          senderId,
          receiverId,
          message: newMessage,
        });
      }
      if (userSockets[receiverId]) {
        console.log("Under receiver",{
          senderId,
          receiverId,
          message: newMessage,
        })
        io.to(userSockets[receiverId]).emit("receiveMessage", {
          senderId,
          receiverId,
          message: newMessage,
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  });
});


// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
