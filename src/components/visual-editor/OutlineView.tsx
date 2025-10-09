import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getTemplate } from '@/lib/visual-editor/block-templates';
import { useState } from 'react';
import { getChildren, getRootBlocks } from '@/lib/visual-editor/coordinate-utils';

export function OutlineView() {
  const { blocks, selectedBlockIds, selectBlock } = useVisualEditorStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (blocks: BlockInstance[], level = 0): JSX.Element[] => {
    return blocks.map(block => {
      const template = getTemplate(block.type);
      const children = getChildren(blocks, block.id);
      const hasChildren = children.length > 0;
      const isExpanded = expanded[block.id] !== false; // default to expanded
      const isSelected = selectedBlockIds.includes(block.id);

      return (
        <div key={block.id} className="space-y-1">
          <Button
            variant={isSelected ? 'secondary' : 'ghost'}
            className="w-full justify-start text-left h-auto py-1 px-2"
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => selectBlock(block.id)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(block.id);
                }}
                className="mr-1"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
            <span className="mr-2">{template.icon}</span>
            <span className="flex-1 text-xs truncate">{block.name}</span>
            {hasChildren && (
              <span className="text-xs text-muted-foreground ml-2">
                ({children.length})
              </span>
            )}
          </Button>
          {hasChildren && isExpanded && (
            <div>{renderTree(children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="p-3">
      <h3 className="text-sm font-semibold mb-2">Outline</h3>
      <div className="space-y-1">
        {blocks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No blocks yet
          </p>
        ) : (
          renderTree(getRootBlocks(blocks))
        )}
      </div>
    </Card>
  );
}