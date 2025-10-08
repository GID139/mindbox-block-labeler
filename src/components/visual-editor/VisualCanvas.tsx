import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import Moveable from 'react-moveable';
import { useRef, useState, useEffect } from 'react';
import { getTemplate } from '@/lib/visual-editor/block-templates';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDroppable } from '@dnd-kit/core';

interface VisualBlockProps {
  block: BlockInstance;
}

function VisualBlock({ block }: VisualBlockProps) {
  const { visualLayout, updateVisualLayout, selectedBlockIds, selectBlock, updateBlock } = useVisualEditorStore();
  const targetRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedBlockIds.includes(block.id);
  const [isEditing, setIsEditing] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');
  
  const layout = visualLayout[block.id] || { 
    x: 0, 
    y: 0, 
    width: 600, 
    height: 100, 
    zIndex: 0 
  };

  // Мгновенное обновление HTML при изменении настроек
  useEffect(() => {
    const template = getTemplate(block.type);
    setPreviewHTML(template.generateHTML(block));
  }, [block.settings, block.type, block.children]);

  // Автофокус и выделение текста при входе в режим редактирования
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (block.type === 'TEXT' || block.type === 'BUTTON') {
      e.stopPropagation();
      e.preventDefault();
      console.log('Double click on editable block:', block.id);
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    if (isEditing && editableRef.current) {
      const newText = editableRef.current.textContent || '';
      console.log('Saving text:', newText);
      updateBlock(block.id, {
        settings: { ...block.settings, text: newText }
      });
      setIsEditing(false);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              ref={targetRef}
              onClick={(e) => {
                e.stopPropagation();
                if (!isEditing) {
                  console.log('Selected block in Visual Mode:', block.id);
                  selectBlock(block.id);
                }
              }}
              onDoubleClick={handleDoubleClick}
              className={`absolute cursor-pointer border-2 overflow-hidden ${
                isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-primary/50'
              }`}
              style={{
                transform: `translate(${layout.x}px, ${layout.y}px)`,
                width: `${layout.width}px`,
                height: `${layout.height}px`,
                zIndex: layout.zIndex,
                transition: 'border-color 0.2s',
                pointerEvents: isEditing ? 'none' : 'auto',
              }}
            >
              {isEditing ? (
                <div
                  ref={editableRef}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handleBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      editableRef.current?.blur();
                    }
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                    }
                  }}
                  className="w-full h-full p-2 outline-none"
                  style={{ pointerEvents: 'auto' }}
                >
                  {block.settings.text || ''}
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
              )}
            </div>
          </TooltipTrigger>
          {(block.type === 'TEXT' || block.type === 'BUTTON') && !isEditing && (
            <TooltipContent>
              <p>Double-click to edit text</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {isSelected && !isEditing && targetRef.current && (
        <Moveable
          target={targetRef.current}
          draggable
          resizable
          throttleResize={0}
          throttleDrag={0}
          renderDirections={["nw", "ne", "sw", "se"]}
          keepRatio={false}
          edge={false}
          snappable
          snapThreshold={5}
          onDrag={({ translate }) => {
            if (targetRef.current) {
              targetRef.current.style.transform = `translate(${translate[0]}px, ${translate[1]}px)`;
            }
          }}
          onDragEnd={({ lastEvent }) => {
            if (lastEvent) {
              updateVisualLayout(block.id, {
                x: lastEvent.translate[0],
                y: lastEvent.translate[1],
              });
            }
          }}
          onResize={({ width, height, drag }) => {
            if (targetRef.current) {
              targetRef.current.style.transform = `translate(${drag.translate[0]}px, ${drag.translate[1]}px)`;
              targetRef.current.style.width = `${width}px`;
              targetRef.current.style.height = `${height}px`;
            }
          }}
          onResizeEnd={({ lastEvent }) => {
            if (lastEvent) {
              updateVisualLayout(block.id, {
                width: lastEvent.width,
                height: lastEvent.height,
                x: lastEvent.drag.translate[0],
                y: lastEvent.drag.translate[1],
              });
            }
          }}
        />
      )}
    </>
  );
}

export function VisualCanvas() {
  const { blocks, showGrid, gridSize, zoom, deviceMode } = useVisualEditorStore();
  
  const { setNodeRef, isOver } = useDroppable({
    id: 'visual-canvas-root',
    data: {
      type: 'visual-canvas-root',
    },
  });
  
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
        ref={setNodeRef}
        className={`relative bg-white shadow-lg transition-all ${
          isOver ? 'ring-4 ring-primary/30' : ''
        }`}
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