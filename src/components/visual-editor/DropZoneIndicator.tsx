import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DropZoneIndicatorProps {
  id: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  blockId: string;
  parentId: string | null;
  index: number;
}

export function DropZoneIndicator({ id, position, blockId, parentId, index }: DropZoneIndicatorProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'drop-zone',
      position,
      blockId,
      parentId,
      index,
    },
  });

  const positionClasses = {
    top: 'absolute -top-1 left-0 right-0 h-2 cursor-n-resize',
    bottom: 'absolute -bottom-1 left-0 right-0 h-2 cursor-s-resize',
    left: 'absolute -left-1 top-0 bottom-0 w-2 cursor-w-resize',
    right: 'absolute -right-1 top-0 bottom-0 w-2 cursor-e-resize',
  };

  const activeIndicatorClasses = {
    top: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary',
    bottom: 'before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary',
    left: 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary',
    right: 'before:absolute before:right-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary',
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        positionClasses[position],
        'transition-all opacity-0 hover:opacity-100',
        isOver && 'opacity-100 bg-primary/10',
        isOver && activeIndicatorClasses[position]
      )}
    />
  );
}
