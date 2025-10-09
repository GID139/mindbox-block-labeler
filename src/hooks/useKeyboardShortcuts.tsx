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
    cancelMarqueeSelection,
    isMarqueeSelecting,
    copySelectedBlocks,
    cutSelectedBlocks,
    paste,
    selectAll,
    toggleLock,
    toggleHide,
  } = useVisualEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'g' && selectedBlockIds.length >= 2) {
        e.preventDefault();
        groupBlocks(selectedBlockIds);
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockIds, removeSelectedBlocks, undo, redo, duplicateBlock, saveProject, setDrawingTool, groupBlocks, cancelMarqueeSelection, isMarqueeSelecting, copySelectedBlocks, cutSelectedBlocks, paste, selectAll, toggleLock, toggleHide]);
}