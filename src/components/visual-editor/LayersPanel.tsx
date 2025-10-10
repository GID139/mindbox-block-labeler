import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Layers,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { findBlockById } from '@/lib/visual-editor/coordinate-utils';

export function LayersPanel() {
  const { 
    blocks, 
    selectedBlockIds, 
    selectBlock, 
    toggleBlockSelection, 
    toggleLock, 
    toggleHide, 
    duplicateBlock, 
    removeBlock, 
    visualLayout,
    bringForward,
    sendBackward
  } = useVisualEditorStore();

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

  // Sort blocks by z-index (higher z-index = on top = first in list)
  const sortedBlocks = [...blocks].sort((a, b) => {
    const layoutA = visualLayout[a.id];
    const layoutB = visualLayout[b.id];
    const zIndexA = layoutA?.zIndex ?? 0;
    const zIndexB = layoutB?.zIndex ?? 0;
    return zIndexB - zIndexA; // Descending order
  });

  const moveLayerUp = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    bringForward(blockId);
  };

  const moveLayerDown = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sendBackward(blockId);
  };

  const renderBlock = (block: BlockInstance, index: number) => {
    const isSelected = selectedBlockIds.includes(block.id);
    const isTopmost = index === 0;
    const isBottommost = index === sortedBlocks.length - 1;

    return (
      <div key={block.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 hover:bg-accent/50 cursor-pointer rounded-sm group transition-colors",
            isSelected && "bg-primary/20 hover:bg-primary/30",
            block.hidden && "opacity-40"
          )}
          onClick={(e) => {
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
              toggleBlockSelection(block.id, true);
            } else {
              selectBlock(block.id);
            }
          }}
        >
          {/* Layer Number/Z-Index */}
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0 font-mono">
            {sortedBlocks.length - index}
          </Badge>

          {/* Icon & Name */}
          <span className="text-sm mr-1">{getBlockIcon(block.type)}</span>
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <span className="text-sm truncate">{block.name}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Move Layer Up */}
            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-accent rounded disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={(e) => moveLayerUp(block.id, e)}
              disabled={isTopmost}
              title="Переместить на один слой вверх"
            >
              <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {/* Move Layer Down */}
            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-accent rounded disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={(e) => moveLayerDown(block.id, e)}
              disabled={isBottommost}
              title="Переместить на один слой вниз"
            >
              <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

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
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col border-l">
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4" />
          <h3 className="font-semibold text-sm">Layers Order</h3>
        </div>
        <p className="text-[11px] text-muted-foreground">Top to bottom (front to back)</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {blocks.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No blocks yet. Add blocks from the library.
            </div>
          ) : (
            sortedBlocks.map((block, index) => renderBlock(block, index))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
