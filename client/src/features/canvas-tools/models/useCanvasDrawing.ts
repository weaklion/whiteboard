import { useRef } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import { nanoid } from "nanoid";
import { useToolStore } from "./toolStore";
import { useShapeStore } from "@/entities/shape";
import { getLineBoundingBox } from "../canvas-tools.lib";
import { Socket } from "socket.io-client";
import { useDraftStore } from "@/entities/draft";

interface UseCanvasDrawingProps {
  socket?: Socket;
  historyIdx: number;
  setHistoryIdx: (idx: number) => void;
  setSelectedIds: (ids: string[]) => void;
  setTool: (tool: any) => void;
}

export const useCanvasDrawing = ({
  socket,
  historyIdx,
  setHistoryIdx,
  setSelectedIds,
  setTool,
}: UseCanvasDrawingProps) => {
  const isDrawing = useRef(false);
  const currentLineId = useRef<string | undefined>(undefined);
  
  const { tool, stroke, strokeWidth } = useToolStore();
  const { addShape } = useShapeStore();
  const { updateDraft, removeDraft } = useDraftStore((state) => state.actions);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === "default") return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (tool === "brush" || tool === "eraser") {
      isDrawing.current = true;
      const id = nanoid(3);
      currentLineId.current = id;
      
      const newDraft = { points: [pos.x, pos.y], color: stroke };
      updateDraft(id, newDraft);

      socket?.emit("drawing-start", { 
        roomId: "1", 
        shape: { 
          id, 
          points: [pos.x, pos.y], 
          stroke, 
          strokeWidth 
        } 
      });

    } else if (tool === "text") {
      const id = nanoid(3);
      const newShape = {
        id: id,
        type: "text" as const,
        height: 48,
        width: 200,
        x: pos.x,
        y: pos.y,
        value: "text를 입력 해주세요",
        rotation: 0,
      };
      
      // Text creates immediately
      addShape(newShape);
      socket?.emit("draw", { roomId: "1", shape: newShape });
      setSelectedIds([id]);
      setHistoryIdx(historyIdx + 1);

      setTool("default");
    }
  };

  const handleMouseMove = (e: KonvaEventObject<TouchEvent | MouseEvent>) => {
    if (tool === "default" || !isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (point && currentLineId.current) {
        // We need to know previous points to concat.
        const currentDraft = useDraftStore.getState().drafts.get(currentLineId.current!);
        if (currentDraft) {
            const points = currentDraft.points.concat([point.x, point.y]);
            updateDraft(currentLineId.current!, { points, color: stroke });

            socket?.emit("drawing", { 
                roomId: "1", 
                shape: { 
                id: currentLineId.current, 
                points, 
                stroke, 
                strokeWidth 
                } 
            });
        }
    }
  };

  const handleMouseUp = () => {
    if (tool !== "default" && isDrawing.current) {
      const padding = 10;
      if (currentLineId.current) {
        const currentDraft = useDraftStore.getState().drafts.get(currentLineId.current);
        if (currentDraft) {
            const bbox = getLineBoundingBox(currentDraft.points);
            const newShape = {
            type: "line" as const,
            id: currentLineId.current,
            height: bbox.height + padding * 2,
            width: bbox.width + padding * 2,
            points: bbox.points,
            stroke: stroke,
            strokeWidth: strokeWidth,
            x: bbox.x,
            y: bbox.y,
            tension: 0.5,
            rotation: 0,
            isEraser: tool === "eraser",
            };
            
            socket?.emit("drawing-end", { roomId: "1", shape: { id: currentLineId.current } });
            socket?.emit("draw", { roomId: "1", shape: newShape });
            addShape(newShape);
        }
        removeDraft(currentLineId.current);
      }
      setHistoryIdx(historyIdx + 1);
    }

    currentLineId.current = undefined;
    isDrawing.current = false;
  };

  return {
    isDrawingRef: isDrawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
