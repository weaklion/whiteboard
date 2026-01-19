import { useEffect } from "react";
import { io } from "socket.io-client";
import { useShapeStore } from "@/entities/shape";

const socket = io("http://localhost:3001");

export const useRoomConnection = (roomId: string) => {
  const { addShape } = useShapeStore();

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("draw", (shape) => {
      addShape(shape);
    });

    return () => {
      socket.off("draw");
    };
  }, [addShape, roomId]);

  return { socket };
};
