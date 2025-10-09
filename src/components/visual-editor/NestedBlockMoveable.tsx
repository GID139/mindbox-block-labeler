import { useRef, useEffect, useState } from 'react';
import Moveable from 'react-moveable';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import { getTemplate } from '@/lib/visual-editor/block-templates';

interface NestedBlockMoveableProps {
  block: BlockInstance;
  parentRef: HTMLElement | null;
  isSelected: boolean;
}

export function NestedBlockMoveable({ block, parentRef, isSelected }: NestedBlockMoveableProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { visualLayout, updateVisualLayout, selectBlock } = useVisualEditorStore();
  const [previewHTML, setPreviewHTML] = useState('');

  const layout = visualLayout[block.id];

  useEffect(() => {
    const template = getTemplate(block.type);
    setPreviewHTML(template.generateHTML(block));
  }, [block.settings, block.type, block.children]);

  useEffect(() => {
    if (targetRef.current && parentRef && !visualLayout[block.id]) {
      // Initialize layout for nested blocks with default position and size
      const defaultSize = getTemplate(block.type).defaultSettings;
      const { width, height } = {
        width: parseInt(String(defaultSize.width || 200)) || 200,
        height: parseInt(String(defaultSize.height || 100)) || 100,
      };
      
      updateVisualLayout(block.id, {
        x: 10,
        y: 10,
        width,
        height,
        zIndex: 0,
      });
    }
  }, [parentRef, visualLayout[block.id]]);

  // Don't render if layout not initialized
  if (!layout) return null;

  return (
    <>
      <div
        ref={targetRef}
        onClick={(e) => {
          e.stopPropagation();
          selectBlock(block.id);
        }}
        className={`absolute cursor-pointer border-2 overflow-hidden pointer-events-auto ${
          isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-primary/50'
        }`}
        style={{
          transform: `translate(${layout.x}px, ${layout.y}px)`,
          width: `${layout.width}px`,
          height: `${layout.height}px`,
          zIndex: layout.zIndex + 1,
          transition: 'border-color 0.2s',
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
      </div>

      {isSelected && targetRef.current && parentRef && (
        <Moveable
          target={targetRef.current}
          draggable={true}
          resizable={true}
          keepRatio={false}
          throttleDrag={0}
          throttleResize={0}
          renderDirections={['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']}
          edge={false}
          zoom={1}
          origin={false}
          padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
          bounds={{
            left: 0,
            top: 0,
            right: parentRef.offsetWidth,
            bottom: parentRef.offsetHeight,
            position: 'css'
          }}
          onDrag={({ target, left, top }) => {
            // Constrain to parent bounds
            const maxX = parentRef.offsetWidth - layout.width;
            const maxY = parentRef.offsetHeight - layout.height;
            const constrainedX = Math.max(0, Math.min(left, maxX));
            const constrainedY = Math.max(0, Math.min(top, maxY));
            target.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
          }}
          onDragEnd={({ target }) => {
            const transform = target.style.transform;
            const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            if (match) {
              const x = parseFloat(match[1]);
              const y = parseFloat(match[2]);
              updateVisualLayout(block.id, { x, y });
            }
          }}
          onResize={({ target, width, height, drag }) => {
            // Constrain resize within parent bounds
            const maxWidth = parentRef.offsetWidth - drag.left;
            const maxHeight = parentRef.offsetHeight - drag.top;
            const constrainedWidth = Math.min(width, maxWidth);
            const constrainedHeight = Math.min(height, maxHeight);
            
            target.style.width = `${constrainedWidth}px`;
            target.style.height = `${constrainedHeight}px`;
            target.style.transform = `translate(${drag.left}px, ${drag.top}px)`;
          }}
          onResizeEnd={({ target }) => {
            const width = parseFloat(target.style.width);
            const height = parseFloat(target.style.height);
            const transform = target.style.transform;
            const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            if (match) {
              const x = parseFloat(match[1]);
              const y = parseFloat(match[2]);
              updateVisualLayout(block.id, { x, y, width, height });
            }
          }}
        />
      )}
    </>
  );
}
