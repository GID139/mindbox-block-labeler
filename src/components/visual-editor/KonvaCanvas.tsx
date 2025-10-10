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
  commonProps,
  outerWidth,
  outerHeight,
  padding
}: { 
  block: BlockInstance; 
  layout: any; 
  isSelected: boolean; 
  commonProps: any;
  outerWidth: number;
  outerHeight: number;
  padding: { top: number; right: number; bottom: number; left: number };
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    if (!block.settings.src) {
      setImage(null);
      setLoading(false);
      setError(false);
      return;
    }
    
    setLoading(true);
    setError(false);
    
    const img = new window.Image();
    
    // Try with CORS first
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      setImage(img);
      setLoading(false);
    };
    
    img.onerror = () => {
      // If CORS fails, try without CORS
      const imgNoCors = new window.Image();
      
      imgNoCors.onload = () => {
        setImage(imgNoCors);
        setLoading(false);
      };
      
      imgNoCors.onerror = () => {
        console.error('Failed to load image:', block.settings.src);
        setError(true);
        setLoading(false);
      };
      
      imgNoCors.src = block.settings.src;
    };
    
    img.src = block.settings.src;
  }, [block.settings.src]);

  // No URL provided or error
  if (!block.settings.src || error) {
    return (
      <Group {...commonProps}>
        <Rect
          width={outerWidth}
          height={outerHeight}
          fill="transparent"
          listening={true}
        />
        <Rect
          x={padding.left}
          y={padding.top}
          width={layout.width}
          height={layout.height}
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth={2}
          dash={[5, 5]}
        />
        <Text
          x={padding.left}
          y={padding.top}
          text={error ? 'Failed to load' : 'Enter image URL'}
          fontSize={14}
          fill="#6b7280"
          width={layout.width}
          height={layout.height}
          align="center"
          verticalAlign="middle"
        />
      </Group>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Group {...commonProps}>
        <Rect
          width={outerWidth}
          height={outerHeight}
          fill="transparent"
          listening={true}
        />
        <Rect
          x={padding.left}
          y={padding.top}
          width={layout.width}
          height={layout.height}
          fill="#f3f4f6"
        />
        <Text
          x={padding.left}
          y={padding.top}
          text="Loading..."
          fontSize={14}
          fill="#6b7280"
          width={layout.width}
          height={layout.height}
          align="center"
          verticalAlign="middle"
        />
      </Group>
    );
  }

  // Image loaded successfully
  return (
    <Group {...commonProps}>
      <Rect
        width={outerWidth}
        height={outerHeight}
        fill="transparent"
        listening={true}
      />
      <KonvaImage
        x={padding.left}
        y={padding.top}
        image={image}
        width={layout.width}
        height={layout.height}
        cornerRadius={parseInt(block.settings.borderRadius) || 0}
        stroke={block.settings.stroke || (isSelected ? 'hsl(166, 96%, 29%)' : undefined)}
        strokeWidth={parseInt(block.settings.strokeWidth) || (isSelected ? 2 : 0)}
        shadowColor={block.settings.shadowColor}
        shadowOffsetX={parseInt(block.settings.shadowOffsetX) || 0}
        shadowOffsetY={parseInt(block.settings.shadowOffsetY) || 0}
        shadowBlur={parseInt(block.settings.shadowBlur) || 0}
        shadowOpacity={parseFloat(block.settings.shadowOpacity) || 0}
        opacity={parseFloat(block.settings.opacity) || 1}
        listening={false}
      />
    </Group>
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

  // Calculate margin and padding
  const margin = block.settings.margin || { top: 0, right: 0, bottom: 0, left: 0 };
  const padding = block.settings.padding || { top: 0, right: 0, bottom: 0, left: 0 };

  // Apply margin to position
  const adjustedX = layout.x + margin.left;
  const adjustedY = layout.y + margin.top;

  // NEW LOGIC: padding increases outer size, content stays same
  const contentWidth = layout.width;
  const contentHeight = layout.height;
  const outerWidth = layout.width + padding.left + padding.right;
  const outerHeight = layout.height + padding.top + padding.bottom;

  const commonProps = {
      id: `block-${block.id}`,
      x: adjustedX,
      y: adjustedY,
      width: outerWidth,
      height: outerHeight,
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
          width={outerWidth}
          height={outerHeight}
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
          radius={outerWidth / 2}
          fill={block.settings.background?.color || '#3b82f6'}
          stroke={isSelected ? 'hsl(166, 96%, 29%)' : undefined}
          strokeWidth={isSelected ? 2 : 0}
        />
      );

    case 'TEXT':
      return (
        <Group {...commonProps}>
          <Rect
            width={outerWidth}
            height={outerHeight}
            fill="transparent"
            listening={true}
          />
          <Text
            x={padding.left}
            y={padding.top}
            text={block.settings.text || 'Double-click to edit'}
            fontSize={parseInt(block.settings.fontSize) || 16}
            fontFamily={block.settings.fontFamily || 'Arial'}
            fontStyle={block.settings.fontWeight || 'normal'}
            align={block.settings.textAlign || 'left'}
            fill={block.settings.fill || '#000000'}
            stroke={block.settings.stroke}
            strokeWidth={parseInt(block.settings.strokeWidth) || 0}
            shadowColor={block.settings.shadowColor}
            shadowOffsetX={parseInt(block.settings.shadowOffsetX) || 0}
            shadowOffsetY={parseInt(block.settings.shadowOffsetY) || 0}
            shadowBlur={parseInt(block.settings.shadowBlur) || 0}
            shadowOpacity={parseFloat(block.settings.shadowOpacity) || 0}
            opacity={parseFloat(block.settings.opacity) || 1}
            width={contentWidth}
            listening={false}
          />
        </Group>
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
          {/* Outer boundary for events (invisible) */}
          <Rect
            width={outerWidth}
            height={outerHeight}
            fill="transparent"
            listening={true}
          />
          {/* Inner colored rect with padding offset */}
          <Rect
            x={padding.left}
            y={padding.top}
            width={contentWidth}
            height={contentHeight}
            fill={block.settings.fill || '#3b82f6'}
            cornerRadius={parseInt(block.settings.borderRadius) || 8}
            stroke={block.settings.stroke || (isSelected ? 'hsl(166, 96%, 29%)' : undefined)}
            strokeWidth={parseInt(block.settings.strokeWidth) || (isSelected ? 2 : 0)}
            shadowColor={block.settings.shadowColor}
            shadowOffsetX={parseInt(block.settings.shadowOffsetX) || 0}
            shadowOffsetY={parseInt(block.settings.shadowOffsetY) || 0}
            shadowBlur={parseInt(block.settings.shadowBlur) || 0}
            shadowOpacity={parseFloat(block.settings.shadowOpacity) || 0}
            opacity={parseFloat(block.settings.opacity) || 1}
            listening={false}
          />
          <Text
            x={padding.left}
            y={padding.top}
            text={block.settings.text || 'Button'}
            fontSize={16}
            fontFamily="Arial"
            fill={block.settings.textColor || '#ffffff'}
            width={contentWidth}
            height={contentHeight}
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
          layout={{
            ...layout,
            width: contentWidth,
            height: contentHeight,
          }}
          isSelected={isSelected}
          commonProps={commonProps}
          outerWidth={outerWidth}
          outerHeight={outerHeight}
          padding={padding}
        />
      );

    case 'CONTAINER':
      // Containers render their children
      return (
        <Group {...commonProps}>
          {/* Outer transparent rect for events */}
          <Rect
            width={outerWidth}
            height={outerHeight}
            fill="transparent"
            listening={true}
          />
          {/* Inner colored rect with padding offset */}
          <Rect
            x={padding.left}
            y={padding.top}
            width={contentWidth}
            height={contentHeight}
            fill={block.settings.fill || 'transparent'}
            cornerRadius={parseInt(block.settings.borderRadius) || 0}
            stroke={block.settings.stroke || (isSelected ? 'hsl(166, 96%, 29%)' : '#e5e7eb')}
            strokeWidth={parseInt(block.settings.strokeWidth) || (isSelected ? 2 : 1)}
            shadowColor={block.settings.shadowColor}
            shadowOffsetX={parseInt(block.settings.shadowOffsetX) || 0}
            shadowOffsetY={parseInt(block.settings.shadowOffsetY) || 0}
            shadowBlur={parseInt(block.settings.shadowBlur) || 0}
            shadowOpacity={parseFloat(block.settings.shadowOpacity) || 0}
            opacity={parseFloat(block.settings.opacity) || 1}
            listening={false}
          />
          <Group
            x={padding.left}
            y={padding.top}
            clipX={0}
            clipY={0}
            clipWidth={contentWidth}
            clipHeight={contentHeight}
          >
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
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDraggingMarquee, setIsDraggingMarquee] = useState(false);
  
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

  // Set up boundBoxFunc for constraining resize
  useEffect(() => {
    if (!transformerRef.current || selectedNodes.length === 0) return;
    
    const transformer = transformerRef.current;
    
    transformer.boundBoxFunc((oldBox, newBox) => {
      // Get the selected block
      const selectedId = selectedBlockIds[0];
      const selectedBlock = blocks.find(b => b.id === selectedId);
      
      if (!selectedBlock) return newBox;
      
      // Determine minimum sizes by block type
      let minWidth = 20;
      let minHeight = 20;
      
      switch (selectedBlock.type) {
        case 'BUTTON':
          minWidth = 60;
          minHeight = 30;
          break;
        case 'CONTAINER':
        case 'GROUP':
        case 'GRID_CONTAINER':
        case 'FLEX_CONTAINER':
          minWidth = 100;
          minHeight = 100;
          break;
        case 'TEXT':
          minWidth = 50;
          minHeight = 20;
          break;
        case 'TABLE':
          minWidth = 200;
          minHeight = 100;
          break;
      }
      
      // Apply constraints from block if they exist
      if (selectedBlock.constraints) {
        minWidth = selectedBlock.constraints.minWidth || minWidth;
        minHeight = selectedBlock.constraints.minHeight || minHeight;
      }
      
      // Constrain dimensions
      if (newBox.width < minWidth) {
        newBox.width = minWidth;
      }
      if (newBox.height < minHeight) {
        newBox.height = minHeight;
      }
      
      // Apply maximum constraints
      const maxWidth = selectedBlock.constraints?.maxWidth || 2000;
      const maxHeight = selectedBlock.constraints?.maxHeight || 2000;
      
      if (newBox.width > maxWidth) {
        newBox.width = maxWidth;
      }
      if (newBox.height > maxHeight) {
        newBox.height = maxHeight;
      }
      
      return newBox;
    });
  }, [transformerRef, selectedNodes, selectedBlockIds, blocks]);

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

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Get padding
    const padding = block.settings.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const paddingWidth = padding.left + padding.right;
    const paddingHeight = padding.top + padding.bottom;
    
    // Determine minimum sizes by block type (минимальный CONTENT size)
    let minWidth = 20;
    let minHeight = 20;
    
    switch (block.type) {
      case 'BUTTON':
        minWidth = 60;
        minHeight = 30;
        break;
      case 'CONTAINER':
      case 'GROUP':
      case 'GRID_CONTAINER':
      case 'FLEX_CONTAINER':
        minWidth = 100;
        minHeight = 100;
        break;
      case 'TEXT':
        minWidth = 50;
        minHeight = 20;
        break;
      case 'TABLE':
        minWidth = 200;
        minHeight = 100;
        break;
    }
    
    if (block.constraints) {
      minWidth = block.constraints.minWidth || minWidth;
      minHeight = block.constraints.minHeight || minHeight;
    }

    // Calculate NEW OUTER sizes from transform
    const newOuterWidth = node.width() * scaleX;
    const newOuterHeight = node.height() * scaleY;
    
    // Calculate NEW CONTENT sizes (subtract padding)
    const newContentWidth = Math.max(minWidth, newOuterWidth - paddingWidth);
    const newContentHeight = Math.max(minHeight, newOuterHeight - paddingHeight);

    // Update layout with CONTENT dimensions
    updateVisualLayout(blockId, {
      x: node.x(),
      y: node.y(),
      width: newContentWidth,
      height: newContentHeight,
    });

    // Reset scale to 1
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Close context menu
    setContextMenu(null);
    
    // Check if we clicked on empty space
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (!clickedOnEmpty) return;
    
    // Don't start marquee if panning or ctrl is held
    if (isPanning || e.evt.ctrlKey || e.evt.metaKey) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    // Transform to stage coordinates
    const transform = stage.getAbsoluteTransform().copy().invert();
    const stagePos = transform.point(pos);

    setMarqueeStart(stagePos);
    setMarqueeRect(null);
    setIsDraggingMarquee(false);
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!marqueeStart || isPanning) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform().copy().invert();
    const stagePos = transform.point(pos);

    // Check if mouse moved enough to start marquee
    const moved = Math.abs(stagePos.x - marqueeStart.x) > 5 || 
                  Math.abs(stagePos.y - marqueeStart.y) > 5;
    
    if (moved) {
      setIsDraggingMarquee(true);
    }

    setMarqueeRect({
      x: Math.min(marqueeStart.x, stagePos.x),
      y: Math.min(marqueeStart.y, stagePos.y),
      width: Math.abs(stagePos.x - marqueeStart.x),
      height: Math.abs(stagePos.y - marqueeStart.y),
    });
  };

  const handleStageMouseUp = () => {
    if (!marqueeStart) return;

    // If marquee was NOT dragged (just a click), clear selection
    if (!isDraggingMarquee) {
      selectBlock('');
      setMarqueeStart(null);
      setMarqueeRect(null);
      return;
    }

    if (marqueeRect && marqueeRect.width > 0 && marqueeRect.height > 0) {
      // Find blocks that intersect with marquee
      const selectedIds: string[] = [];
      
      rootBlocks.forEach(block => {
        const layout = visualLayout[block.id];
        if (!layout || block.hidden) return;

        // Check intersection
        const blockRight = layout.x + layout.width;
        const blockBottom = layout.y + layout.height;
        const marqueeRight = marqueeRect.x + marqueeRect.width;
        const marqueeBottom = marqueeRect.y + marqueeRect.height;

        const intersects = !(
          blockRight < marqueeRect.x ||
          layout.x > marqueeRight ||
          blockBottom < marqueeRect.y ||
          layout.y > marqueeBottom
        );

        if (intersects) {
          selectedIds.push(block.id);
        }
      });

      if (selectedIds.length > 0) {
        useVisualEditorStore.setState({ selectedBlockIds: selectedIds });
        toast.success(`Selected ${selectedIds.length} blocks`);
      }
    }

    // Don't clear selection here!
    setMarqueeStart(null);
    setMarqueeRect(null);
    setIsDraggingMarquee(false);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // IMPORTANT: Don't clear selection if was marquee drag!
    if (isDraggingMarquee) return;
    
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

          {/* Layer 2: Content Blocks (TEXT, RECTANGLE, CIRCLE, IMAGE, LINE) */}
          <Layer name="content">
            {rootBlocks
              .filter(b => ['TEXT', 'RECTANGLE', 'CIRCLE', 'IMAGE', 'LINE'].includes(b.type))
              .map(block => (
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

          {/* Layer 3: UI Elements (BUTTON, GROUP, CONTAINER) */}
          <Layer name="ui">
            {rootBlocks
              .filter(b => ['BUTTON', 'GROUP', 'CONTAINER', 'FLEX_CONTAINER', 'GRID_CONTAINER'].includes(b.type))
              .map(block => (
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

          {/* Layer 4: Tables (complex elements) */}
          <Layer name="tables">
            {rootBlocks
              .filter(b => b.type === 'TABLE')
              .map(block => (
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

          {/* Layer 5: Overlay (guides, marquee) */}
          <Layer name="overlay" listening={false}>
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
            {marqueeRect && (
              <Rect
                x={marqueeRect.x}
                y={marqueeRect.y}
                width={marqueeRect.width}
                height={marqueeRect.height}
                fill="rgba(59, 130, 246, 0.15)"
                stroke="rgba(59, 130, 246, 1)"
                strokeWidth={2 / stageScale}
                listening={false}
              />
            )}
          </Layer>

          {/* Layer 6: Transformer (needs to be on top) */}
          <Layer name="transformer">
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
