import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";

const app = express();
const port = 5000;

// Enable CORS for all origins
app.use(cors({ origin: "*" }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

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

httpServer.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
