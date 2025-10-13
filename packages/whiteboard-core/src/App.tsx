import { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";

import type { KonvaEventObject } from "konva/lib/Node";
import { EditableText } from "./entities/text/ui/EditableText";

function App() {
  const [tool, setTool] = useState("brush");
  const [lines, setLines] = useState<{ tool: string; points: number[] }[]>([]);
  const [texts, setTexts] = useState<{ points: number[] }[]>([]);
  const isDrawing = useRef(false);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      if (tool === "brush" || tool === "eraser") {
        isDrawing.current = true;
        setLines([...lines, { tool, points: [pos.x, pos.y] }]);
      } else if (tool === "text") {
        setTexts([...texts, { points: [pos.x, pos.y] }]);
        setTool("default");
      }
    }
  };

  const handleMouseMove = (e: KonvaEventObject<TouchEvent | MouseEvent>) => {
    if (!isDrawing.current) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();

    const lastLine = lines[lines.length - 1];
    if (point) {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
    }

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <>
      <select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value="brush">Brush</option>
        <option value="eraser">Eraser</option>
        <option value="text">Text</option>
        <option value="default">Default</option>
      </select>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 25}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
          {texts.map((text, i) => (
            <EditableText key={i} points={text.points} />
          ))}
        </Layer>
      </Stage>
    </>
  );
}

export default App;
