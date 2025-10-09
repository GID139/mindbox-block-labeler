import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronRight,
  Layers,
  Trash2,
  Copy
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { findBlockById, getChildren, getRootBlocks } from '@/lib/visual-editor/coordinate-utils';

export function LayersPanel() {
  const { blocks, selectedBlockIds, selectBlock, toggleBlockSelection, toggleLock, toggleHide, duplicateBlock, removeBlock } = useVisualEditorStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleExpand = (blockId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  };

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

  const getParentName = (parentId: string): string => {
    const parent = findBlockById(blocks, parentId);
    return parent?.name || 'Unknown';
  };

  const renderBlock = (block: BlockInstance, level: number = 0) => {
    const isSelected = selectedBlockIds.includes(block.id);
    const isExpanded = expandedGroups.has(block.id);
    const children = getChildren(blocks, block.id);
    const hasChildren = children.length > 0;

    return (
      <div key={block.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 hover:bg-accent/50 cursor-pointer rounded-sm group transition-colors",
            isSelected && "bg-primary/20 hover:bg-primary/30",
            block.hidden && "opacity-40"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={(e) => {
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
              toggleBlockSelection(block.id, true);
            } else {
              selectBlock(block.id);
            }
          }}
        >
          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              className="w-4 h-4 flex items-center justify-center hover:bg-accent rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(block.id);
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

          {/* Icon & Name with Parent Indicator */}
          <span className="text-sm mr-1">{getBlockIcon(block.type)}</span>
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <span className="text-sm truncate">{block.name}</span>
            {block.parentId && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0">
                ↳ {getParentName(block.parentId)}
              </Badge>
            )}
          </div>

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
            {children.map(child => renderBlock(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col border-l">
      <div className="p-3 border-b flex items-center gap-2">
        <Layers className="h-4 w-4" />
        <h3 className="font-semibold text-sm">Layers</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {blocks.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No blocks yet. Add blocks from the library.
            </div>
          ) : (
            getRootBlocks(blocks).map(block => renderBlock(block, 0))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
