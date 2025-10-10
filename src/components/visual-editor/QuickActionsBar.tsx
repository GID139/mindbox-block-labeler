import { Lock, Eye, Copy, Trash, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import { BlockInstance } from '@/types/visual-editor';

interface QuickActionsBarProps {
  block: BlockInstance;
  position: { x: number; y: number };
  stageScale: number;
}

export function QuickActionsBar({ block, position, stageScale }: QuickActionsBarProps) {
  const { updateBlock, duplicateBlock, removeBlock } = useVisualEditorStore();

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
    <div
      className="absolute flex gap-1 bg-card/95 backdrop-blur-sm border rounded-md shadow-xl p-1 z-50 animate-fade-in"
      style={{
        left: position.x,
        top: position.y - (40 / stageScale),
        transform: 'translateX(-50%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          updateBlock(block.id, { locked: !block.locked });
        }}
        title={block.locked ? 'Unlock' : 'Lock'}
        className="h-8 w-8 p-0"
      >
        <Lock className={`h-4 w-4 ${block.locked ? 'fill-current' : ''}`} />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          updateBlock(block.id, { hidden: !block.hidden });
        }}
        title={block.hidden ? 'Show' : 'Hide'}
        className="h-8 w-8 p-0"
      >
        <Eye className={`h-4 w-4 ${block.hidden ? 'opacity-50' : ''}`} />
      </Button>

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

      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          duplicateBlock(block.id);
        }}
        title="Duplicate"
        className="h-8 w-8 p-0"
      >
        <Copy className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          removeBlock(block.id);
        }}
        title="Delete"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
