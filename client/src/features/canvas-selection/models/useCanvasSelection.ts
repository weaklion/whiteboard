import { useEffect, useRef } from "react";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useSelectionStore } from "./selectionStore";
import { useShapeStore } from "@/entities/shape";
import { getClientRect } from "@/features/canvas-tools";

interface UseCanvasSelectionProps {
  tool: string;
  shapeRefs: React.RefObject<Map<string, Konva.Node>>;
}

export const useCanvasSelection = ({
  tool,
  shapeRefs,
}: UseCanvasSelectionProps) => {
  const {
    selectedIds,
    selectionRectangle,
    actions : {
    setSelectedIds,
    setSelectionRectangle,

    }
  } = useSelectionStore();
  
  const { shapes } = useShapeStore();

  const isSelecting = useRef(false);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (selectedIds.length && transformerRef.current) {
      const nodes = selectedIds
        .map((id) => shapeRefs.current.get(id))
        .filter((node) => node !== undefined) as Konva.Node[];

      transformerRef.current.nodes(nodes);
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedIds, shapeRefs]);

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
    if (tool !== "default") return;
    
    if (e.target !== e.target.getStage()) {
      return;
    }

    isSelecting.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setSelectionRectangle({
        visible: true,
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
      });
    }
  };

  const handleMouseMove = (e: KonvaEventObject<TouchEvent | MouseEvent>) => {
    if (tool !== "default") return;
    
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
  };

  const handleMouseUp = () => {
    if (tool !== "default") return;
    
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
  };

  return {
    selectedIds,
    selectionRectangle,
    transformerRef,
    handleStageClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
