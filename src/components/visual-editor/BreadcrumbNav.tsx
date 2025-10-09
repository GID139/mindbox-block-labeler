import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Button } from '@/components/ui/button';
import { Home, ChevronRight } from 'lucide-react';
import { getBlockPath } from '@/lib/visual-editor/coordinate-utils';

export function BreadcrumbNav() {
  const { blocks, selectedBlockIds, selectBlock } = useVisualEditorStore();

  const selectedBlockId = selectedBlockIds[0];

  if (!selectedBlockId) return null;

  const path = getBlockPath(blocks, selectedBlockId);

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
