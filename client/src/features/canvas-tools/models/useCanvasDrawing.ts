import { useRef } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import { nanoid } from "nanoid";
import { useToolStore } from "./toolStore";
import { getLineBoundingBox } from "../canvas-tools.lib";
import { Socket } from "socket.io-client";
import { useDraftStore } from "@/entities/draft";
import { useSelectionStore } from "@/features/canvas-selection";

interface UseCanvasDrawingProps {
  socket?: Socket;
  historyIdx: number;
  setHistoryIdx: (idx: number) => void;
  setSelectedIds: (ids: string[]) => void;
  setTool: (tool: any) => void;
}

export const useCanvasDrawing = ({
  socket,
  setSelectedIds,
  setTool,
}: UseCanvasDrawingProps) => {
  const isDrawing = useRef(false);
  const currentLineId = useRef<string | undefined>(undefined);
  
  const { tool, stroke, strokeWidth } = useToolStore();
  const { actions : {updateDraft}, drafts } = useDraftStore();
  // removed addShape from imports as we rely on server sync
  // const { addShape } = useShapeStore(); 
  // removed setHistoryIdx since server updates it

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
      
      // Removed local addShape and setHistoryIdx
      // addShape(newShape);
      // setHistoryIdx(historyIdx + 1);
      
      socket?.emit("draw", { roomId: "1", shape: newShape });
      setSelectedIds([id]);
      setTool("default");
    }
  };

  const handleMouseMove = (e: KonvaEventObject<TouchEvent | MouseEvent>) => {
    if (tool === "default" || !isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (point && currentLineId.current) {

        const currentDraft = drafts.get(currentLineId.current!);
        if (currentDraft) {
            const points = currentDraft.points.concat([point.x, point.y]);
            updateDraft(currentLineId.current, { points, color: stroke });

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
        const currentDraft = drafts.get(currentLineId.current);
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
            
            // Removed local state updates
            // addShape(newShape);
            // setHistoryIdx(historyIdx + 1);  
        }
      }
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
