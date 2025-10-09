import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance } from '@/types/visual-editor';
import { 
  Copy, 
  Scissors, 
  Clipboard, 
  Trash2, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  MoveUp,
  MoveDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface BlockContextMenuProps {
  block?: BlockInstance;
  children: React.ReactNode;
}

export function BlockContextMenu({ block, children }: BlockContextMenuProps) {
  const {
    selectedBlockIds,
    copySelectedBlocks,
    cutSelectedBlocks,
    paste,
    removeSelectedBlocks,
    updateBlockSettings,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    duplicateBlock,
    clipboard,
  } = useVisualEditorStore();

  const isMultipleSelected = selectedBlockIds.length > 1;
  const hasClipboard = clipboard.length > 0;

  const handleCopy = () => {
    copySelectedBlocks();
  };

  const handleCut = () => {
    cutSelectedBlocks();
  };

  const handlePaste = () => {
    paste();
  };

  const handleDelete = () => {
    removeSelectedBlocks();
  };

  const handleDuplicate = () => {
    if (block) {
      duplicateBlock(block.id);
    }
  };

  const handleLock = () => {
    if (block) {
      updateBlockSettings(block.id, { locked: !block.locked });
    }
  };

  const handleHide = () => {
    if (block) {
      updateBlockSettings(block.id, { hidden: !block.hidden });
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCut}>
          <Scissors className="mr-2 h-4 w-4" />
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handlePaste} disabled={!hasClipboard}>
          <Clipboard className="mr-2 h-4 w-4" />
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate} disabled={isMultipleSelected}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <MoveUp className="mr-2 h-4 w-4" />
            Arrange
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => block && bringToFront(block.id)}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Bring to Front
              <ContextMenuShortcut>⌘]</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => block && bringForward(block.id)}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Bring Forward
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => block && sendBackward(block.id)}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Send Backward
            </ContextMenuItem>
            <ContextMenuItem onClick={() => block && sendToBack(block.id)}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Send to Back
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={handleLock}>
          {block?.locked ? (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              Unlock
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Lock
            </>
          )}
          <ContextMenuShortcut>⌘L</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={handleHide}>
          {block?.hidden ? (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Show
            </>
          ) : (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Hide
            </>
          )}
          <ContextMenuShortcut>⌘H</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
          <ContextMenuShortcut>⌦</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
