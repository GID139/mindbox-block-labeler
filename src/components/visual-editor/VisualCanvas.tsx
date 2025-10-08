import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import Moveable from 'react-moveable';
import { useRef, useState } from 'react';
import { getTemplate } from '@/lib/visual-editor/block-templates';

interface VisualBlockProps {
  block: BlockInstance;
}

function VisualBlock({ block }: VisualBlockProps) {
  const { visualLayout, updateVisualLayout, selectedBlockIds, selectBlock } = useVisualEditorStore();
  const targetRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedBlockIds.includes(block.id);
  
  const layout = visualLayout[block.id] || { 
    x: 0, 
    y: 0, 
    width: 600, 
    height: 100, 
    zIndex: 0 
  };

  const template = getTemplate(block.type);
  const previewHTML = template.generateHTML(block);

  return (
    <>
      <div
        ref={targetRef}
        onClick={(e) => {
          e.stopPropagation();
          selectBlock(block.id);
        }}
        className={`absolute cursor-pointer border-2 transition-all ${
          isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-primary/50'
        }`}
        style={{
          left: `${layout.x}px`,
          top: `${layout.y}px`,
          width: `${layout.width}px`,
          height: `${layout.height}px`,
          zIndex: layout.zIndex,
        }}
        dangerouslySetInnerHTML={{ __html: previewHTML }}
      />
      
      {isSelected && targetRef.current && (
        <Moveable
          target={targetRef.current}
          draggable
          resizable
          snappable
          snapThreshold={5}
          onDrag={({ translate }) => {
            updateVisualLayout(block.id, {
              x: translate[0],
              y: translate[1],
            });
          }}
          onResize={({ width, height, drag }) => {
            updateVisualLayout(block.id, {
              width,
              height,
              x: drag.translate[0],
              y: drag.translate[1],
            });
          }}
        />
      )}
    </>
  );
}

export function VisualCanvas() {
  const { blocks, showGrid, gridSize, zoom, deviceMode } = useVisualEditorStore();
  
  const deviceWidths = {
    mobile: 375,
    tablet: 768,
    desktop: 600,
  };

  const renderBlocks = (blocks: BlockInstance[]): JSX.Element[] => {
    return blocks.flatMap(block => [
      <VisualBlock key={block.id} block={block} />,
      ...renderBlocks(block.children),
    ]);
  };

  return (
    <div className="flex justify-center items-start p-8 bg-muted/20 min-h-full">
      <div 
        className="relative bg-white shadow-lg"
        style={{
          width: `${deviceWidths[deviceMode]}px`,
          minHeight: '800px',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          backgroundImage: showGrid ? `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          ` : 'none',
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      >
        {renderBlocks(blocks)}
      </div>
    </div>
  );
}