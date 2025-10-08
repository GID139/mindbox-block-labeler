import { useDroppable } from '@dnd-kit/core';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { CanvasBlock } from './CanvasBlock';
import { Card } from '@/components/ui/card';
import { generateHTML } from '@/lib/visual-editor/code-generator';

export function Canvas() {
  const { blocks, previewMode } = useVisualEditorStore();
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    data: {
      type: 'canvas-root',
      parentId: null,
      index: blocks.length,
    },
  });

  if (previewMode) {
    const html = generateHTML(blocks);
    
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-6 bg-white">
          <iframe
            srcDoc={html}
            style={{
              width: '600px',
              height: '100%',
              minHeight: '400px',
              border: 'none',
            }}
            sandbox="allow-same-origin"
            title="Preview"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card
        ref={setNodeRef}
        className={`min-h-[600px] bg-white p-4 transition-colors ${
          isOver ? 'border-primary border-2' : ''
        }`}
      >
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Drag blocks from the library to start building
          </div>
        ) : (
          <div className="space-y-2">
            {blocks.map((block, index) => (
              <CanvasBlock key={block.id} block={block} index={index} parentId={null} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
