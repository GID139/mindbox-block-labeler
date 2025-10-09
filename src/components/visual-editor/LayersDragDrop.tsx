import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronRight,
  Layers,
  Trash2,
  Copy,
  GripVertical
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { getChildren, getRootBlocks, findBlockById } from '@/lib/visual-editor/coordinate-utils';

function DraggableLayerItem({ block, level, isSelected, onSelect }: {
  block: BlockInstance;
  level: number;
  isSelected: boolean;
  onSelect: (id: string, isMulti: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { toggleLock, toggleHide, duplicateBlock, removeBlock, blocks } = useVisualEditorStore();
  const children = getChildren(blocks, block.id);
  const hasChildren = children.length > 0;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    data: { block, type: 'layer-item' },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${block.id}`,
    data: { blockId: block.id, type: 'layer-drop' },
  });

  const getBlockIcon = (type: BlockInstance['type']) => {
    switch (type) {
      case 'TEXT': return '📝';
      case 'BUTTON': return '🔘';
      case 'IMAGE': return '📷';
      case 'CONTAINER': return '🎨';
      case 'TABLE': return '📊';
      case 'RECTANGLE': return '▭';
      case 'CIRCLE': return '⭕';
      case 'LINE': return '➖';
      case 'GROUP': return '📦';
      default: return '📦';
    }
  };

  return (
    <div ref={setDropRef}>
      <div
        ref={setNodeRef}
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 hover:bg-accent/50 cursor-pointer rounded-sm group transition-colors",
          isSelected && "bg-primary/20 hover:bg-primary/30",
          block.hidden && "opacity-40",
          isDragging && "opacity-50",
          isOver && "bg-accent"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={(e) => {
          if (e.shiftKey || e.ctrlKey || e.metaKey) {
            onSelect(block.id, true);
          } else {
            onSelect(block.id, false);
          }
        }}
      >
        {/* Drag Handle */}
        <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {/* Expand/Collapse */}
        {hasChildren && (
          <button
            className="w-4 h-4 flex items-center justify-center hover:bg-accent rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

        {/* Icon & Name */}
        <span className="text-sm mr-1">{getBlockIcon(block.type)}</span>
        <span className="text-sm flex-1 truncate">{block.name}</span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-accent rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleHide(block.id);
            }}
            title={block.hidden ? 'Show' : 'Hide'}
          >
            {block.hidden ? (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-accent rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleLock(block.id);
            }}
            title={block.locked ? 'Unlock' : 'Lock'}
          >
            {block.locked ? (
              <Lock className="h-3.5 w-3.5 text-destructive" />
            ) : (
              <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-accent rounded"
            onClick={(e) => {
              e.stopPropagation();
              duplicateBlock(block.id);
            }}
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-destructive/20 rounded"
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(block.id);
            }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {children.map(child => (
            <DraggableLayerItem
              key={child.id}
              block={child}
              level={level + 1}
              isSelected={false}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LayersPanelWithDragDrop() {
  const { blocks, selectedBlockIds, selectBlock, toggleBlockSelection, moveBlock } = useVisualEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const draggedId = active.id as string;
    const targetData = over.data.current;

    if (targetData?.type === 'layer-drop') {
      const targetId = targetData.blockId;
      // Get children count of target block
      const targetChildren = getChildren(blocks, targetId);
      const insertIndex = targetChildren.length;
      moveBlock(draggedId, targetId, insertIndex);
    } else if (targetData?.type === 'layer-root') {
      // Move to root level at the end
      const rootBlocks = getRootBlocks(blocks);
      moveBlock(draggedId, null, rootBlocks.length);
    }
  };

  const { setNodeRef: setRootRef } = useDroppable({
    id: 'layer-root',
    data: { type: 'layer-root' },
  });

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col border-l">
        <div className="p-3 border-b flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <h3 className="font-semibold text-sm">Layers</h3>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2" ref={setRootRef}>
            {blocks.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No blocks yet. Add blocks from the library.
              </div>
            ) : (
            getRootBlocks(blocks).map(block => (
              <DraggableLayerItem
                key={block.id}
                block={block}
                level={0}
                isSelected={selectedBlockIds.includes(block.id)}
                onSelect={(id, isMulti) => {
                  if (isMulti) {
                    toggleBlockSelection(id, true);
                  } else {
                    selectBlock(id);
                  }
                }}
              />
            ))
            )}
          </div>
        </ScrollArea>
      </div>
    </DndContext>
  );
}