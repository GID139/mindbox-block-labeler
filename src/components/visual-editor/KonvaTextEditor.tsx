import { useEffect, useRef, useState } from 'react';

interface KonvaTextEditorProps {
  blockId: string;
  initialText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  stageScale: number;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export function KonvaTextEditor({
  blockId,
  initialText,
  x,
  y,
  width,
  height,
  fontSize,
  fontFamily,
  color,
  stageScale,
  onSave,
  onCancel,
}: KonvaTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(text);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
    // Stop propagation to prevent stage shortcuts
    e.stopPropagation();
  };

  const handleBlur = () => {
    onSave(text);
  };

  return (
    <div
      className="absolute z-[60] pointer-events-auto"
      style={{
        left: x + width / 2,
        top: y + height + 10,
        width,
        minHeight: height,
        transform: 'translateX(-50%)',
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="w-full h-full resize-none border-2 border-primary bg-card p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily,
          color,
          minHeight: `${height}px`,
        }}
      />
    </div>
  );
}
