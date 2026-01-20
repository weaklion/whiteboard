import { useEffect } from "react";
import { io } from "socket.io-client";
import { useShapeStore } from "@/entities/shape";
import { useDraftStore } from "@/entities/draft";

const socket = io("http://localhost:3001");

export const useRoomConnection = (roomId: string) => {
  const { addShape } = useShapeStore();
  const { updateDraft, removeDraft } = useDraftStore((state) => state.actions)

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("draw", (shape) => {
      addShape(shape);
    });

    socket.on("drawing-start", (shape) => {
      if (shape.id) {
        updateDraft(shape.id, { points: shape.points, color: shape.stroke });
      }
    });

    socket.on("drawing", (shape) => {
      if (shape.id) {
        updateDraft(shape.id, { points: shape.points, color: shape.stroke });
      }
    });

    socket.on("drawing-end", (shape) => {
       if (shape.id) {
         removeDraft(shape.id);
       }
    });

    return () => {
      socket.off("draw");
      socket.off("drawing");
      socket.off("drawing-start");
      socket.off("drawing-end");
    };
  }, [addShape, roomId, updateDraft, removeDraft]);

  return { socket };
};
