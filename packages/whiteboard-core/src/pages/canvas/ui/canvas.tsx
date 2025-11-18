import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Transformer, Rect, Line } from "react-konva";
import { nanoid } from "nanoid";
import type { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import { getClientRect, getLineBoundingBox } from "@features/canvas-tools";
import { useShapeStore } from "@/entities/shape";
import { LineShape, TextShape } from "@/entities/shape";
import { useToolStore } from "@/features/canvas-tools";
import { useSelectionStore } from "@/features/canvas-selection";
import { Eraser, Pencil, Pointer, Type } from "lucide-react";

export const Canvas = () => {
  const [line, setLine] = useState<{ points: number[] }>();

  const { addShape, shapes } = useShapeStore();
  const { setTool, stroke, tool, strokeWidth } = useToolStore();
  const {
    selectedIds,
    historyIdx,
    setSelectedIds,
    selectionRectangle,
    setSelectionRectangle,
    setHistoryIdx,
  } = useSelectionStore();

  const isSelecting = useRef(false);
  const transformerRef = useRef<Konva.Transformer>(null);
  const shapeRefs = useRef<Map<string, Konva.Node>>(new Map());
  const isDrawing = useRef(false);
  const visibleShape = shapes.slice(0, historyIdx);

  useEffect(() => {
    if (selectedIds.length && transformerRef.current) {
      const nodes = selectedIds
        .map((id) => shapeRefs.current.get(id))
        .filter((node) => node !== undefined);

      transformerRef.current.nodes(nodes);
    } else if (transformerRef.current) {
      //clear selection
      transformerRef.current.nodes([]);
    }
  }, [selectedIds]);

  const handleUndo = () => {
    if (historyIdx === 0) return;
    setHistoryIdx(historyIdx - 1);
  };

  const handleRedo = () => {
    if (historyIdx === shapes.length) return;
    setHistoryIdx(historyIdx + 1);
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (selectionRectangle.visible) {
      return;
    }

    if (e.target === e.target.getStage()) {
      setSelectedIds([]);
      return;
    }

    if (!e.target.hasName("rect")) {
      return;
    }

    const clickedId = e.target.id();

    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = selectedIds.includes(clickedId);

    if (!metaPressed && !isSelected) {
      setSelectedIds([clickedId]);
    } else if (metaPressed && isSelected) {
      setSelectedIds(selectedIds.filter((id) => id !== clickedId));
    } else if (metaPressed && !isSelected) {
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

          setLine({ points: [pos.x, pos.y] });
        } else if (tool === "text") {
          const id = nanoid(3);
          addShape({
            id: id,
            type: "text",
            height: 48,
            width: 200,
            x: pos.x,
            y: pos.y,
            value: "text를 입력 해주세요",
            rotation: 0,
          });
          setSelectedIds([id]);
          setHistoryIdx(historyIdx + 1);

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
      if (point && line) {
        const points = line.points.concat([point.x, point.y]);
        setLine({
          points: points,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (tool === "default") {
      if (!isSelecting.current) {
        return;
      }
      isSelecting.current = false;

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

      const selected = shapes.filter((shape) => {
        return Konva.Util.haveIntersection(selBox, getClientRect(shape));
      });

      setSelectedIds(selected.map((rect) => rect.id));
    } else {
      if (isDrawing.current) {
        if (tool === "brush") {
          // padding 추가 (선택하기 쉽게)
          const padding = 10;
          if (line) {
            const bbox = getLineBoundingBox(line.points);
            addShape({
              type: "line",
              id: nanoid(3),
              height: bbox.height + padding * 2,
              width: bbox.width + padding * 2,
              points: bbox.points,
              stroke: stroke,
              strokeWidth: strokeWidth,
              x: bbox.x,
              y: bbox.y,
              tension: 0.5,
              rotation: 0,
            });
          }
          setHistoryIdx(historyIdx + 1);
        } else if (tool === "eraser") {
          console.log(line?.points, "line");
        }
      }

      setLine(undefined);
      isDrawing.current = false;
    }
  };

  return (
    <>
      <div className="flex gap-x-2 m-4">
        <button className="btn" onClick={() => setTool("brush")}>
          <Pencil />
        </button>
        <button className="btn" onClick={() => setTool("eraser")}>
          <Eraser />
        </button>
        <button className="btn" onClick={() => setTool("text")}>
          <Type />
        </button>
        <button className="btn" onClick={() => setTool("default")}>
          <Pointer />
        </button>
        <button className="btn" onClick={handleUndo}>
          undo
        </button>
        <button className="btn" onClick={handleRedo}>
          redo
        </button>
      </div>
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
          {visibleShape?.map(
            (shape) =>
              (shape.type === "line" && (
                <LineShape
                  data={shape}
                  key={shape.id}
                  isDrawing={isDrawing.current}
                  shapeRefs={shapeRefs}
                />
              )) ||
              (shape.type === "text" && (
                <TextShape
                  data={shape}
                  key={shape.id}
                  shapeRefs={shapeRefs}
                  onEditing={() => setSelectedIds([])}
                />
              ))
          )}
          {isDrawing && (
            <Line
              points={line?.points}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              hitStrokeWidth={50}
              globalCompositeOperation={
                tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          )}

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
