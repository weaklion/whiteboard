import { create } from "zustand";

interface Shape {
  id: string;
  points: number[];
}
//text, image를 위한 shape 컴포넌트 작성 및 수정 그에 맞는 타입 정의 필요
interface Store {
  shapes: Shape[];
  addShape: (item: Shape) => void;
}

export const useShapeStore = create<Store>((set) => ({
  shapes: [],

  addShape: (shape) =>
    set((state) => ({
      shapes: [...state.shapes, shape],
    })),
}));
