import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
// Get allowed origins from environment or use defaults
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store active rooms
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Join a debate room
  socket.on("join-debate", (debateCallId) => {
    socket.join(debateCallId);
    console.log(`📞 User ${socket.id} joined debate: ${debateCallId}`);
    
    // Get current room members
    const room = io.sockets.adapter.rooms.get(debateCallId);
    const memberCount = room ? room.size : 0;
    
    // Store socket in room
    if (!rooms.has(debateCallId)) {
      rooms.set(debateCallId, new Set());
    }
    rooms.get(debateCallId).add(socket.id);
    
    // Notify others in the room
    socket.to(debateCallId).emit("user-joined", socket.id);
    
    // Send list of existing users in the room
    const existingUsers = Array.from(rooms.get(debateCallId))
      .filter(id => id !== socket.id);
    if (existingUsers.length > 0) {
      socket.emit("existing-users", existingUsers);
    }
    
    socket.emit("joined-debate", { debateCallId, memberCount });
  });

  // Handle WebRTC signaling
  socket.on("offer", ({ offer, to, debateCallId }) => {
    console.log(`📤 Offer from ${socket.id} to ${to} in ${debateCallId}`);
    socket.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to, debateCallId }) => {
    console.log(`📥 Answer from ${socket.id} to ${to} in ${debateCallId}`);
    socket.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, to, debateCallId }) => {
    socket.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    
    // Remove from all rooms
    rooms.forEach((members, debateCallId) => {
      if (members.has(socket.id)) {
        members.delete(socket.id);
        socket.to(debateCallId).emit("user-left", socket.id);
        
        // Clean up empty rooms
        if (members.size === 0) {
          rooms.delete(debateCallId);
        }
      }
    });
  });

  socket.on("leave-debate", (debateCallId) => {
    socket.leave(debateCallId);
    if (rooms.has(debateCallId)) {
      rooms.get(debateCallId).delete(socket.id);
      socket.to(debateCallId).emit("user-left", socket.id);
      
      if (rooms.get(debateCallId).size === 0) {
        rooms.delete(debateCallId);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Signaling server running on http://localhost:${PORT}`);
});

