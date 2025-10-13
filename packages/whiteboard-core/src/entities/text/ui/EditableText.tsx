import { Text, Transformer } from "react-konva";
import { Html } from "react-konva-utils";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
  type CompositionEvent,
  useMemo,
} from "react";

import type Konva from "konva";

// const TextEditor = ({
//   x,
//   y,
//   value,
//   width,
//   onClose,
//   onChange,
// }: {
//   x: number;
//   y: number;
//   value: string;
//   width: number;
//   onClose: () => void;
//   onChange: (text: string) => void;
// }) => {
//   const [text, setText] = useState(value);

//   const { isComposing, keyComposingEvents } = useKeyComposing();

//   const style = useMemo(() => {
//     const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
//     const baseStyle = {
//       width: `${width}px`,
//       border: "none",
//       padding: "0px",
//       margin: "0px",
//       background: "none",
//       outline: "none",
//       resize: "none" as const,
//       color: "black", // colour -> color
//       fontSize: "24px",
//       fontFamily: "sans-serif",
//     };

//     if (isFirefox) {
//       return baseStyle;
//     }

//     return {
//       ...baseStyle,
//       marginTop: "-4px", // margintop -> marginTop
//     };
//   }, [width]);

//   const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
//     if (!isComposing) {
//       setText(e.currentTarget.value);
//     }
//   };

//   const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       onChange(text);
//       onClose();
//     }
//     if (e.key === "Escape") {
//       onChange(text);
//       onClose();
//     }
//   };

//   return (
//     <Html groupProps={{ x, y }} divProps={{ style: { opacity: 1 } }}>
//       <textarea
//         value={text}
//         onChange={handleTextChange}
//         onKeyDown={handleKeyDown}
//         style={style}
//         autoFocus
//         {...keyComposingEvents}
//       />
//     </Html>
//   );
// };

const TextEditor = ({ textNode, onClose, onChange }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const stage = textNode.getStage();
    const textPosition = textNode.position();
    const stageBox = stage.container().getBoundingClientRect();
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
    textarea.style.lineHeight = textNode.lineHeight();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = "left top";
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();

    const rotation = textNode.rotation();
    let transform = "";
    if (rotation) {
      transform += `rotateZ(${rotation}deg)`;
    }
    textarea.style.transform = transform;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + 3}px`;

    textarea.focus();

    const handleOutsideClick = (e) => {
      if (e.target !== textarea) {
        onChange(textarea.value);
        onClose();
      }
    };

    // Add event listeners
    const handleKeyDown = (e) => {
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
  }, [textNode, onChange, onClose]);

  return (
    <Html>
      <textarea
        ref={textareaRef}
        style={{
          minHeight: "1em",
          position: "absolute",
        }}
      />
    </Html>
  );
};

export const EditableText = ({ points }: { points: number[] }) => {
  const [text, setText] = useState("대충 이런 글씨");
  const [isEditing, setIsEditing] = useState(false);
  const [textWidth, setTextWidth] = useState(200);
  const textRef = useRef<Konva.Text>(null); //textNode ref
  const trRef = useRef<Konva.Transformer>(null); // transformer  ref

  useEffect(() => {
    if (trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
    }
  }, [isEditing]);

  const handleTextDblClick = useCallback(() => {
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
      setTextWidth(newWidth);
      node.setAttrs({
        width: newWidth,
        scaleX: 1,
      });
    }
  }, []);

  return (
    <>
      <Text
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
        visible={!isEditing}
      />
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
          boundBoxFunc={(oldBox, newBox) => ({
            ...newBox,
            width: Math.max(30, newBox.width),
          })}
        />
      )}
    </>
  );
};
