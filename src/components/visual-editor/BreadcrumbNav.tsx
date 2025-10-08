import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import { Button } from '@/components/ui/button';
import { Home, ChevronRight } from 'lucide-react';

export function BreadcrumbNav() {
  const { blocks, selectedBlockId, selectBlock } = useVisualEditorStore();

  if (!selectedBlockId) return null;

  const getPath = (
    blockId: string,
    tree: BlockInstance[],
    path: BlockInstance[] = []
  ): BlockInstance[] => {
    for (const block of tree) {
      if (block.id === blockId) return [...path, block];
      const found = getPath(blockId, block.children, [...path, block]);
      if (found.length > 0) return found;
    }
    return [];
  };

  const path = getPath(selectedBlockId, blocks);

  if (path.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-muted/50 rounded-lg mb-3 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => selectBlock(null)}
        className="h-7 px-2"
      >
        <Home className="h-3 w-3" />
      </Button>
      
      {path.map((block, i) => (
        <div key={block.id} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectBlock(block.id)}
            className={`h-7 px-2 text-xs ${
              i === path.length - 1 ? 'font-bold text-primary' : ''
            }`}
          >
            {block.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
