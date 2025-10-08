import { useDroppable } from '@dnd-kit/core';
import { BlockInstance } from '@/types/visual-editor';
import { CanvasBlock } from './CanvasBlock';
import { cn } from '@/lib/utils';

interface TableCellRendererProps {
  blockId: string;
  cellKey: string;
  children: BlockInstance[];
  settings: any;
  level: number;
}

export function TableCellRenderer({ blockId, cellKey, children, settings, level }: TableCellRendererProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${blockId}-cell-${cellKey}`,
    data: {
      type: 'table-cell',
      blockId,
      cellKey,
    },
  });

  return (
    <td
      ref={setNodeRef}
      className={cn(
        'border border-border min-h-[80px] relative transition-colors',
        isOver && 'bg-primary/10 border-primary border-2'
      )}
      style={{
        backgroundColor: settings?.background,
        verticalAlign: settings?.verticalAlign || 'top',
        padding: settings?.padding || '8px',
      }}
    >
      <div className="min-h-[60px]">
        {children.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs py-4">
            Drop blocks here
          </div>
        ) : (
          <div className="space-y-2">
            {children.map((child, index) => (
              <CanvasBlock
                key={child.id}
                block={child}
                index={index}
                parentId={blockId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
      
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary rounded pointer-events-none flex items-center justify-center">
          <span className="text-xs font-medium text-primary bg-background px-2 py-1 rounded">
            Drop here
          </span>
        </div>
      )}
    </td>
  );
}
