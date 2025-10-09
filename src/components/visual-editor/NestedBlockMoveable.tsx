import { useRef, useEffect } from 'react';
import Moveable from 'react-moveable';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';

interface NestedBlockMoveableProps {
  block: BlockInstance;
  parentRef: HTMLElement | null;
  isSelected: boolean;
}

export function NestedBlockMoveable({ block, parentRef, isSelected }: NestedBlockMoveableProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { visualLayout, updateVisualLayout } = useVisualEditorStore();

  const layout = visualLayout[block.id] || { x: 0, y: 0, width: 200, height: 100, zIndex: 0 };

  useEffect(() => {
    if (targetRef.current && !visualLayout[block.id]) {
      // Initialize layout for nested blocks with default position
      updateVisualLayout(block.id, {
        x: 0,
        y: 0,
        width: layout.width,
        height: layout.height,
        zIndex: 0,
      });
    }
  }, []);

  if (!isSelected) {
    return (
      <div
        ref={targetRef}
        style={{
          position: 'relative',
          transform: `translate(${layout.x}px, ${layout.y}px)`,
          width: `${layout.width}px`,
          height: `${layout.height}px`,
        }}
      >
        {/* Content will be rendered by CanvasBlock */}
      </div>
    );
  }

  return (
    <>
      <div
        ref={targetRef}
        style={{
          position: 'relative',
          transform: `translate(${layout.x}px, ${layout.y}px)`,
          width: `${layout.width}px`,
          height: `${layout.height}px`,
        }}
      >
        {/* Content will be rendered by CanvasBlock */}
      </div>

      {targetRef.current && (
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
          bounds={parentRef ? {
            left: 0,
            top: 0,
            right: parentRef.offsetWidth,
            bottom: parentRef.offsetHeight,
            position: 'css'
          } : undefined}
          onDrag={({ target, left, top }) => {
            target.style.transform = `translate(${left}px, ${top}px)`;
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
            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
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
