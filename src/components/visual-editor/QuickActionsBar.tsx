import { Lock, Eye, Copy, Trash, Palette, ArrowUp, ArrowDown, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HexColorPicker } from 'react-colorful';
import { BlockInstance } from '@/types/visual-editor';

interface QuickActionsBarProps {
  block: BlockInstance;
  position: { x: number; y: number };
  stageScale: number;
}

export function QuickActionsBar({ block, position, stageScale }: QuickActionsBarProps) {
  const { updateBlock, duplicateBlock, removeBlock, bringToFront, sendToBack, moveUp, moveDown } = useVisualEditorStore();

  const showColorPicker = ['RECTANGLE', 'CIRCLE', 'BUTTON', 'TEXT'].includes(block.type);

  const getCurrentColor = () => {
    if (block.type === 'TEXT') {
      return block.settings.color || '#000000';
    }
    return block.settings.background?.color || '#3b82f6';
  };

  const handleColorChange = (color: string) => {
    if (block.type === 'TEXT') {
      updateBlock(block.id, { settings: { ...block.settings, color } });
    } else {
      updateBlock(block.id, {
        settings: {
          ...block.settings,
          background: { ...block.settings.background, color }
        }
      });
    }
  };

  return (
    <TooltipProvider>
      <div
        className="absolute flex gap-1 bg-card/95 backdrop-blur-sm border rounded-md shadow-xl p-1 z-50 animate-fade-in"
        style={{
          left: position.x,
          top: position.y + (10 / stageScale),
          transform: 'translateX(-50%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                updateBlock(block.id, { locked: !block.locked });
              }}
              className="h-8 w-8 p-0"
            >
              <Lock className={`h-4 w-4 ${block.locked ? 'fill-current' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{block.locked ? 'Unlock' : 'Lock'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                updateBlock(block.id, { hidden: !block.hidden });
              }}
              className="h-8 w-8 p-0"
            >
              <Eye className={`h-4 w-4 ${block.hidden ? 'opacity-50' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{block.hidden ? 'Show' : 'Hide'}</TooltipContent>
        </Tooltip>

        {showColorPicker && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                title="Change Color"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" onClick={(e) => e.stopPropagation()}>
              <HexColorPicker
                color={getCurrentColor()}
                onChange={handleColorChange}
              />
            </PopoverContent>
          </Popover>
        )}

        <div className="w-px h-6 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                bringToFront(block.id);
              }}
              className="h-8 w-8 p-0"
            >
              <MoveUp className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bring to Front</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                sendToBack(block.id);
              }}
              className="h-8 w-8 p-0"
            >
              <MoveDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send to Back</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                moveUp(block.id);
              }}
              className="h-8 w-8 p-0"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Move Up</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                moveDown(block.id);
              }}
              className="h-8 w-8 p-0"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Move Down</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                duplicateBlock(block.id);
              }}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicate</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                removeBlock(block.id);
              }}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
