import { create } from "zustand";
import type { Shape } from "./shapeType";

interface Store {
  shapes: Shape[];
  selectedShape: Shape;
  addShape: (item: Shape) => void;
  setShape: (item: Shape) => void;
  setSelectedShape: (item: Shape) => void;
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
    set((state) => ({
      shapes: [...state.shapes, shape],
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
}));
