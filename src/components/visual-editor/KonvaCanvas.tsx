import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Group, Image as KonvaImage, Transformer } from 'react-konva';
import { useDroppable } from '@dnd-kit/core';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import Konva from 'konva';
import { getTemplate, getDefaultBlockSize } from '@/lib/visual-editor/block-templates';
import { toast } from 'sonner';
import { getChildren } from '@/lib/visual-editor/coordinate-utils';

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

const KonvaBlock = ({ block, isSelected, onSelect, onDragEnd, allBlocks }: KonvaBlockProps) => {
  const { visualLayout } = useVisualEditorStore();
  const layout = visualLayout[block.id];
  
  if (!layout) return null;

  const commonProps = {
    x: layout.x,
    y: layout.y,
    draggable: true,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => onSelect(e),
    onTap: (e: Konva.KonvaEventObject<MouseEvent>) => onSelect(e),
    onDragEnd: onDragEnd,
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
            listening={false}
          />
          {/* Render children */}
          {children.map(child => (
            <KonvaBlock
              key={child.id}
              block={child}
              isSelected={false}
              onSelect={onSelect}
              onDragEnd={onDragEnd}
              allBlocks={allBlocks}
            />
          ))}
        </Group>
      );

    default:
      return null;
  }
};

export function KonvaCanvas() {
  const {
    blocks,
    visualLayout,
    selectedBlockIds,
    selectBlock,
    toggleBlockSelection,
    updateVisualLayout,
    showGrid,
    gridSize,
    zoom,
    deviceMode,
  } = useVisualEditorStore();

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);

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

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const nodes: Konva.Node[] = [];
    const stage = stageRef.current;
    
    selectedBlockIds.forEach(id => {
      const node = stage.findOne(`#block-${id}`) as Konva.Node;
      if (node) nodes.push(node);
    });

    setSelectedNodes(nodes);
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedBlockIds]);

  const handleBlockSelect = (blockId: string, e?: Konva.KonvaEventObject<MouseEvent>) => {
    const isMultiSelect = e?.evt?.ctrlKey || e?.evt?.metaKey;
    
    if (isMultiSelect) {
      toggleBlockSelection(blockId, true);
    } else {
      selectBlock(blockId);
    }
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

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty area
    if (e.target === e.target.getStage()) {
      selectBlock('');
    }
  };

  // Filter root blocks only (blocks without parent)
  const rootBlocks = blocks.filter(b => !b.parentId);

  return (
    <div 
      ref={setNodeRef}
      className="relative w-full h-full flex items-center justify-center bg-muted/20"
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
          ref={stageRef}
          width={canvasWidth * zoom}
          height={canvasHeight * zoom}
          scaleX={zoom}
          scaleY={zoom}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* Grid */}
            {showGrid && (
              <>
                {Array.from({ length: Math.ceil(canvasWidth / gridSize) }).map((_, i) => (
                  <Line
                    key={`v-${i}`}
                    points={[i * gridSize, 0, i * gridSize, canvasHeight]}
                    stroke="hsl(214, 32%, 91%)"
                    strokeWidth={0.5 / zoom}
                    listening={false}
                  />
                ))}
                {Array.from({ length: Math.ceil(canvasHeight / gridSize) }).map((_, i) => (
                  <Line
                    key={`h-${i}`}
                    points={[0, i * gridSize, canvasWidth, i * gridSize]}
                    stroke="hsl(214, 32%, 91%)"
                    strokeWidth={0.5 / zoom}
                    listening={false}
                  />
                ))}
              </>
            )}

            {/* Render blocks */}
            {rootBlocks.map(block => (
              <Group key={block.id} id={`block-${block.id}`}>
                <KonvaBlock
                  block={block}
                  isSelected={selectedBlockIds.includes(block.id)}
                  onSelect={(e) => handleBlockSelect(block.id, e)}
                  onDragEnd={handleDragEnd(block.id)}
                  allBlocks={blocks}
                />
              </Group>
            ))}

            {/* Transformer for selected blocks */}
            <Transformer
              ref={transformerRef}
              onTransformEnd={handleTransformEnd}
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
        {canvasWidth} × {canvasHeight} | Zoom: {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
