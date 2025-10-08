import { useDraggable } from '@dnd-kit/core';
import { blockTemplates } from '@/lib/visual-editor/block-templates';
import { BlockTemplate } from '@/types/visual-editor';
import { Card } from '@/components/ui/card';

function BlockCard({ template }: { template: BlockTemplate }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: template.name,
    data: {
      type: 'library-block',
      templateName: template.name,
    },
  });

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 cursor-grab active:cursor-grabbing hover:border-primary transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{template.icon}</span>
        <div className="flex-1">
          <div className="font-medium text-sm">{template.name}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {template.category.toLowerCase()}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function BlockLibrary() {
  const basicBlocks = blockTemplates.filter(t => t.category === 'BASIC');
  const layoutBlocks = blockTemplates.filter(t => t.category === 'LAYOUT');
  const contentBlocks = blockTemplates.filter(t => t.category === 'CONTENT');

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Basic
        </h3>
        <div className="space-y-2">
          {basicBlocks.map(template => (
            <BlockCard key={template.name} template={template} />
          ))}
        </div>
      </div>

      {contentBlocks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Content
          </h3>
          <div className="space-y-2">
            {contentBlocks.map(template => (
              <BlockCard key={template.name} template={template} />
            ))}
          </div>
        </div>
      )}

      {layoutBlocks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Layout
          </h3>
          <div className="space-y-2">
            {layoutBlocks.map(template => (
              <BlockCard key={template.name} template={template} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
