import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";

// Initialize Express app
const app = express();
const port = 5000;

// Enable CORS for all origins
app.use(cors({ origin: "*" }));

// Create HTTP server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ room, userName }) => {
    socket.join(room);
    console.log(`User ${userName} joined room: ${room}`);
    socket.to(room).emit("user-joined", `${userName} joined room`);
  });

  socket.on("message", ({ room, message, sender }) => {
    console.log(`Message from ${sender} in room ${room}: ${message}`);
    socket.to(room).emit("message", { message, sender });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// API Test Route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Start server
httpServer.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
  keepServerAwake(); // Start the keep-alive function
});

// Self-ping function to prevent Render from sleeping
const keepAliveURL = "https://ride-sharing-app-chat-bot-backend.onrender.com/";

function keepServerAwake() {
  setInterval(() => {
    fetch(keepAliveURL)
      .then(() => console.log("Keeping server awake..."))
      .catch((err) => console.error("Error pinging server:", err));
  }, 9 * 60 * 1000); // Ping every 9 minutes
}
