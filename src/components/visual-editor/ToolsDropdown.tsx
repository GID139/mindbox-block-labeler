import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wrench, AlignLeft, AlignCenterHorizontal, AlignRight, AlignVerticalJustifyStart, AlignCenterVertical, AlignVerticalJustifyEnd, StretchHorizontal, StretchVertical, BringToFront, SendToBack, Group, Ungroup } from 'lucide-react';
import { useVisualEditorStore } from '@/stores/visual-editor-store';

export function ToolsDropdown() {
  const { 
    selectedBlockIds, 
    blocks,
    alignSelectedBlocks, 
    distributeSelectedBlocks,
    bringToFront,
    sendToBack,
    groupSelectedBlocks,
    ungroupBlock,
  } = useVisualEditorStore();
  
  const disabled = selectedBlockIds.length < 2;
  const hasSelection = selectedBlockIds.length > 0;
  
  // Check if selected block is a GROUP
  const selectedBlock = selectedBlockIds.length === 1 
    ? blocks.find(b => b.id === selectedBlockIds[0])
    : null;
  const isGroupSelected = selectedBlock?.type === 'GROUP';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Wrench className="h-4 w-4" />
          Tools
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Alignment</DropdownMenuLabel>
        <DropdownMenuItem disabled={disabled} onClick={() => alignSelectedBlocks('left')}>
          <AlignLeft className="h-4 w-4 mr-2" />
          Align Left
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={() => alignSelectedBlocks('center')}>
          <AlignCenterHorizontal className="h-4 w-4 mr-2" />
          Align Center
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={() => alignSelectedBlocks('right')}>
          <AlignRight className="h-4 w-4 mr-2" />
          Align Right
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={() => alignSelectedBlocks('top')}>
          <AlignVerticalJustifyStart className="h-4 w-4 mr-2" />
          Align Top
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={() => alignSelectedBlocks('middle')}>
          <AlignCenterVertical className="h-4 w-4 mr-2" />
          Align Middle
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={() => alignSelectedBlocks('bottom')}>
          <AlignVerticalJustifyEnd className="h-4 w-4 mr-2" />
          Align Bottom
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Distribution</DropdownMenuLabel>
        <DropdownMenuItem disabled={selectedBlockIds.length < 3} onClick={() => distributeSelectedBlocks('horizontal')}>
          <StretchHorizontal className="h-4 w-4 mr-2" />
          Distribute Horizontally
        </DropdownMenuItem>
        <DropdownMenuItem disabled={selectedBlockIds.length < 3} onClick={() => distributeSelectedBlocks('vertical')}>
          <StretchVertical className="h-4 w-4 mr-2" />
          Distribute Vertically
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Arrange</DropdownMenuLabel>
        <DropdownMenuItem disabled={!hasSelection} onClick={() => hasSelection && bringToFront(selectedBlockIds[0])}>
          <BringToFront className="h-4 w-4 mr-2" />
          Bring to Front
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!hasSelection} onClick={() => hasSelection && sendToBack(selectedBlockIds[0])}>
          <SendToBack className="h-4 w-4 mr-2" />
          Send to Back
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Grouping</DropdownMenuLabel>
        <DropdownMenuItem 
          disabled={selectedBlockIds.length < 2} 
          onClick={() => {
            if (selectedBlockIds.length >= 2) {
              groupSelectedBlocks();
            }
          }}
        >
          <Group className="h-4 w-4 mr-2" />
          Group Selection (Ctrl+G)
        </DropdownMenuItem>
        <DropdownMenuItem 
          disabled={!isGroupSelected} 
          onClick={() => {
            if (selectedBlock && selectedBlock.type === 'GROUP') {
              ungroupBlock(selectedBlock.id);
            }
          }}
        >
          <Ungroup className="h-4 w-4 mr-2" />
          Ungroup (Ctrl+Shift+G)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
