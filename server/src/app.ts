import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { getRoomData, updateRoomData } from "./store/data";

dotenv.config();

const app = express();

app.set("port", process.env.PORT || 3001);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const server = app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번에서 대기중");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });

  socket.on("error", (error) => {
    console.log("User error", error);
  });

  socket.on("reply", (data) => {
    console.log("User reply", data);
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    // Sync current state to the joining user
    const roomData = getRoomData(roomId);
    socket.emit("history-sync", roomData);
    socket.emit("joined-room", roomId);
  });

  socket.on("drawing", (data) => {
    const { roomId, shape } = data;
    socket.to(roomId).emit("drawing", shape);
  });

  socket.on("draw", (data) => {
    const { roomId, shape } = data;
    const room = getRoomData(roomId);
    
    // Truncate history if we are not at the end
    const newShapes = room.shapes.slice(0, room.historyIndex);
    newShapes.push(shape);
    
    updateRoomData(roomId, {
      shapes: newShapes,
      historyIndex: newShapes.length
    });

    // Broadcast the new shape and the new history index
    // Clients should update their list (effectively truncate + append) and index
    io.in(roomId).emit("history-change", { 
        shape, 
        historyIndex: newShapes.length 
    });
  });

  socket.on("undo", (roomId) => {
    const room = getRoomData(roomId);
    if (room.historyIndex > 0) {
      const newIndex = room.historyIndex - 1;
      updateRoomData(roomId, { historyIndex: newIndex });
      io.in(roomId).emit("history-index-change", newIndex);
    }
  });

  socket.on("redo", (roomId) => {
    const room = getRoomData(roomId);
    if (room.historyIndex < room.shapes.length) {
      const newIndex = room.historyIndex + 1;
      updateRoomData(roomId, { historyIndex: newIndex });
      io.in(roomId).emit("history-index-change", newIndex);
    }
  });

});