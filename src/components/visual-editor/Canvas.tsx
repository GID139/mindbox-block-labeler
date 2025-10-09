import { useDroppable } from '@dnd-kit/core';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { CanvasBlock } from './CanvasBlock';
import { Card } from '@/components/ui/card';
import { generateHTML } from '@/lib/visual-editor/code-generator';
import { BreadcrumbNav } from './BreadcrumbNav';
import { EmptyState } from './EmptyState';
import { BlockContextMenu } from './BlockContextMenu';

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <BreadcrumbNav />
      <BlockContextMenu>
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
      </BlockContextMenu>
    </div>
  );
}
