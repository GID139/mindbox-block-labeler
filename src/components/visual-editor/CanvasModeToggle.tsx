import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVisualEditorStore } from '@/stores/visual-editor-store';

export type CanvasMode = 'structure' | 'visual';

export function CanvasModeToggle() {
  const canvasMode = useVisualEditorStore((state) => state.canvasMode);
  const setCanvasMode = useVisualEditorStore((state) => state.setCanvasMode);

  return (
    <Tabs value={canvasMode} onValueChange={(v) => setCanvasMode(v as CanvasMode)} className="w-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="structure" className="text-xs">
          🔗 Structure
        </TabsTrigger>
        <TabsTrigger value="visual" className="text-xs">
          🎨 Visual
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
