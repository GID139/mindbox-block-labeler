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
  } = useVisualEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [selectedBlockIds, removeSelectedBlocks, undo, redo, duplicateBlock, saveProject]);
}