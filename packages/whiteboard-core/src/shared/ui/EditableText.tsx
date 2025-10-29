import { Text } from "react-konva";
import { Html } from "react-konva-utils";

import { useRef, useState, useCallback, useImperativeHandle } from "react";

import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";

export interface EditableTextProps {
  id: string;
  x: number;
  y: number;
  value: string;
  width: number;
  ref?: React.Ref<Konva.Text>;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: KonvaEventObject<Event>) => void;
  onEditing: () => void;
}

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
        console.log(textNode.height(), "current");
        const textarea = node;

        const textPosition = textNode.position();
        const areaPosition = {
          x: textPosition.x,
          y: textPosition.y,
        };

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
        const timeoutId = setTimeout(() => {
          window.addEventListener("click", handleOutsideClick);
        });

        return () => {
          clearTimeout(timeoutId);
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
  id,
  x,
  y,
  value,
  width,

  onDragEnd,
  onTransformEnd,
  onEditing,
  ref,
}: EditableTextProps) => {
  const [text, setText] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<Konva.Text>(null); //textNode ref

  useImperativeHandle(ref, () => textRef.current as Konva.Text, []);

  const handleTextDblClick = useCallback(() => {
    onEditing();
    setIsEditing(true);
  }, []);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleTransform = useCallback(() => {
    const node = textRef.current;
    if (node) {
      const scaleX = node.scaleX();
      const newWidth = node.width() * scaleX;

      node.setAttrs({
        width: newWidth,
        scaleX: 1,
      });
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsEditing(false);
  }, []); // 메모이제이션 추가

  return (
    <>
      <Text
        id={id}
        ref={textRef}
        text={text}
        x={x}
        y={y}
        fontSize={20}
        width={width}
        draggable
        onDblClick={handleTextDblClick}
        onDblTap={handleTextDblClick}
        onTransform={handleTransform}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
        visible={!isEditing}
      />

      <>
        {isEditing &&
          textRef.current && ( // textRef.current가 있을 때만 렌더링
            <TextEditor
              textNode={textRef.current}
              onChange={handleTextChange}
              onClose={handleClose}
            />
          )}
      </>
    </>
  );
};
