import type { ShapeLine } from "../model/shapeType";
import { type RefObject } from "react";
import { useShapeStore } from "../model/shapeStore";
import type Konva from "konva";
import { Line } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";

export const LineShape = ({
  data,
  isDrawing,
  shapeRefs,
}: {
  data: ShapeLine;
  shapeRefs: RefObject<Map<string, Konva.Node>>;
  isDrawing: boolean;
}) => {
  const { setShape, shapes } = useShapeStore();

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const id = e.target.id();

    const selectedShape = shapes.find((shape) => shape.id === id);

    if (selectedShape) {
      setShape({
        ...selectedShape,
        x: e.target.x(),
        y: e.target.y(),
      });
    }
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    const id = e.target.id();
    const node = e.target;

    const selectedShape = shapes.find((shape) => shape.id === id);
    if (selectedShape && selectedShape.type === "line") {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      const scaledPoints = selectedShape.points.map((point, i) =>
        i % 2 === 0 ? point * scaleX : point * scaleY
      );
      setShape({
        ...selectedShape,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        points: scaledPoints,
        rotation: node.rotation(),
      });
    }
  };

  return (
    <>
      <Line
        id={data.id}
        name="line"
        ref={(node) => {
          if (node) {
            shapeRefs.current.set(data.id, node);
          }
        }}
        points={data.points.flatMap((point) => point)}
        stroke={data.stroke}
        strokeWidth={data.strokeWidth}
        tension={data.tension}
        lineCap="round"
        lineJoin="round"
        hitStrokeWidth={20}
        x={data.x || 0}
        y={data.y || 0}
        rotation={data.rotation || 0}
        draggable={!isDrawing}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
    </>
  );
};
