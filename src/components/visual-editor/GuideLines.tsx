import { Guide } from '@/types/visual-editor';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuideLinesProps {
  guides: Guide[];
}

export function GuideLines({ guides }: GuideLinesProps) {
  const removeGuide = useVisualEditorStore(state => state.removeGuide);
  
  return (
    <>
      {guides.map((guide) => (
        <div
          key={guide.id}
          className="absolute group cursor-move pointer-events-none"
          style={{
            [guide.orientation === 'horizontal' ? 'top' : 'left']: `${guide.position}px`,
            [guide.orientation === 'horizontal' ? 'left' : 'top']: 0,
            [guide.orientation === 'horizontal' ? 'width' : 'height']: '100%',
            [guide.orientation === 'horizontal' ? 'height' : 'width']: '1px',
            backgroundColor: guide.color || 'hsl(var(--primary))',
            boxShadow: `0 0 4px ${guide.color || 'hsl(var(--primary))'}`,
            zIndex: 9996,
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-8 -top-3 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 pointer-events-auto"
            onClick={() => removeGuide(guide.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </>
  );
}
