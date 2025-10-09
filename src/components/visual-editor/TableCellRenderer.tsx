import { useDroppable } from '@dnd-kit/core';
import { BlockInstance } from '@/types/visual-editor';
import { CanvasBlock } from './CanvasBlock';
import { cn } from '@/lib/utils';
import { useVisualEditorStore } from '@/stores/visual-editor-store';

interface TableCellRendererProps {
  blockId: string;
  cellKey: string;
  children: BlockInstance[];
  settings: any;
  level: number;
}

export function TableCellRenderer({ blockId, cellKey, children, settings, level }: TableCellRendererProps) {
  const { selectTableCell, selectedTableCell } = useVisualEditorStore();
  const { setNodeRef, isOver } = useDroppable({
    id: `${blockId}-cell-${cellKey}`,
    data: {
      type: 'table-cell',
      blockId,
      cellKey,
    },
  });

  const isSelected = selectedTableCell?.tableId === blockId && selectedTableCell?.cellKey === cellKey;

  return (
    <td
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        selectTableCell(blockId, cellKey);
      }}
      className={cn(
        'border border-border min-h-[80px] relative transition-all duration-200 cursor-pointer',
        isOver && 'bg-primary/10 border-primary border-2 shadow-inner',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{
        backgroundColor: settings?.background,
        verticalAlign: settings?.verticalAlign || 'top',
        padding: settings?.padding || '8px',
      }}
    >
      <div className="min-h-[60px]">
        {children.length === 0 ? (
          <div className={cn(
            "flex items-center justify-center h-full text-muted-foreground text-xs py-4 transition-all",
            isOver && "text-primary font-medium"
          )}>
            {isOver ? '📦 Drop here' : 'Drop blocks here'}
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
        <div className="absolute inset-0 border-2 border-dashed border-primary rounded pointer-events-none flex items-center justify-center animate-pulse">
          <span className="text-xs font-medium text-primary bg-white px-3 py-1 rounded-full shadow-md">
            Drop here
          </span>
        </div>
      )}
    </td>
  );
}
