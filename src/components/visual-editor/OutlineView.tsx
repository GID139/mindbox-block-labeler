import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getTemplate } from '@/lib/visual-editor/block-templates';

export function OutlineView() {
  const { blocks, selectedBlockIds, selectBlock } = useVisualEditorStore();

  return (
    <Card className="p-3">
      <h3 className="text-sm font-semibold mb-2">Outline</h3>
      <div className="space-y-1">
        {blocks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No blocks yet
          </p>
        ) : (
          blocks.map(block => {
            const template = getTemplate(block.type);
            const isSelected = selectedBlockIds.includes(block.id);

            return (
              <Button
                key={block.id}
                variant={isSelected ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left h-auto py-1 px-2"
                onClick={() => selectBlock(block.id)}
              >
                <span className="mr-2">{template.icon}</span>
                <span className="flex-1 text-xs truncate">{block.name}</span>
              </Button>
            );
          })
        )}
      </div>
    </Card>
  );
}
