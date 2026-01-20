import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";

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
  })

  socket.on("reply", (data) => {
    console.log("User reply", data);
  })   


  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.emit("joined-room", roomId);
  });
  socket.on("drawing", (data) => {
    const { roomId, shape } = data;
    socket.to(roomId).emit("drawing", shape);
  });
  socket.on("draw", (data) => {
    const { roomId, shape } = data;
    socket.to(roomId).emit("draw", shape);
  });

});