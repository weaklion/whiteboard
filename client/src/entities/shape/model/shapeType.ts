import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { RefObject } from "react";
import type { ShapeText, ShapeLine } from "@root/types/shape";

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
