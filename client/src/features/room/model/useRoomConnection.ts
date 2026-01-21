import { useEffect } from "react";
import { io } from "socket.io-client";
import { useShapeStore } from "@/entities/shape";
import { useDraftStore } from "@/entities/draft";
import { useSelectionStore } from "@/features/canvas-selection";

const socket = io("http://localhost:3001");

export const useRoomConnection = (roomId: string) => {
  const { addShape, setShapes } = useShapeStore();
  const { updateDraft, removeDraft } = useDraftStore((state) => state.actions)
  const { actions : {setHistoryIdx}, historyIdx  } = useSelectionStore((state) => state);

  useEffect(() => {
    socket.emit("join-room", roomId);
  
    socket.on("history", (shapes) => {
      console.log("history", shapes);
      setShapes(shapes);
    });

    socket.on("draw", (shape) => {
      console.log("draw", shape);
      addShape(shape);
      setHistoryIdx(historyIdx + 1);
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
