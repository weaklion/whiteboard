import { useRef, useState } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import { nanoid } from "nanoid";
import { useToolStore } from "./toolStore";
import { useShapeStore } from "@/entities/shape";
import { getLineBoundingBox } from "../canvas-tools.lib";
import { Socket } from "socket.io-client";

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
  const [line, setLine] = useState<{ points: number[] }>();
  const isDrawing = useRef(false);
  
  const { tool, stroke, strokeWidth } = useToolStore();
  const { addShape } = useShapeStore();

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === "default") return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (tool === "brush" || tool === "eraser") {
      isDrawing.current = true;
      // socket?.emit("drawing-start", { roomId : "1", shape: { points: [pos.x, pos.y] } })
      setLine({ points: [pos.x, pos.y] });
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
      socket?.emit("drawing-end", { roomId : "1", shape: newShape})
      // addShape(newShape);
      setSelectedIds([id]);
      setHistoryIdx(historyIdx + 1);

      setTool("default");
    }
  };

  const handleMouseMove = (e: KonvaEventObject<TouchEvent | MouseEvent>) => {
    if (tool === "default" || !isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (point && line) {
      const points = line.points.concat([point.x, point.y]);
      setLine({
        points: points,
      });
      // socket?.emit("drawing", { roomId : "1", shape: { points: points } })
    }
  };

  const handleMouseUp = () => {
    if (tool !== "default" && isDrawing.current) {
      const padding = 10;
      if (line) {
        const bbox = getLineBoundingBox(line.points);
        const newShape = {
          type: "line" as const,
          id: nanoid(3),
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
        addShape(newShape);
        // socket?.emit("darwing-end", { roomId: "1", shape: newShape });
      }
      setHistoryIdx(historyIdx + 1);
    }

    setLine(undefined);
    isDrawing.current = false;
  };

  return {
    line,
    isDrawingRef: isDrawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
