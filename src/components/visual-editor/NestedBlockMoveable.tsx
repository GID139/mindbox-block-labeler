import { useRef, useEffect, useState } from 'react';
import Moveable from 'react-moveable';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import { getTemplate } from '@/lib/visual-editor/block-templates';

interface NestedBlockMoveableProps {
  block: BlockInstance;
  parentRef: HTMLElement | null;
}

export function NestedBlockMoveable({ block, parentRef }: NestedBlockMoveableProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { visualLayout, updateVisualLayout, selectBlock, selectedBlockIds } = useVisualEditorStore();
  const isSelected = selectedBlockIds.includes(block.id);
  const [previewHTML, setPreviewHTML] = useState('');
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const layout = visualLayout[block.id];

  useEffect(() => {
    if (targetRef.current && !parentElement) {
      setParentElement(targetRef.current);
    }
  }, [targetRef.current, parentElement]);

  useEffect(() => {
    const template = getTemplate(block.type);
    setPreviewHTML(template.generateHTML(block));
  }, [block.settings, block.type, block.children]);

  useEffect(() => {
    if (!visualLayout[block.id]) {
      // Initialize layout immediately without waiting for parentRef
      const template = getTemplate(block.type);
      const defaultSize = template.defaultSettings;
      const width = parseInt(String(defaultSize.width)) || 200;
      const height = parseInt(String(defaultSize.height)) || 100;
      
      updateVisualLayout(block.id, {
        x: 10,
        y: 10,
        width,
        height,
        zIndex: 0,
      });
    }
  }, [block.id, visualLayout[block.id]]);

  // Use default layout if not initialized yet
  const currentLayout = layout || {
    x: 10,
    y: 10,
    width: 200,
    height: 100,
    zIndex: 0,
  };

  return (
    <>
      <div
        ref={targetRef}
        onClick={(e) => {
          e.stopPropagation();
          console.log('NestedBlock clicked:', block.id, 'type:', block.type, 'isSelected:', isSelected, 'selectedBlockIds:', selectedBlockIds);
          selectBlock(block.id);
        }}
        className={`absolute cursor-pointer border-2 overflow-visible pointer-events-auto transition-all ${
          isSelected 
            ? 'border-primary shadow-lg' 
            : 'border-transparent hover:border-primary/50 hover:shadow-md'
        }`}
        style={{
          transform: `translate(${currentLayout.x}px, ${currentLayout.y}px)`,
          width: `${currentLayout.width}px`,
          height: `${currentLayout.height}px`,
          zIndex: isSelected ? currentLayout.zIndex + 100 : currentLayout.zIndex + 1,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          outline: '2px dashed orange',
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
        
        {/* Recursively render nested children */}
        {block.children && block.children.length > 0 && block.canContainChildren && (
          <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 10 }}>
            {block.children.map((child) => (
              <NestedBlockMoveable
                key={child.id}
                block={child}
                parentRef={parentElement}
              />
            ))}
          </div>
        )}
      </div>

      {(() => {
        const shouldRenderMoveable = (isSelected || selectedBlockIds.includes(block.id)) && 
          targetRef.current && 
          !block.children?.some(child => selectedBlockIds.includes(child.id));
        
        console.log('Moveable render check for', block.id, ':', {
          isSelected,
          inStore: selectedBlockIds.includes(block.id),
          hasTargetRef: !!targetRef.current,
          hasSelectedChildren: block.children?.some(child => selectedBlockIds.includes(child.id)),
          shouldRender: shouldRenderMoveable
        });
        
        return shouldRenderMoveable ? (
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
            // Constrain to parent bounds if parentRef exists
            if (parentRef) {
              const maxX = parentRef.offsetWidth - currentLayout.width;
              const maxY = parentRef.offsetHeight - currentLayout.height;
              const constrainedX = Math.max(0, Math.min(left, maxX));
              const constrainedY = Math.max(0, Math.min(top, maxY));
              target.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
            } else {
              target.style.transform = `translate(${left}px, ${top}px)`;
            }
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
            // Constrain resize within parent bounds if parentRef exists
            if (parentRef) {
              const maxWidth = parentRef.offsetWidth - drag.left;
              const maxHeight = parentRef.offsetHeight - drag.top;
              const constrainedWidth = Math.min(width, maxWidth);
              const constrainedHeight = Math.min(height, maxHeight);
              
              target.style.width = `${constrainedWidth}px`;
              target.style.height = `${constrainedHeight}px`;
              target.style.transform = `translate(${drag.left}px, ${drag.top}px)`;
            } else {
              target.style.width = `${width}px`;
              target.style.height = `${height}px`;
              target.style.transform = `translate(${drag.left}px, ${drag.top}px)`;
            }
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
        ) : null;
      })()}
    </>
  );
}
