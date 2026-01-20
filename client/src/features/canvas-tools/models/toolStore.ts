import { create } from "zustand";

export type Tool = "brush" | "eraser" | "text" | "default";

interface CanvasToolStore {
  tool: Tool;
  stroke: string;
  strokeWidth: number;
  actions : {
    setTool: (tool: Tool) => void;
    setStroke: (stroke: string) => void;
    setStrokeWidth: (width: number) => void;
  }
}

export const useToolStore = create<CanvasToolStore>((set) => ({
  tool: "brush",
  stroke: "#df4b26",
  strokeWidth: 5,
  actions : {
setTool: (tool) =>
    set(() => ({
      tool: tool,
    })),
  setStroke: (stroke) =>
    set(() => ({
      stroke: stroke,
    })),
  setStrokeWidth: (width) =>
    set(() => ({
      strokeWidth: width,
    })),
  }
  
}));
