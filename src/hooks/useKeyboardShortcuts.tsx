import { useEffect } from 'react';
import { useVisualEditorStore } from '@/stores/visual-editor-store';

export function useKeyboardShortcuts() {
  const {
    selectedBlockIds,
    removeSelectedBlocks,
    undo,
    redo,
    duplicateBlock,
    saveProject,
    setDrawingTool,
    groupBlocks,
    ungroupBlock,
    cancelMarqueeSelection,
    isMarqueeSelecting,
    copySelectedBlocks,
    cutSelectedBlocks,
    paste,
    selectAll,
    toggleLock,
    toggleHide,
    blocks,
  } = useVisualEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if canvas is focused
      const activeElement = document.activeElement;
      const isCanvasFocused = activeElement?.closest('[data-canvas-container]');
      
      if (!isCanvasFocused) return; // Ignore shortcuts if canvas not focused
      
      // Tool shortcuts (only in visual mode)
      if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
        if (e.key === 'v' || e.key === 'V') {
          e.preventDefault();
          setDrawingTool('select');
          return;
        }
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          setDrawingTool('rectangle');
          return;
        }
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          setDrawingTool('circle');
          return;
        }
        if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          setDrawingTool('line');
          return;
        }
      }

      // Escape - cancel marquee selection
      if (e.key === 'Escape') {
        if (isMarqueeSelecting) {
          e.preventDefault();
          cancelMarqueeSelection();
        }
      }

      // Delete
      if (e.key === 'Delete' && selectedBlockIds.length > 0) {
        e.preventDefault();
        removeSelectedBlocks();
      }

      // Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
      
      // Toggle Rulers
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        const { showRulers, setShowRulers } = useVisualEditorStore.getState();
        setShowRulers(!showRulers);
      }

      // Duplicate
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedBlockIds.length === 1) {
        e.preventDefault();
        duplicateBlock(selectedBlockIds[0]);
      }

      // Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }

      // Group blocks
      if ((e.metaKey || e.ctrlKey) && e.key === 'g' && !e.shiftKey && selectedBlockIds.length >= 2) {
        e.preventDefault();
        groupBlocks(selectedBlockIds);
      }
      
      // Ungroup block
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'g' && selectedBlockIds.length === 1) {
        e.preventDefault();
        const block = blocks.find(b => selectedBlockIds.includes(b.id));
        if (block?.type === 'GROUP') {
          ungroupBlock(block.id);
        }
      }
      
      // Copy
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedBlockIds.length > 0) {
        e.preventDefault();
        copySelectedBlocks();
      }
      
      // Cut
      if ((e.metaKey || e.ctrlKey) && e.key === 'x' && selectedBlockIds.length > 0) {
        e.preventDefault();
        cutSelectedBlocks();
      }
      
      // Paste
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        paste();
      }
      
      // Select All
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }
      
      // Lock/Unlock
      if ((e.metaKey || e.ctrlKey) && e.key === 'l' && selectedBlockIds.length === 1) {
        e.preventDefault();
        toggleLock(selectedBlockIds[0]);
      }
      
      // Hide/Show
      if ((e.metaKey || e.ctrlKey) && e.key === 'h' && selectedBlockIds.length === 1) {
        e.preventDefault();
        toggleHide(selectedBlockIds[0]);
      }

      // Zoom In
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        const { zoom, setZoom } = useVisualEditorStore.getState();
        setZoom(Math.min(4, zoom * 1.2));
      }

      // Zoom Out
      if ((e.metaKey || e.ctrlKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        const { zoom, setZoom } = useVisualEditorStore.getState();
        setZoom(Math.max(0.25, zoom / 1.2));
      }

      // Zoom to 100%
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        const { setZoom } = useVisualEditorStore.getState();
        setZoom(1);
      }

      // Arrow keys for precise movement
      if (e.key.startsWith('Arrow') && selectedBlockIds.length > 0 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const { visualLayout, updateVisualLayout } = useVisualEditorStore.getState();

        selectedBlockIds.forEach(id => {
          const layout = visualLayout[id];
          if (!layout) return;

          let deltaX = 0, deltaY = 0;
          if (e.key === 'ArrowLeft') deltaX = -step;
          if (e.key === 'ArrowRight') deltaX = step;
          if (e.key === 'ArrowUp') deltaY = -step;
          if (e.key === 'ArrowDown') deltaY = step;

          updateVisualLayout(id, {
            x: layout.x + deltaX,
            y: layout.y + deltaY,
          });
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockIds, removeSelectedBlocks, undo, redo, duplicateBlock, saveProject, setDrawingTool, groupBlocks, ungroupBlock, cancelMarqueeSelection, isMarqueeSelecting, copySelectedBlocks, cutSelectedBlocks, paste, selectAll, toggleLock, toggleHide, blocks]);
}