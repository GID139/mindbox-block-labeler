import { Button } from '@/components/ui/button';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import {
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignCenterVertical,
  AlignVerticalJustifyEnd,
  StretchHorizontal,
  StretchVertical,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AlignmentToolbar() {
  const { 
    selectedBlockIds, 
    alignSelectedBlocks, 
    distributeSelectedBlocks,
    visualLayout,
    updateVisualLayout,
    deviceMode
  } = useVisualEditorStore();
  const disabled = selectedBlockIds.length < 2;

  const deviceDimensions = {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  };

  const canvasWidth = deviceDimensions[deviceMode].width;
  const canvasHeight = deviceDimensions[deviceMode].height;

  const handleAlignToCanvas = (type: 'center-h' | 'center-v') => {
    selectedBlockIds.forEach(id => {
      const layout = visualLayout[id];
      if (!layout) return;

      if (type === 'center-h') {
        updateVisualLayout(id, { x: (canvasWidth - layout.width) / 2 });
      } else {
        updateVisualLayout(id, { y: (canvasHeight - layout.height) / 2 });
      }
    });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={disabled}
              onClick={() => alignSelectedBlocks('left')}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={disabled}
              onClick={() => alignSelectedBlocks('center')}
            >
              <AlignCenterHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={disabled}
              onClick={() => alignSelectedBlocks('right')}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={disabled}
              onClick={() => alignSelectedBlocks('top')}
            >
              <AlignVerticalJustifyStart className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Top</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={disabled}
              onClick={() => alignSelectedBlocks('middle')}
            >
              <AlignCenterVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Middle</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={disabled}
              onClick={() => alignSelectedBlocks('bottom')}
            >
              <AlignVerticalJustifyEnd className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Bottom</TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={selectedBlockIds.length < 3}
              onClick={() => distributeSelectedBlocks('horizontal')}
            >
              <StretchHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Distribute Horizontally</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={selectedBlockIds.length < 3}
              onClick={() => distributeSelectedBlocks('vertical')}
            >
              <StretchVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Distribute Vertically</TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={selectedBlockIds.length === 0}
              onClick={() => handleAlignToCanvas('center-h')}
            >
              Center H
            </Button>
          </TooltipTrigger>
          <TooltipContent>Center Horizontally on Canvas</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={selectedBlockIds.length === 0}
              onClick={() => handleAlignToCanvas('center-v')}
            >
              Center V
            </Button>
          </TooltipTrigger>
          <TooltipContent>Center Vertically on Canvas</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
