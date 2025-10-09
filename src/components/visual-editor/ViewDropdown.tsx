import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Eye } from 'lucide-react';
import { useVisualEditorStore } from '@/stores/visual-editor-store';

export function ViewDropdown() {
  const {
    showGrid,
    showRulers,
    showMeasurements,
    showOutline,
    snapToGrid: snapToGridEnabled,
    snapToObjects: snapToObjectsEnabled,
    setShowGrid,
    setShowRulers,
    setShowMeasurements,
    setShowOutline,
    setSnapToGrid,
    setSnapToObjects,
  } = useVisualEditorStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Eye className="h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Display</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
          Grid
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showRulers} onCheckedChange={setShowRulers}>
          Rulers
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showMeasurements} onCheckedChange={setShowMeasurements}>
          Measurements
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showOutline} onCheckedChange={setShowOutline}>
          Outline
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Snapping</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={snapToGridEnabled} onCheckedChange={setSnapToGrid}>
          Snap to Grid
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={snapToObjectsEnabled} onCheckedChange={setSnapToObjects}>
          Snap to Objects
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
