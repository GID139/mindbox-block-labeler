import { useDroppable } from '@dnd-kit/core';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { CanvasBlock } from './CanvasBlock';
import { Card } from '@/components/ui/card';
import { generateHTML } from '@/lib/visual-editor/code-generator';
import { BreadcrumbNav } from './BreadcrumbNav';
import { EmptyState } from './EmptyState';

export function Canvas() {
  const { blocks, previewMode, canvasMode } = useVisualEditorStore();
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

  // Visual mode - coming soon
  if (canvasMode === 'visual') {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="min-h-[600px] bg-white p-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎨</div>
            <h3 className="text-lg font-semibold">Visual Mode</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Drag and resize blocks freely like in Figma. This feature is coming soon!
            </p>
            <p className="text-xs text-muted-foreground">
              For now, use Structure Mode to build your email templates.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <BreadcrumbNav />
      <Card
        ref={setNodeRef}
        className={`min-h-[600px] bg-white p-4 transition-all duration-200 ${
          isOver ? 'border-primary border-2 shadow-lg ring-4 ring-primary/20' : ''
        }`}
      >
        {blocks.length === 0 ? (
          <EmptyState />
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
