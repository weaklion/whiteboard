import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { RefObject } from "react";

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

export interface ShapeProps<T extends Shape = Shape> {
  data: T;
  shapeRef?: RefObject<Konva.Shape | Konva.Text | null>;
  onSelect: () => void;
  onMouseEnter: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: (e: KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: KonvaEventObject<Event>) => void;
}
