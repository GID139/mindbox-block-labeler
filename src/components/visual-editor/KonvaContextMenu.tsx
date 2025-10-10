import { useEffect } from 'react';
import { Copy, Trash, Lock, Eye, MoveUp, MoveDown, Group } from 'lucide-react';
import { useVisualEditorStore } from '@/stores/visual-editor-store';

interface KonvaContextMenuProps {
  x: number;
  y: number;
  blockId: string | null;
  onClose: () => void;
}

export function KonvaContextMenu({ x, y, blockId, onClose }: KonvaContextMenuProps) {
  const {
    copySelectedBlocks,
    removeBlock,
    duplicateBlock,
    toggleLock,
    toggleHide,
    bringToFront,
    sendToBack,
    groupBlocks,
    selectedBlockIds,
    blocks,
  } = useVisualEditorStore();

  useEffect(() => {
    const handleClick = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!blockId) return null;

  const block = blocks.find(b => b.id === blockId);
  if (!block) return null;

  const handleMenuClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    onClose();
  };

  return (
    <div
      className="fixed z-50 min-w-[180px] bg-card border rounded-md shadow-xl p-1"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="py-1.5 px-3 hover:bg-accent cursor-pointer rounded-sm flex items-center gap-2 text-sm"
        onClick={(e) => handleMenuClick(e, () => copySelectedBlocks())}
      >
        <Copy className="w-4 h-4" />
        Copy
      </div>
      
      <div
        className="py-1.5 px-3 hover:bg-accent cursor-pointer rounded-sm flex items-center gap-2 text-sm"
        onClick={(e) => handleMenuClick(e, () => duplicateBlock(blockId))}
      >
        <Copy className="w-4 h-4" />
        Duplicate
      </div>

      <div className="h-px bg-border my-1" />

      <div
        className="py-1.5 px-3 hover:bg-accent cursor-pointer rounded-sm flex items-center gap-2 text-sm"
        onClick={(e) => handleMenuClick(e, () => removeBlock(blockId))}
      >
        <Trash className="w-4 h-4 text-destructive" />
        <span className="text-destructive">Delete</span>
      </div>

      <div className="h-px bg-border my-1" />

      <div
        className="py-1.5 px-3 hover:bg-accent cursor-pointer rounded-sm flex items-center gap-2 text-sm"
        onClick={(e) => handleMenuClick(e, () => toggleLock(blockId))}
      >
        <Lock className="w-4 h-4" />
        {block.locked ? 'Unlock' : 'Lock'}
      </div>

      <div
        className="py-1.5 px-3 hover:bg-accent cursor-pointer rounded-sm flex items-center gap-2 text-sm"
        onClick={(e) => handleMenuClick(e, () => toggleHide(blockId))}
      >
        <Eye className="w-4 h-4" />
        {block.hidden ? 'Show' : 'Hide'}
      </div>

      <div className="h-px bg-border my-1" />

      <div
        className="py-1.5 px-3 hover:bg-accent cursor-pointer rounded-sm flex items-center gap-2 text-sm"
        onClick={(e) => handleMenuClick(e, () => bringToFront(blockId))}
      >
        <MoveUp className="w-4 h-4" />
        Bring to Front
      </div>

      <div
        className="py-1.5 px-3 hover:bg-accent cursor-pointer rounded-sm flex items-center gap-2 text-sm"
        onClick={(e) => handleMenuClick(e, () => sendToBack(blockId))}
      >
        <MoveDown className="w-4 h-4" />
        Send to Back
      </div>

      {selectedBlockIds.length >= 2 && (
        <>
          <div className="h-px bg-border my-1" />
          <div
            className="py-1.5 px-3 hover:bg-accent cursor-pointer rounded-sm flex items-center gap-2 text-sm"
            onClick={(e) => handleMenuClick(e, () => groupBlocks(selectedBlockIds))}
          >
            <Group className="w-4 h-4" />
            Group Selection
          </div>
        </>
      )}
    </div>
  );
}
