import { Guide } from '@/types/visual-editor';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuideLinesProps {
  guides: Guide[];
  zoom: number;
}

export function GuideLines({ guides, zoom }: GuideLinesProps) {
  const removeGuide = useVisualEditorStore(state => state.removeGuide);
  
  return (
    <>
      {guides.map((guide) => (
        <div
          key={guide.id}
          className="absolute group cursor-move"
          style={{
            [guide.orientation === 'horizontal' ? 'top' : 'left']: `${guide.position * zoom / 100}px`,
            [guide.orientation === 'horizontal' ? 'left' : 'top']: 0,
            [guide.orientation === 'horizontal' ? 'width' : 'height']: '100%',
            [guide.orientation === 'horizontal' ? 'height' : 'width']: '1px',
            backgroundColor: guide.color || '#3b82f6',
            zIndex: 1000,
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-8 -top-3 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
            onClick={() => removeGuide(guide.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </>
  );
}
