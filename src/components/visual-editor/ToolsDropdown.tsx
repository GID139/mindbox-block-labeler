import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wrench, AlignLeft, AlignCenterHorizontal, AlignRight, AlignVerticalJustifyStart, AlignCenterVertical, AlignVerticalJustifyEnd, StretchHorizontal, StretchVertical, Group, Ungroup, BringToFront, SendToBack } from 'lucide-react';
import { useVisualEditorStore } from '@/stores/visual-editor-store';

export function ToolsDropdown() {
  const { 
    selectedBlockIds, 
    alignSelectedBlocks, 
    distributeSelectedBlocks,
    bringToFront,
    sendToBack,
    blocks,
  } = useVisualEditorStore();
  
  const disabled = selectedBlockIds.length < 2;
  const canGroup = selectedBlockIds.length >= 2;
  
  // Check if selected block is a GROUP type for ungroup
  const findBlockById = (blocks: any[], id: string): any => {
    for (const block of blocks) {
      if (block.id === id) return block;
      if (block.children) {
        const found = findBlockById(block.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  
  const selectedBlock = selectedBlockIds.length === 1 ? findBlockById(blocks, selectedBlockIds[0]) : null;
  const canUngroup = selectedBlock?.type === 'GROUP';
  const hasSelection = selectedBlockIds.length > 0;

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
