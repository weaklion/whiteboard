import { Text, Transformer } from "react-konva";
import { Html } from "react-konva-utils";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
} from "react";

import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";

const TextEditor = ({
  textNode,
  onClose,
  onChange,
}: {
  textNode: Konva.Text;
  onClose: () => void;
  onChange: (text: string) => void;
}) => {
  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      if (node) {
        const textarea = node;

        const textPosition = textNode.position();
        const areaPosition = {
          x: textPosition.x,
          y: textPosition.y,
        };

        // Match styles with the text node
        textarea.value = textNode.text();
        textarea.style.position = "absolute";
        textarea.style.top = `${areaPosition.y}px`;
        textarea.style.left = `${areaPosition.x}px`;
        textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
        textarea.style.height = `${textNode.height() - textNode.padding() * 2 + 5}px`;
        textarea.style.fontSize = `${textNode.fontSize()}px`;
        textarea.style.border = "none";
        textarea.style.padding = "0px";
        textarea.style.margin = "0px";
        textarea.style.overflow = "hidden";
        textarea.style.background = "none";
        textarea.style.outline = "none";
        textarea.style.resize = "none";
        textarea.style.fontFamily = textNode.fontFamily();
        textarea.style.transformOrigin = "left top";
        textarea.style.textAlign = textNode.align();
        textarea.style.color = "black";

        const rotation = textNode.rotation();
        let transform = "";
        if (rotation) {
          transform += `rotateZ(${rotation}deg)`;
        }
        textarea.style.transform = transform;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight + 3}px`;

        textarea.focus();

        const handleOutsideClick = (e: PointerEvent) => {
          if (e.target !== textarea) {
            onChange(textarea.value);
            onClose();
          }
        };

        // Add event listeners
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onChange(textarea.value);
            onClose();
          }
          if (e.key === "Escape") {
            onClose();
          }
        };

        const handleInput = () => {
          const scale = textNode.getAbsoluteScale().x;
          textarea.style.width = `${textNode.width() * scale}px`;
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight + textNode.fontSize()}px`;
        };

        textarea.addEventListener("keydown", handleKeyDown);
        textarea.addEventListener("input", handleInput);
        setTimeout(() => {
          window.addEventListener("click", handleOutsideClick);
        });

        return () => {
          textarea.removeEventListener("keydown", handleKeyDown);
          textarea.removeEventListener("input", handleInput);
          window.removeEventListener("click", handleOutsideClick);
        };
      }
    },
    [textNode, onChange, onClose]
  );

  return (
    <Html>
      <textarea
        ref={setTextareaRef}
        style={{
          minHeight: "1em",
          position: "absolute",
        }}
      />
    </Html>
  );
};

export const EditableText = ({
  points,
  select,
  id,
  onDragEnd,
  onTransformEnd,
  ref,
}: {
  points: number[];
  select: boolean;
  id: string;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: KonvaEventObject<Event>) => void;
  ref?: React.Ref<Konva.Text>;
}) => {
  const [text, setText] = useState("대충 이런 글씨");
  const [isEditing, setIsEditing] = useState(false);
  const [textWidth, setTextWidth] = useState(200);
  const textRef = useRef<Konva.Text>(null); //textNode ref
  const trRef = useRef<Konva.Transformer>(null); // transformer  ref

  useImperativeHandle(ref, () => textRef.current as Konva.Text);

  useEffect(() => {
    if (trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
    }
  }, [isEditing]);

  const handleTextDblClick = useCallback(() => {
    if (select) {
      setIsEditing(true);
    }
  }, []);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleTransform = useCallback(() => {
    if (select) {
      const node = textRef.current;
      if (node) {
        const scaleX = node.scaleX();
        const newWidth = node.width() * scaleX;
        setTextWidth(newWidth);
        node.setAttrs({
          width: newWidth,
          scaleX: 1,
        });
      }
    }
  }, []);

  return (
    <>
      <Text
        id={id}
        ref={textRef}
        text={text}
        x={points[0]}
        y={points[1]}
        fontSize={20}
        draggable
        width={textWidth}
        onDblClick={handleTextDblClick}
        onDblTap={handleTextDblClick}
        onTransform={handleTransform}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
        visible={!isEditing}
      />
      {select ?? (
        <>
          {isEditing &&
            textRef.current && ( // textRef.current가 있을 때만 렌더링
              <TextEditor
                textNode={textRef.current}
                onChange={handleTextChange}
                onClose={() => setIsEditing(false)}
              />
            )}
          {!isEditing && (
            <Transformer
              ref={trRef}
              enabledAnchors={["middle-left", "middle-right"]}
              boundBoxFunc={(_, newBox) => ({
                ...newBox,
                width: Math.max(30, newBox.width),
              })}
            />
          )}
        </>
      )}
    </>
  );
};
