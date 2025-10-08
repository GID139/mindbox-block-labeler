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
    canvasMode,
  } = useVisualEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tool shortcuts (only in visual mode)
      if (canvasMode === 'visual' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockIds, removeSelectedBlocks, undo, redo, duplicateBlock, saveProject, setDrawingTool, canvasMode]);
}