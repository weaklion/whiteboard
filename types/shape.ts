


export interface ShapeType {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface ShapeLine extends ShapeType {
  type: "line";
  points: number[];
  stroke: string;
  strokeWidth: number;
  tension: number;
  isEraser: boolean;
}
export interface ShapeText extends ShapeType {
  type: "text";
  value: string;
  fontSize?: number;
  fill?: string;
  fontFamily?: string;
  fontStyle?: string;
  lineHeight?: number;
  link?: string;
}

export type Shape = ShapeText | ShapeLine;