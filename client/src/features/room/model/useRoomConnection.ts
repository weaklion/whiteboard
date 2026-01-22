import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useShapeStore } from "@/entities/shape";
import { useDraftStore } from "@/entities/draft";
import { useSelectionStore } from "@/features/canvas-selection";

// Initialize socket outside to prevent reconnection on every render if possible, 
// but inside hook with ref is safer for roomId changes. 
// Given previous code had it outside (Step 56), but inside useEffect it was re-emitting join-room.
// I'll keep the socket instance stable.
const socket = io("http://localhost:3001");

export const useRoomConnection = (roomId: string) => {
  const { setShapes, syncNewShape } = useShapeStore(); 
  const { updateDraft, removeDraft } = useDraftStore((state) => state.actions);
  const { actions: { setHistoryIdx } } = useSelectionStore((state) => state);

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("joined-room", (room) => {
      console.log(`Joined room: ${room}`);
    });

    // History & Sync Logic
    socket.on("history-sync", (data: { shapes: any[], historyIndex: number }) => {
      console.log("history-sync", data);
      setShapes(data.shapes);
      setHistoryIdx(data.historyIndex);
    });

    socket.on("history-change", (data: { shape: any, historyIndex: number }) => {
       console.log("history-change", data);
       syncNewShape(data.shape, data.historyIndex);
       setHistoryIdx(data.historyIndex);
    });

    socket.on("history-index-change", (newIndex: number) => {
      console.log("history-index-change", newIndex);
      setHistoryIdx(newIndex);
    });

    // Real-time drafting (other users drawing)
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
      socket.off("joined-room");
      socket.off("history-sync");
      socket.off("history-change");
      socket.off("history-index-change");
      socket.off("drawing-start");
      socket.off("drawing");
      socket.off("drawing-end");
    };
  }, [roomId, setShapes, syncNewShape, setHistoryIdx, updateDraft, removeDraft]);

  return { socket };
};
