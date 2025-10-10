import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Group, Image as KonvaImage, Transformer } from 'react-konva';
import { useDroppable } from '@dnd-kit/core';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import Konva from 'konva';
import { getTemplate, getDefaultBlockSize } from '@/lib/visual-editor/block-templates';
import { toast } from 'sonner';
import { getChildren } from '@/lib/visual-editor/coordinate-utils';
import { findSnapPoints, snapToObjects } from '@/lib/visual-editor/snapping-utils';
import { KonvaContextMenu } from './KonvaContextMenu';
import { KonvaTextEditor } from './KonvaTextEditor';
import { QuickActionsBar } from './QuickActionsBar';

// Separate component for IMAGE block to handle image loading
const KonvaImageBlock = ({ 
  block, 
  layout, 
  isSelected, 
  commonProps 
}: { 
  block: BlockInstance; 
  layout: any; 
  isSelected: boolean; 
  commonProps: any;
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  useEffect(() => {
    if (block.settings.src) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setImage(img);
      img.onerror = () => setImage(null);
      img.src = block.settings.src;
    }
  }, [block.settings.src]);

  if (!image) {
    return (
      <Rect
        {...commonProps}
        width={layout.width}
        height={layout.height}
        fill="#e5e7eb"
        stroke={isSelected ? 'hsl(166, 96%, 29%)' : undefined}
        strokeWidth={isSelected ? 2 : 0}
      />
    );
  }

  return (
    <KonvaImage
      {...commonProps}
      image={image}
      width={layout.width}
      height={layout.height}
      stroke={isSelected ? 'hsl(166, 96%, 29%)' : undefined}
      strokeWidth={isSelected ? 2 : 0}
    />
  );
};

interface KonvaBlockProps {
  block: BlockInstance;
  isSelected: boolean;
  onSelect: (e?: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  allBlocks: BlockInstance[];
}

const KonvaBlock = ({ 
  block, 
  isSelected, 
  onSelect, 
  onDragEnd, 
  allBlocks,
  onDragMove,
  onDoubleClick 
}: KonvaBlockProps & { 
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDoubleClick?: () => void;
}) => {
  const { visualLayout } = useVisualEditorStore();
  const layout = visualLayout[block.id];
  
  if (!layout) return null;

  const commonProps = {
    id: `block-${block.id}`,
    x: layout.x,
    y: layout.y,
    draggable: !block.locked,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => onSelect(e),
    onTap: (e: Konva.KonvaEventObject<MouseEvent>) => onSelect(e),
    onDragMove: onDragMove,
    onDragEnd: onDragEnd,
    onDblClick: onDoubleClick,
    onDblTap: onDoubleClick,
    visible: !block.hidden,
  };

  // Get children for groups/containers
  const children = getChildren(allBlocks, block.id);
  const hasChildren = children.length > 0;

  switch (block.type) {
    case 'RECTANGLE':
      return (
        <Rect
          {...commonProps}
          width={layout.width}
          height={layout.height}
          fill={block.settings.background?.color || '#3b82f6'}
          cornerRadius={parseInt(block.settings.borderRadius) || 0}
          stroke={isSelected ? 'hsl(166, 96%, 29%)' : undefined}
          strokeWidth={isSelected ? 2 : 0}
        />
      );

    case 'CIRCLE':
      return (
        <Circle
          {...commonProps}
          radius={layout.width / 2}
          fill={block.settings.background?.color || '#3b82f6'}
          stroke={isSelected ? 'hsl(166, 96%, 29%)' : undefined}
          strokeWidth={isSelected ? 2 : 0}
        />
      );

    case 'TEXT':
      return (
        <Text
          {...commonProps}
          text={block.settings.text || 'Double-click to edit'}
          fontSize={parseInt(block.settings.fontSize) || 16}
          fontFamily={block.settings.fontFamily || 'Arial'}
          fill={block.settings.color || '#000000'}
          width={layout.width}
          align={block.settings.textAlign || 'left'}
          verticalAlign={block.settings.verticalAlign || 'top'}
          stroke={isSelected ? 'hsl(166, 96%, 29%)' : undefined}
          strokeWidth={isSelected ? 1 : 0}
        />
      );

    case 'LINE':
      return (
        <Line
          {...commonProps}
          points={[0, 0, layout.width, layout.height]}
          stroke={block.settings.color || '#000000'}
          strokeWidth={parseInt(block.settings.strokeWidth) || 2}
        />
      );

    case 'BUTTON':
      return (
        <Group {...commonProps}>
          <Rect
            width={layout.width}
            height={layout.height}
            fill={block.settings.background?.color || '#3b82f6'}
            cornerRadius={parseInt(block.settings.borderRadius) || 8}
            stroke={isSelected ? 'hsl(166, 96%, 29%)' : undefined}
            strokeWidth={isSelected ? 2 : 0}
            listening={true}
          />
          <Text
            text={block.settings.text || 'Button'}
            fontSize={parseInt(block.settings.fontSize) || 16}
            fontFamily={block.settings.fontFamily || 'Arial'}
            fill={block.settings.color || '#ffffff'}
            width={layout.width}
            height={layout.height}
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </Group>
      );

    case 'IMAGE':
      return (
        <KonvaImageBlock
          block={block}
          layout={layout}
          isSelected={isSelected}
          commonProps={commonProps}
        />
      );

    case 'GROUP':
    case 'CONTAINER':
      // Groups render their children
      return (
        <Group {...commonProps}>
          <Rect
            width={layout.width}
            height={layout.height}
            fill="transparent"
            stroke={isSelected ? 'hsl(166, 96%, 29%)' : '#e5e7eb'}
            strokeWidth={isSelected ? 2 : 1}
            dash={block.type === 'GROUP' ? [10, 5] : undefined}
            listening={true}
          />
          {/* Render children */}
          {children.map(child => (
            <KonvaBlock
              key={child.id}
              block={child}
              isSelected={false}
              onSelect={onSelect}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              onDoubleClick={onDoubleClick}
              allBlocks={allBlocks}
            />
          ))}
        </Group>
      );

    default:
      return null;
  }
};

export function KonvaCanvas({ 
  stageRef: externalStageRef,
  onStageTransform
}: { 
  stageRef?: React.RefObject<Konva.Stage>;
  onStageTransform?: (scale: number, pos: { x: number; y: number }) => void;
}) {
  const {
    blocks,
    visualLayout,
    selectedBlockIds,
    selectBlock,
    toggleBlockSelection,
    updateVisualLayout,
    updateBlock,
    showGrid,
    gridSize,
    zoom,
    deviceMode,
    snapToObjects: snapEnabled,
  } = useVisualEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const internalStageRef = externalStageRef || stageRef;
  const transformerRef = useRef<Konva.Transformer>(null);
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);
  
  // Zoom & Pan state
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  // Marquee selection state
  const [marqueeBox, setMarqueeBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // Snap guides state
  const [snapGuides, setSnapGuides] = useState<Array<{ type: 'vertical' | 'horizontal'; position: number }>>([]);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; blockId: string } | null>(null);
  
  // Text editing state
  const [editingTextBlock, setEditingTextBlock] = useState<string | null>(null);
  
  // Keyboard modifiers for resize
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);
  
  // Canvas focus state
  const [isCanvasFocused, setIsCanvasFocused] = useState(false);

  // Make canvas droppable
  const { setNodeRef, isOver } = useDroppable({
    id: 'visual-canvas-root',
    data: { type: 'canvas-root' },
  });

  // Device dimensions
  const deviceDimensions = {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  };

  const canvasWidth = deviceDimensions[deviceMode].width;
  const canvasHeight = deviceDimensions[deviceMode].height;
  const STAGE_WIDTH = 5000;
  const STAGE_HEIGHT = 5000;

  // Focus management for canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocus = () => setIsCanvasFocused(true);
    const handleBlur = () => setIsCanvasFocused(false);

    container.addEventListener('focus', handleFocus);
    container.addEventListener('blur', handleBlur);

    return () => {
      container.removeEventListener('focus', handleFocus);
      container.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Zoom & Pan via Mouse Wheel
  useEffect(() => {
    const stage = internalStageRef.current;
    if (!stage) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const scaleBy = 1.1;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.25, Math.min(4, newScale));

      stage.scale({ x: clampedScale, y: clampedScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };

      stage.position(newPos);
      setStageScale(clampedScale);
      setStagePos(newPos);
      
      // Notify parent
      if (onStageTransform) {
        onStageTransform(clampedScale, newPos);
      }
    };

    const container = stage.container();
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [internalStageRef, onStageTransform]);

  // Pan via Space + Drag (only when canvas is focused)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ВАЖНО: preventDefault() ПЕРЕД любыми проверками для Space
      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (e.code === 'Space' && !isPanning && !editingTextBlock) {
        setIsPanning(true);
        if (internalStageRef.current) {
          internalStageRef.current.draggable(true);
        }
      }
      if (e.key === 'Shift') setIsShiftPressed(true);
      if (e.key === 'Alt') setIsAltPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(false);
        if (internalStageRef.current) {
          internalStageRef.current.draggable(false);
        }
      }
      if (e.key === 'Shift') setIsShiftPressed(false);
      if (e.key === 'Alt') setIsAltPressed(false);
    };

    // Слушать на контейнере, а не на window
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('keyup', handleKeyUp);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPanning, editingTextBlock, containerRef]);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !internalStageRef.current) return;

    const nodes: Konva.Node[] = [];
    const stage = internalStageRef.current;
    
    selectedBlockIds.forEach(id => {
      const node = stage.findOne(`#block-${id}`) as Konva.Node;
      if (node) {
        const block = blocks.find(b => b.id === id);
        // Don't add locked blocks to transformer
        if (!block?.locked) {
          nodes.push(node);
        }
      }
    });

    setSelectedNodes(nodes);
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedBlockIds, blocks, internalStageRef]);

  const handleBlockSelect = (blockId: string, e?: Konva.KonvaEventObject<MouseEvent>) => {
    const isMultiSelect = e?.evt?.ctrlKey || e?.evt?.metaKey || e?.evt?.shiftKey;
    
    console.log('Block select:', blockId, 'Multi:', isMultiSelect, 'Current:', selectedBlockIds);
    
    if (isMultiSelect) {
      toggleBlockSelection(blockId, true);
    } else {
      selectBlock(blockId);
    }
  };

  const handleDragMove = (blockId: string) => (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!snapEnabled || isPanning) return;

    const node = e.target;
    const layout = visualLayout[blockId];
    if (!layout) return;

    // Find snap points of all other blocks
    const snapPoints = findSnapPoints(blocks, visualLayout, blockId);

    // Snap current block
    const result = snapToObjects(
      node.x(),
      node.y(),
      layout.width,
      layout.height,
      snapPoints
    );

    // Apply snap
    if (result.snappedX || result.snappedY) {
      node.position({ x: result.x, y: result.y });
    }

    // Show guide lines
    setSnapGuides(result.guides);
  };

  const handleDragEnd = (blockId: string) => (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const layout = visualLayout[blockId];
    
    if (!layout) return;

    // Snap to grid if enabled
    let newX = node.x();
    let newY = node.y();

    if (showGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    updateVisualLayout(blockId, {
      x: newX,
      y: newY,
    });

    // Update node position to snapped position
    node.position({ x: newX, y: newY });
    
    // Clear snap guides
    setSnapGuides([]);
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const blockId = node.id().replace('block-', '');
    
    if (!blockId) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Update layout with new dimensions
    updateVisualLayout(blockId, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    });

    // Reset scale to 1
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Close context menu
    setContextMenu(null);
    
    // Start marquee selection if clicking on empty canvas (not panning)
    if (e.target === e.target.getStage() && !isPanning) {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      // Convert screen position to canvas position
      const x = (pos.x - stagePos.x) / stageScale;
      const y = (pos.y - stagePos.y) / stageScale;

      setMarqueeBox({ x, y, width: 0, height: 0 });
    }
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (marqueeBox && !isPanning) {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      // Convert screen position to canvas position
      const x = (pos.x - stagePos.x) / stageScale;
      const y = (pos.y - stagePos.y) / stageScale;

      const newBox = {
        x: Math.min(marqueeBox.x, x),
        y: Math.min(marqueeBox.y, y),
        width: Math.abs(x - marqueeBox.x),
        height: Math.abs(y - marqueeBox.y),
      };

      setMarqueeBox(newBox);

      // Find all blocks inside marquee
      const selectedIds: string[] = [];
      rootBlocks.forEach(block => {
        const layout = visualLayout[block.id];
        if (!layout) return;

        const blockBox = {
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
        };

        // Check rectangle intersection
        if (
          newBox.x < blockBox.x + blockBox.width &&
          newBox.x + newBox.width > blockBox.x &&
          newBox.y < blockBox.y + blockBox.height &&
          newBox.y + newBox.height > blockBox.y
        ) {
          selectedIds.push(block.id);
        }
      });

      // Update selection
      useVisualEditorStore.setState({ selectedBlockIds: selectedIds });
    }
  };

  const handleStageMouseUp = () => {
    setMarqueeBox(null);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty area
    if (e.target === e.target.getStage()) {
      selectBlock('');
    }
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    const clickedNode = e.target;
    let blockId: string | null = null;

    // Check if we clicked on a block
    if (clickedNode !== stage) {
      const id = clickedNode.id();
      if (id && id.startsWith('block-')) {
        blockId = id.replace('block-', '');
      } else {
        // Try to find parent block
        let parent = clickedNode.parent;
        while (parent && parent !== stage) {
          const parentId = parent.id();
          if (parentId && parentId.startsWith('block-')) {
            blockId = parentId.replace('block-', '');
            break;
          }
          parent = parent.parent;
        }
      }
    }

    if (blockId) {
      setContextMenu({ x: pos.x, y: pos.y, blockId });
    }
  };

  const handleDoubleClick = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block && (block.type === 'TEXT' || block.type === 'BUTTON')) {
      setEditingTextBlock(blockId);
    }
  };

  // Filter root blocks only (blocks without parent)
  const rootBlocks = blocks.filter(b => !b.parentId);

  return (
    <div 
      ref={(node) => {
        setNodeRef(node);
        if (node) containerRef.current = node;
      }}
      tabIndex={0}
      className="relative w-full h-full flex items-center justify-center bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
      onMouseEnter={() => containerRef.current?.focus()}
      data-canvas-container
    >
      <div 
        className="relative bg-card shadow-lg"
        style={{
          width: canvasWidth * zoom,
          height: canvasHeight * zoom,
          outline: isOver ? '2px solid hsl(166, 96%, 29%)' : undefined,
        }}
      >
        <Stage
          ref={internalStageRef}
          width={canvasWidth * zoom}
          height={canvasHeight * zoom}
          scaleX={zoom}
          scaleY={zoom}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onContextMenu={handleContextMenu}
          draggable={isPanning}
        >
          {/* Layer 1: Background (grid) */}
          <Layer listening={false}>
            {showGrid && (
              <>
                {Array.from({ length: Math.ceil(STAGE_WIDTH / gridSize) }).map((_, i) => (
                  <Line
                    key={`v-${i}`}
                    points={[i * gridSize, 0, i * gridSize, STAGE_HEIGHT]}
                    stroke="hsl(214, 32%, 91%)"
                    strokeWidth={0.5}
                    listening={false}
                  />
                ))}
                {Array.from({ length: Math.ceil(STAGE_HEIGHT / gridSize) }).map((_, i) => (
                  <Line
                    key={`h-${i}`}
                    points={[0, i * gridSize, STAGE_WIDTH, i * gridSize]}
                    stroke="hsl(214, 32%, 91%)"
                    strokeWidth={0.5}
                    listening={false}
                  />
                ))}
              </>
            )}
            
            {/* Visible canvas area indicator */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill="transparent"
              stroke="#94a3b8"
              strokeWidth={2}
              dash={[10, 5]}
              listening={false}
            />
          </Layer>

          {/* Layer 2: Blocks */}
          <Layer>
            {rootBlocks.map(block => (
              <Group key={block.id}>
                <KonvaBlock
                  block={block}
                  isSelected={selectedBlockIds.includes(block.id)}
                  onSelect={(e) => handleBlockSelect(block.id, e)}
                  onDragMove={handleDragMove(block.id)}
                  onDragEnd={handleDragEnd(block.id)}
                  onDoubleClick={() => handleDoubleClick(block.id)}
                  allBlocks={blocks}
                />
              </Group>
            ))}
          </Layer>

          {/* Layer 3: UI (transformer, guides, marquee) */}
          <Layer listening={false}>
            {/* Snap guide lines */}
            {snapGuides.map((guide, i) => (
              <Line
                key={`guide-${i}`}
                points={
                  guide.type === 'vertical'
                    ? [guide.position, 0, guide.position, STAGE_HEIGHT]
                    : [0, guide.position, STAGE_WIDTH, guide.position]
                }
                stroke="#ff00ff"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            ))}

            {/* Marquee selection box */}
            {marqueeBox && (
              <Rect
                x={marqueeBox.x}
                y={marqueeBox.y}
                width={marqueeBox.width}
                height={marqueeBox.height}
                fill="rgba(59, 130, 246, 0.15)"
                stroke="rgba(59, 130, 246, 1)"
                strokeWidth={2 / stageScale}
                listening={false}
              />
            )}
          </Layer>

          {/* Layer 4: Transformer (needs to be on top) */}
          <Layer>
            <Transformer
              ref={transformerRef}
              onTransformEnd={handleTransformEnd}
              keepRatio={isShiftPressed || selectedBlockIds.some(id => {
                const block = blocks.find(b => b.id === id);
                return block?.type === 'IMAGE';
              })}
              centeredScaling={isAltPressed}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit resize
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
              enabledAnchors={[
                'top-left',
                'top-right',
                'bottom-left',
                'bottom-right',
                'middle-left',
                'middle-right',
                'top-center',
                'bottom-center',
              ]}
            />
          </Layer>
        </Stage>
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-muted-foreground shadow-lg border">
        {canvasWidth} × {canvasHeight} | Stage Zoom: {Math.round(stageScale * 100)}% | View Zoom: {Math.round(zoom * 100)}%
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <KonvaContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          blockId={contextMenu.blockId}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Text Editor */}
      {editingTextBlock && (() => {
        const block = blocks.find(b => b.id === editingTextBlock);
        const layout = visualLayout[editingTextBlock];
        if (!block || !layout) return null;

        return (
          <KonvaTextEditor
            blockId={editingTextBlock}
            initialText={block.settings.text || ''}
            x={layout.x * zoom * stageScale + stagePos.x}
            y={layout.y * zoom * stageScale + stagePos.y}
            width={layout.width * zoom * stageScale}
            height={layout.height * zoom * stageScale}
            fontSize={(parseInt(block.settings.fontSize) || 16) * zoom * stageScale}
            fontFamily={block.settings.fontFamily || 'Arial'}
            color={block.settings.color || '#000000'}
            stageScale={stageScale}
            onSave={(text) => {
              updateBlock(editingTextBlock, { settings: { ...block.settings, text } });
              setEditingTextBlock(null);
            }}
            onCancel={() => setEditingTextBlock(null)}
          />
        );
      })()}

      {/* Quick Actions Bar */}
      {selectedBlockIds.length === 1 && !editingTextBlock && (() => {
        const block = blocks.find(b => b.id === selectedBlockIds[0]);
        const layout = visualLayout[selectedBlockIds[0]];
        if (!block || !layout) return null;

        return (
          <QuickActionsBar
            block={block}
            position={{
              x: (layout.x + layout.width / 2) * zoom * stageScale + stagePos.x,
              y: layout.y * zoom * stageScale + stagePos.y,
            }}
            stageScale={zoom * stageScale}
          />
        );
      })()}
    </div>
  );
}
