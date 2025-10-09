import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ZoomIn } from 'lucide-react';
import { useVisualEditorStore } from '@/stores/visual-editor-store';

export function ZoomDropdown() {
  const { zoom, setZoom } = useVisualEditorStore();

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 min-w-[80px]">
          <ZoomIn className="h-4 w-4" />
          {Math.round(zoom * 100)}%
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-32">
        {zoomLevels.map((level) => (
          <DropdownMenuItem
            key={level}
            onClick={() => setZoom(level / 100)}
            className={zoom === level / 100 ? 'bg-accent' : ''}
          >
            {level}%
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setZoom(1)}>
          Reset (100%)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
