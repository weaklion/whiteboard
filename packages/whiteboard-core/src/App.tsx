import { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";

import type { KonvaEventObject } from "konva/lib/Node";
import { EditableText } from "./entities/text/ui/EditableText";

function App() {
  const [tool, setTool] = useState("brush");
  const [lines, setLines] = useState<{ tool: string; points: number[] }[]>([]);
  const [texts, setTexts] = useState<{ points: number[]; select: boolean }[]>(
    []
  );
  const isDrawing = useRef(false);
  /**
   *
   * tool === default 일시 stage에서 group select를 할 수 있어야 한다
   * 선택한 게 Text고, 하나 만 선택했을 시 수정 가능하도록 해야함.
   * https://konvajs.org/docs/select_and_transform/Basic_demo.html 참조
   */

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const target = e.target;
    const pos = target.getStage()?.getPointerPosition();

    if (pos) {
      if (tool === "brush" || tool === "eraser") {
        isDrawing.current = true;
        setLines([...lines, { tool, points: [pos.x, pos.y] }]);
      } else if (tool === "text") {
        setTexts([...texts, { points: [pos.x, pos.y], select: false }]);
        setTool("default");
      } else if (tool === "default") {
        console.log("");
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
            <EditableText
              key={i}
              id={i}
              points={text.points}
              select={text.select}
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
}

export default App;
