import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Transformer, Rect } from "react-konva";

import type { KonvaEventObject } from "konva/lib/Node";
import { EditableText } from "@shared/ui/EditableText";
import Konva from "konva";

const degToRad = (angle: number) => (angle / 180) * Math.PI;

const getCorner = (
  pivotX: number,
  pivotY: number,
  diffX: number,
  diffY: number,
  angle: number
) => {
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);
  angle += Math.atan2(diffY, diffX);
  const x = pivotX + distance * Math.cos(angle);
  const y = pivotY + distance * Math.sin(angle);
  return { x, y };
};

const getClientRect = (element) => {
  const { x, y, width, height, rotation = 0 } = element;
  const rad = degToRad(rotation);

  const p1 = getCorner(x, y, 0, 0, rad);
  const p2 = getCorner(x, y, width, 0, rad);
  const p3 = getCorner(x, y, width, height, rad);
  const p4 = getCorner(x, y, 0, height, rad);

  const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const Canvas = () => {
  const [tool, setTool] = useState("brush");
  const [lines, setLines] = useState<{ tool: string; points: number[] }[]>([]);
  const [texts, setTexts] = useState<
    { id: string; points: number[]; select: boolean }[]
  >([]);
  const [rectangles, setRectangles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionRectangle, setSelectionRectangle] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });
  const isSelecting = useRef(false);
  const transformerRef = useRef(null);
  const rectRefs = useRef(new Map());

  const isDrawing = useRef(false);

  useEffect(() => {
    console.log(selectedIds, "select");
    if (selectedIds.length && transformerRef.current) {
      const nodes = selectedIds
        .map((id) => rectRefs.current.get(id))
        .filter((node) => node);

      transformerRef.current.nodes(nodes);
    } else if (transformerRef.current) {
      //clear selection
      transformerRef.current.nodes([]);
    }
  }, [selectedIds]);

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // If we are selecting with rect, do nothing
    if (selectionRectangle.visible) {
      return;
    }

    // If click on empty area - remove all selectisons
    if (e.target === e.target.getStage()) {
      setSelectedIds([]);
      return;
    }
    // Do nothing if clicked NOT on our rectangles
    if (!e.target.hasName("rect")) {
      return;
    }

    const clickedId = e.target.id();
    // Do we pressed shift or ctrl?

    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = selectedIds.includes(clickedId);

    if (!metaPressed && !isSelected) {
      // If no key pressed and the node is not selected
      // select just one
      setSelectedIds([clickedId]);
    } else if (metaPressed && isSelected) {
      // If we pressed keys and node was selected
      // we need to remove it from selection
      setSelectedIds(selectedIds.filter((id) => id !== clickedId));
    } else if (metaPressed && !isSelected) {
      // Add the node into selection
      setSelectedIds([...selectedIds, clickedId]);
    }
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === "default") {
      if (e.target !== e.target.getStage()) {
        return;
      }

      isSelecting.current = true;
      const pos = e.target.getStage().getPointerPosition();
      if (pos) {
        setSelectionRectangle({
          visible: true,
          x1: pos.x,
          y1: pos.y,
          x2: pos.x,
          y2: pos.y,
        });
      }
    } else {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        if (tool === "brush" || tool === "eraser") {
          isDrawing.current = true;
          setLines([...lines, { tool, points: [pos.x, pos.y] }]);
        } else if (tool === "text") {
          const newId = `text_${texts.length}`;
          setTexts([
            ...texts,
            { id: newId, points: [pos.x, pos.y], select: false },
          ]);
          setTool("default");
        }
      }
    }
  };

  const handleMouseMove = (e: KonvaEventObject<TouchEvent | MouseEvent>) => {
    if (tool === "default") {
      if (!isSelecting.current) {
        return;
      }

      const pos = e.target?.getStage()?.getPointerPosition();
      if (pos) {
        setSelectionRectangle({
          ...selectionRectangle,
          x2: pos.x,
          y2: pos.y,
        });
      }
    } else {
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
      console.log(lines, "lines");
    }
  };

  const handleMouseUp = (e) => {
    if (tool === "default") {
      if (!isSelecting.current) {
        return;
      }
      isSelecting.current = false;
      // Update visibility in timeout, so we can check it in click event

      setTimeout(() => {
        setSelectionRectangle({
          ...selectionRectangle,
          visible: false,
        });
      });

      const selBox = {
        x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
        y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
        width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
        height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
      };

      const selected = rectangles.filter((rect) => {
        // Check if rectangle intersects with selection box
        return Konva.Util.haveIntersection(selBox, getClientRect(rect));
      });

      console.log(selected, "selected");

      setSelectedIds(selected.map((rect) => rect.id));
    } else {
      console.log(e, "e");
      isDrawing.current = false;
    }
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    console.log(id, "id");
    setRectangles((prevRects) => {
      const newRects = [...prevRects];
      const index = newRects.findIndex((r) => r.id === id);
      if (index !== -1) {
        newRects[index] = {
          ...newRects[index],
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return newRects;
    });
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    const id = e.target.id();
    const node = e.target;
    console.log(e.target, "etaer");
    setRectangles((prevRects) => {
      const newRects = [...prevRects];

      // Update each transformed node
      const index = newRects.findIndex((r) => r.id === id);

      if (index !== -1) {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        // Reset scale
        node.scaleX(1);
        node.scaleY(1);

        newRects[index] = {
          ...newRects[index],
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(node.height() * scaleY),
          rotation: node.rotation(),
        };
      }

      return newRects;
    });
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
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onClick={handleStageClick}
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
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
            />
          ))}
          {texts.map((text, i) => (
            <EditableText
              key={i}
              id={text.id}
              points={text.points}
              select={text.select}
              onDragEnd={handleDragEnd}
              ref={(node) => {
                if (node) {
                  rectRefs.current.set(text.id, node);
                }
              }}
              onTransformEnd={handleTransformEnd}
            />
          ))}

          {tool === "default" && (
            <>
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit resize
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />

              {selectionRectangle.visible && (
                <Rect
                  x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
                  y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
                  width={Math.abs(
                    selectionRectangle.x2 - selectionRectangle.x1
                  )}
                  height={Math.abs(
                    selectionRectangle.y2 - selectionRectangle.y1
                  )}
                  fill="rgba(0,0,255,0.5)"
                />
              )}
            </>
          )}
        </Layer>
      </Stage>
    </>
  );
};
