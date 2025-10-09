import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance, BlockType } from '@/types/visual-editor';
import Moveable from 'react-moveable';
import { useRef, useState, useEffect } from 'react';
import { getTemplate } from '@/lib/visual-editor/block-templates';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDroppable } from '@dnd-kit/core';
import { generateBlockName, getAllBlockNames } from '@/lib/visual-editor/naming';
import { toast } from 'sonner';
import { MarqueeSelection } from './MarqueeSelection';
import { BlockContextMenu } from './BlockContextMenu';
import { Ruler } from './Ruler';
import { Measurements } from './Measurements';
import { GuideLines } from './GuideLines';
import { SmartGuides } from './SmartGuides';
import { importImage } from '@/lib/visual-editor/export-utils';
import { snapToGrid, snapToObjects, findSnapPoints, SnapGuide } from '@/lib/visual-editor/snapping-utils';

interface VisualBlockProps {
  block: BlockInstance;
  canvasWidth: number;
  canvasHeight: number;
}

function VisualBlock({ block, canvasWidth, canvasHeight }: VisualBlockProps) {
  const { 
    visualLayout, 
    updateVisualLayout, 
    selectedBlockIds, 
    selectBlock, 
    updateBlock,
    blocks,
    snapToGrid: enableSnapToGrid,
    snapToObjects: enableSnapToObjects,
    gridSize,
  } = useVisualEditorStore();
  
  const targetRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedBlockIds.includes(block.id);
  const [isEditing, setIsEditing] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const layout = visualLayout[block.id] || { 
    x: 0, 
    y: 0, 
    width: 600, 
    height: 100, 
    zIndex: 0 
  };

  const constraints = block.constraints || {};

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
    <BlockContextMenu block={block}>
      <div>
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
          <>
            <Moveable
              target={targetRef.current}
              draggable
              resizable
              throttleResize={0}
              throttleDrag={0}
              renderDirections={["nw", "ne", "sw", "se"]}
              keepRatio={constraints.lockAspectRatio || false}
              edge={false}
              onDragStart={() => {
                setIsDragging(true);
                setSnapGuides([]);
              }}
              onDrag={({ translate }) => {
                if (targetRef.current) {
                  let x = translate[0];
                  let y = translate[1];
                  const currentWidth = layout.width;
                  const currentHeight = layout.height;

                  // Apply snapping
                  if (enableSnapToGrid) {
                    const snapped = snapToGrid(x, y, gridSize);
                    x = snapped.x;
                    y = snapped.y;
                  }

                  if (enableSnapToObjects) {
                    const snapPoints = findSnapPoints(blocks, visualLayout, block.id);
                    const snapResult = snapToObjects(x, y, currentWidth, currentHeight, snapPoints);
                    if (snapResult.snappedX) x = snapResult.x;
                    if (snapResult.snappedY) y = snapResult.y;
                    setSnapGuides(snapResult.guides);
                  }

                  // Apply canvas boundaries
                  x = Math.max(0, Math.min(x, canvasWidth - currentWidth));
                  y = Math.max(0, Math.min(y, canvasHeight - currentHeight));

                  targetRef.current.style.transform = `translate(${x}px, ${y}px)`;
                }
              }}
              onDragEnd={({ lastEvent }) => {
                setIsDragging(false);
                setSnapGuides([]);
                if (lastEvent) {
                  let x = lastEvent.translate[0];
                  let y = lastEvent.translate[1];
                  const currentWidth = layout.width;
                  const currentHeight = layout.height;

                  // Apply snapping
                  if (enableSnapToGrid) {
                    const snapped = snapToGrid(x, y, gridSize);
                    x = snapped.x;
                    y = snapped.y;
                  }

                  if (enableSnapToObjects) {
                    const snapPoints = findSnapPoints(blocks, visualLayout, block.id);
                    const snapResult = snapToObjects(x, y, currentWidth, currentHeight, snapPoints);
                    if (snapResult.snappedX) x = snapResult.x;
                    if (snapResult.snappedY) y = snapResult.y;
                  }

                  // Apply canvas boundaries
                  x = Math.max(0, Math.min(x, canvasWidth - currentWidth));
                  y = Math.max(0, Math.min(y, canvasHeight - currentHeight));

                  updateVisualLayout(block.id, { x, y });
                }
              }}
              onResize={({ width, height, drag }) => {
                if (targetRef.current) {
                  let newWidth = width;
                  let newHeight = height;
                  let x = drag.translate[0];
                  let y = drag.translate[1];

                  // Apply size constraints
                  if (constraints.minWidth) newWidth = Math.max(constraints.minWidth, newWidth);
                  if (constraints.maxWidth) newWidth = Math.min(constraints.maxWidth, newWidth);
                  if (constraints.minHeight) newHeight = Math.max(constraints.minHeight, newHeight);
                  if (constraints.maxHeight) newHeight = Math.min(constraints.maxHeight, newHeight);

                  // Apply canvas boundaries
                  newWidth = Math.min(newWidth, canvasWidth - x);
                  newHeight = Math.min(newHeight, canvasHeight - y);
                  x = Math.max(0, Math.min(x, canvasWidth - newWidth));
                  y = Math.max(0, Math.min(y, canvasHeight - newHeight));

                  targetRef.current.style.transform = `translate(${x}px, ${y}px)`;
                  targetRef.current.style.width = `${newWidth}px`;
                  targetRef.current.style.height = `${newHeight}px`;
                }
              }}
              onResizeEnd={({ lastEvent }) => {
                if (lastEvent) {
                  let newWidth = lastEvent.width;
                  let newHeight = lastEvent.height;
                  let x = lastEvent.drag.translate[0];
                  let y = lastEvent.drag.translate[1];

                  // Apply size constraints
                  if (constraints.minWidth) newWidth = Math.max(constraints.minWidth, newWidth);
                  if (constraints.maxWidth) newWidth = Math.min(constraints.maxWidth, newWidth);
                  if (constraints.minHeight) newHeight = Math.max(constraints.minHeight, newHeight);
                  if (constraints.maxHeight) newHeight = Math.min(constraints.maxHeight, newHeight);

                  // Apply canvas boundaries
                  newWidth = Math.min(newWidth, canvasWidth - x);
                  newHeight = Math.min(newHeight, canvasHeight - y);
                  x = Math.max(0, Math.min(x, canvasWidth - newWidth));
                  y = Math.max(0, Math.min(y, canvasHeight - newHeight));

                  updateVisualLayout(block.id, {
                    width: newWidth,
                    height: newHeight,
                    x,
                    y,
                  });
                }
              }}
            />
            {isDragging && snapGuides.length > 0 && (
              <SmartGuides 
                guides={snapGuides} 
                canvasWidth={canvasWidth} 
                canvasHeight={canvasHeight} 
              />
            )}
          </>
        )}
      </div>
    </BlockContextMenu>
  );
}

export function VisualCanvas() {
  const {
    blocks,
    addBlock,
    deviceMode,
    showGrid,
    zoom,
    drawingTool,
    setDrawingTool,
    visualLayout,
    selectedBlockIds,
    clearSelection,
    startMarqueeSelection,
    updateMarqueeSelection,
    endMarqueeSelection,
    marqueeStart,
    marqueeEnd,
    isMarqueeSelecting,
    showRulers,
    showMeasurements,
    gridSize,
    updateVisualLayout,
    guides,
  } = useVisualEditorStore();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: 'visual-canvas-root',
    data: {
      type: 'visual-canvas-root',
    },
  });
  
  const deviceWidths = {
    mobile: 375,
    tablet: 768,
    desktop: 1200,
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start marquee if clicking directly on canvas (not on blocks)
    if (e.target !== e.currentTarget) return;
    
    if (drawingTool === 'select') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      
      // Clear selection if not holding Shift
      if (!e.shiftKey) {
        clearSelection();
      }
      
      startMarqueeSelection(x, y);
      e.preventDefault();
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMarqueeSelecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      updateMarqueeSelection(x, y);
    }
  };
  
  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMarqueeSelecting) {
      endMarqueeSelection(e.shiftKey);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only create blocks when clicking on the canvas itself, not on blocks
    if (e.target !== e.currentTarget) return;
    
    if (drawingTool !== 'select') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      
      const existingNames = getAllBlockNames(blocks);
      const newBlockName = generateBlockName(drawingTool.toUpperCase() as BlockType, existingNames);
      const template = getTemplate(drawingTool.toUpperCase() as BlockType);
      
      const newBlock: BlockInstance = {
        id: `${drawingTool}-${Date.now()}`,
        type: drawingTool.toUpperCase() as BlockType,
        name: newBlockName,
        settings: { ...template.defaultSettings },
        children: [],
        canContainChildren: template.canContainChildren,
        maxNestingLevel: template.maxNestingLevel,
      };
      
      addBlock(newBlock);
      
      // Set layout for visual mode
      const defaultSize = drawingTool === 'rectangle' ? { width: 200, height: 150 } :
                         drawingTool === 'circle' ? { width: 150, height: 150 } :
                         { width: 200, height: 2 };
      
      updateVisualLayout(newBlock.id, {
        x: Math.max(0, x - defaultSize.width / 2),
        y: Math.max(0, y - defaultSize.height / 2),
        ...defaultSize,
        zIndex: 0,
      });
      
      toast.success(`${template.name} created`);
      setDrawingTool('select');
    }
  };

  const renderBlocks = (blocks: BlockInstance[], canvasWidth: number, canvasHeight: number): JSX.Element[] => {
    return blocks.flatMap(block => [
      <VisualBlock key={block.id} block={block} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />,
      ...renderBlocks(block.children, canvasWidth, canvasHeight),
    ]);
  };
  
  // Handle image drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const dataUrl = await importImage(file);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left) / zoom;
          const y = (e.clientY - rect.top) / zoom;
          
          const newBlock: BlockInstance = {
            id: `image-${Date.now()}`,
            type: 'IMAGE',
            name: `image${Date.now()}`,
            settings: {
              src: dataUrl,
              alt: file.name,
              width: '300px',
              height: 'auto',
            },
            children: [],
            canContainChildren: false,
            maxNestingLevel: 0,
          };
          
          addBlock(newBlock);
          updateVisualLayout(newBlock.id, {
            x: Math.max(0, x - 150),
            y: Math.max(0, y - 150),
            width: 300,
            height: 200,
            zIndex: 0,
          });
        }
      } catch (error) {
        // Error already handled
      }
    }
  };

  const canvasWidth = deviceWidths[deviceMode];
  const canvasHeight = 800; // min-height от canvas

  return (
    <div className="flex justify-center items-start p-8 bg-muted/20 min-h-full">
      <div 
        ref={(node) => {
          setNodeRef(node);
          (canvasRef as any).current = node;
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`visual-canvas-content relative bg-white shadow-lg transition-all overflow-hidden ${
          isOver || isDraggingOver ? 'ring-4 ring-primary/30' : ''
        } ${drawingTool !== 'select' ? 'cursor-crosshair' : 'cursor-default'}`}
        style={{
          width: `${canvasWidth}px`,
          minHeight: `${canvasHeight}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          backgroundImage: showGrid ? `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          ` : 'none',
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: '0 0',
        }}
      >
        {renderBlocks(blocks, canvasWidth, canvasHeight)}
        
        {isMarqueeSelecting && marqueeStart && marqueeEnd && (
          <MarqueeSelection start={marqueeStart} end={marqueeEnd} zoom={zoom} />
        )}
        
        {/* Guide Lines */}
        <GuideLines guides={guides} />
        
        {/* Rulers */}
        {showRulers && <Ruler canvasWidth={canvasWidth} canvasHeight={canvasHeight} />}

        {/* Measurements */}
        {showMeasurements && <Measurements selectedBlockIds={selectedBlockIds} visualLayout={visualLayout} />}
      </div>
    </div>
  );
}