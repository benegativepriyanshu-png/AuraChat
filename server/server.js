// =====================================================
// 🌐 AuraChat — Server Entry File
// =====================================================

// Load environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

// Database + Socket logic
const connectDB = require('./src/config/db');
const chatSocket = require('./src/socket/chatSocket');

// Models
const User = require('./src/models/User');
const Room = require('./src/models/Room');

// Initialize app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));   // Handle base64 avatars

// Connect to MongoDB
connectDB(process.env.MONGODB_URI);

// =====================================================
// 📁 Serve Frontend Client
// =====================================================
app.use(express.static(path.join(__dirname, "../Client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/index.html"));
});

// =====================================================
// 📌 API ROUTES
// =====================================================

// ------------------------
// 👤 Create User
// ------------------------
app.post("/api/users", async (req, res) => {
  try {
    const { username, avatarUrl, language } = req.body;

    if (!username || !language) {
      return res.status(400).json({ error: "Username and language required" });
    }

    const user = await User.create({ username, avatarUrl, language });
    res.json(user);
  } catch (err) {
    console.error("❌ Create User Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------
// 🏠 Fetch Rooms
// ------------------------
app.get("/api/rooms", async (req, res) => {
  try {
    const rooms = await Room.find().lean();
    res.json(rooms);
  } catch (err) {
    console.error("❌ Fetch Rooms Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------
// 🆕 Create Room
// ------------------------
app.post("/api/rooms", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Room name required" });
    }

    const room = await Room.create({ name });
    res.json(room);
  } catch (err) {
    console.error("❌ Create Room Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================================================
// 🔌 SOCKET.IO SETUP
// =====================================================
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: { origin: "*" }
});

chatSocket(io);

// =====================================================
// 🚀 Start Server
// =====================================================
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
