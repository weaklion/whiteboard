import type { ShapeText } from "../model/shapeType";
import { EditableText } from "@/shared/ui/EditableText";
import type { RefObject } from "react";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";

export const TextShape = ({
  data,
  shapeRefs,
}: {
  data: ShapeText;
  shapeRefs: RefObject<Map<string, Konva.Node>>;
}) => {
  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    console.log(e);
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    console.log(e);
  };

  return (
    <>
      <EditableText
        id={data.id}
        ref={(node) => {
          if (node) {
            shapeRefs.current.set(data.id, node);
          }
        }}
        x={data.x | 0}
        y={data.y | 0}
        value={data.value}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
    </>
  );
};

export default TextShape;
