import { useRef } from "react";
import { Stage, Layer, Transformer, Rect, Line } from "react-konva";
import Konva from "konva";
import { Eraser, Pencil, Pointer, Type } from "lucide-react";

import { useRoomConnection } from "@/features/room";
import { useCanvasDrawing, useToolStore } from "@/features/canvas-tools";
import { useDraftStore } from "@/entities/draft";
import { useCanvasSelection, useSelectionStore } from "@/features/canvas-selection";
import { useShapeStore, LineShape, TextShape } from "@/entities/shape";

export const Whiteboard = () => {
  const { socket } = useRoomConnection("1");
  const drafts = useDraftStore((state) => state.drafts);

  const { shapes } = useShapeStore();
  const { tool, actions : { setTool } } = useToolStore();
  const { 
    setSelectedIds, 
    historyIdx, 
    setHistoryIdx 
  } = useSelectionStore();
  
  const shapeRefs = useRef<Map<string, Konva.Node>>(new Map());

  const { 
    ...drawing
  } = useCanvasDrawing({
    socket,
    historyIdx,
    setHistoryIdx,
    setSelectedIds,
    setTool,
  });

  const selection = useCanvasSelection({
    tool,
    shapeRefs,
  });

  const visibleShape = shapes.slice(0, historyIdx);

  const handleStageClick = (e: any) => {
    selection.handleStageClick(e);
  };

  const handleMouseDown = (e: any) => {
    drawing.handleMouseDown(e);
    selection.handleMouseDown(e);
  };

  const handleMouseMove = (e: any) => {
    drawing.handleMouseMove(e);
    selection.handleMouseMove(e);
  };

  const handleMouseUp = () => {
    drawing.handleMouseUp();
    selection.handleMouseUp();
  };

  const handleUndo = () => {
    if (historyIdx === 0) return;
    setHistoryIdx(historyIdx - 1);
  };

  const handleRedo = () => {
    if (historyIdx === shapes.length) return;
    setHistoryIdx(historyIdx + 1);
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
                  isDrawing={drawing.isDrawingRef.current}
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

          {Array.from(drafts.entries()).map(([id, draft]) => (
            <Line
              key={id}
              points={draft.points}
              stroke={draft.color}
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}

          {tool === "default" && (
            <>
              <Transformer
                ref={selection.transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />

              {selection.selectionRectangle.visible && (
                <Rect
                  x={Math.min(selection.selectionRectangle.x1, selection.selectionRectangle.x2)}
                  y={Math.min(selection.selectionRectangle.y1, selection.selectionRectangle.y2)}
                  width={Math.abs(
                    selection.selectionRectangle.x2 - selection.selectionRectangle.x1
                  )}
                  height={Math.abs(
                    selection.selectionRectangle.y2 - selection.selectionRectangle.y1
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
