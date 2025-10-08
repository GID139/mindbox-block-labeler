import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { getTemplate } from '@/lib/visual-editor/block-templates';

interface CanvasBlockProps {
  block: BlockInstance;
  index: number;
  parentId: string | null;
  level?: number;
}

export function CanvasBlock({ block, index, parentId, level = 0 }: CanvasBlockProps) {
  const { selectedBlockId, selectBlock, removeBlock } = useVisualEditorStore();
  const isSelected = selectedBlockId === block.id;
  
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: block.id,
    data: {
      type: 'canvas-block',
      block,
      parentId,
      index,
    },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${block.id}`,
    data: {
      type: 'canvas-drop',
      parentId: block.canContainChildren ? block.id : parentId,
      index: block.canContainChildren ? block.children.length : index + 1,
    },
    disabled: !block.canContainChildren || level >= block.maxNestingLevel,
  });

  const template = getTemplate(block.type);

  return (
    <div
      ref={setDropRef}
      className={`relative group ${isDragging ? 'opacity-50' : ''}`}
    >
      <div
        ref={setDragRef}
        onClick={() => selectBlock(block.id)}
        className={`border rounded p-3 transition-all cursor-pointer ${
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        } ${isOver && block.canContainChildren ? 'ring-2 ring-primary' : ''}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <span className="text-lg">{template.icon}</span>
          
          <div className="flex-1">
            <div className="font-medium text-sm">{block.name}</div>
            <div className="text-xs text-muted-foreground">{template.name}</div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(block.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Render children if any */}
        {block.children && block.children.length > 0 && (
          <div className="ml-6 mt-2 space-y-2 border-l-2 border-border pl-3">
            {block.children.map((child, childIndex) => (
              <CanvasBlock
                key={child.id}
                block={child}
                index={childIndex}
                parentId={block.id}
                level={level + 1}
              />
            ))}
          </div>
        )}

        {/* Show drop zone indicator for containers */}
        {isOver && block.canContainChildren && (
          <div className="mt-2 p-2 border-2 border-dashed border-primary rounded bg-primary/5 text-center text-sm text-primary">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
