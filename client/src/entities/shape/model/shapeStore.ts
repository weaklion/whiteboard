import { create } from "zustand";
import type { Shape } from "./shapeType";

interface Store {
  shapes: Shape[];
  selectedShape: Shape;
  addShape: (item: Shape) => void;
  removeShape: (id: string) => void;
  setShape: (item: Shape) => void;
  setSelectedShape: (item: Shape) => void;
  setShapes: (shapes: Shape[]) => void;
  syncNewShape: (shape: Shape, historyIdx: number) => void;
}

const initialShape: Shape = {
  height: 0,
  id: "0",
  type: "text",
  rotation: 0,
  value: "",
  width: 0,
  x: 0,
  y: 0,
};

export const useShapeStore = create<Store>((set) => ({
  shapes: [],
  selectedShape: initialShape,

  addShape: (shape) =>
    set((state) => {
      if (state.shapes.some((s) => s.id === shape.id)) {
        return state;
      }
      return {
        shapes: [...state.shapes, shape],
      };
    }),
  removeShape: (id) =>
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
    })),

  setShape: (shape) =>
    set((state) => ({
      shapes: state.shapes.map((sshape) => {
        if (sshape.id === shape.id) {
          return shape;
        }
        return sshape;
      }),
    })),
  setSelectedShape: (shape) =>
    set(() => ({
      selectedShape: shape,
    })),
  setShapes: (shapes) =>
    set(() => ({
      shapes: shapes,
    })),
  syncNewShape: (shape, historyIdx) =>
    set((state) => {
      // Truncate at historyIdx - 1 (because historyIdx includes the new shape)
      // If historyIdx is 1, we want index 0 (slice 0,0 is empty? No slice(0,0) is empty).
      // If historyIdx is 1, it means 1 item total. shape is at index 0.
      // So we slice(0, 0).
      // If historyIdx is 6 (items 0..5), we slice(0, 5).
      const newShapes = state.shapes.slice(0, historyIdx - 1);
      return {
        shapes: [...newShapes, shape],
      };
    }),
}));
