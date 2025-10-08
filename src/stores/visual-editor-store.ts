import { create } from 'zustand';
import { BlockInstance } from '@/types/visual-editor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GlobalStyles {
  defaultFont: 'Arial' | 'Helvetica' | 'Roboto' | 'Open Sans' | 'Montserrat';
  defaultFontSize: number;
  defaultTextColor: string;
  defaultBackgroundColor: string;
  defaultPadding: number;
  defaultButtonColor: string;
}

export interface VisualLayout {
  [blockId: string]: {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
  };
}

interface HistoryState {
  past: BlockInstance[][];
  present: BlockInstance[];
  future: BlockInstance[][];
}

interface VisualEditorState {
  // Project
  currentProjectId: string | null;
  projectName: string;
  
  // Canvas
  blocks: BlockInstance[];
  selectedBlockIds: string[];
  canvasMode: 'structure' | 'visual';
  visualLayout: VisualLayout;
  
  // Global styles
  globalStyles: GlobalStyles;
  
  // UI
  previewMode: 'editor' | 'html' | 'with-data';
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  showGrid: boolean;
  gridSize: number;
  zoom: number;
  deviceMode: 'mobile' | 'tablet' | 'desktop';
  showOutline: boolean;
  
  // History
  canUndo: boolean;
  canRedo: boolean;
  
  // Actions
  setProjectName: (name: string) => void;
  setCanvasMode: (mode: 'structure' | 'visual') => void;
  addBlock: (block: BlockInstance, parentId?: string, index?: number) => void;
  removeBlock: (id: string) => void;
  removeSelectedBlocks: () => void;
  updateBlock: (id: string, updates: Partial<BlockInstance>) => void;
  moveBlock: (draggedId: string, targetId: string | null, index: number) => void;
  selectBlock: (id: string | null) => void;
  toggleBlockSelection: (id: string, isMulti: boolean) => void;
  clearSelection: () => void;
  toggleSetting: (blockId: string, settingKey: string) => void;
  updateSetting: (blockId: string, settingKey: string, value: any) => void;
  duplicateBlock: (id: string) => void;
  
  // Global styles
  setGlobalStyles: (styles: Partial<GlobalStyles>) => void;
  
  // Visual mode
  updateVisualLayout: (blockId: string, layout: Partial<VisualLayout[string]>) => void;
  
  // UI controls
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setDeviceMode: (mode: 'mobile' | 'tablet' | 'desktop') => void;
  setShowOutline: (show: boolean) => void;
  
  // Table-specific actions
  addBlockToTableCell: (tableId: string, cellKey: string, block: BlockInstance) => void;
  updateTableSize: (tableId: string, dimension: 'rows' | 'cols', delta: number) => void;
  updateCellSetting: (tableId: string, cellKey: string, settingKey: string, value: any) => void;
  
  // Preview
  togglePreviewMode: () => void;
  setPreviewMode: (mode: 'editor' | 'html' | 'with-data') => void;
  
  // History
  undo: () => void;
  redo: () => void;
  
  // Code generation
  generateCode: () => { html: string; json: string };
  
  // Persistence
  saveProject: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  createNewProject: (name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  listProjects: () => Promise<any[]>;
  
  // Utility
  reset: () => void;
  
  // Sync
  syncLayoutToStructure: () => void;
  syncStructureToLayout: () => void;
}

const findBlockById = (blocks: BlockInstance[], id: string): BlockInstance | null => {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children.length > 0) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
  }
  return null;
};

const updateBlockInTree = (blocks: BlockInstance[], id: string, updates: Partial<BlockInstance>): BlockInstance[] => {
  return blocks.map(block => {
    if (block.id === id) {
      return { ...block, ...updates };
    }
    if (block.children.length > 0) {
      return {
        ...block,
        children: updateBlockInTree(block.children, id, updates),
      };
    }
    return block;
  });
};

const removeBlockFromTree = (blocks: BlockInstance[], id: string): BlockInstance[] => {
  return blocks.filter(block => {
    if (block.id === id) return false;
    if (block.children.length > 0) {
      block.children = removeBlockFromTree(block.children, id);
    }
    return true;
  });
};

const addBlockToTree = (blocks: BlockInstance[], parentId: string | null, newBlock: BlockInstance, index?: number): BlockInstance[] => {
  if (parentId === null) {
    // Add to root
    if (index !== undefined) {
      const copy = [...blocks];
      copy.splice(index, 0, newBlock);
      return copy;
    }
    return [...blocks, newBlock];
  }
  
  return blocks.map(block => {
    if (block.id === parentId) {
      const children = [...block.children];
      if (index !== undefined) {
        children.splice(index, 0, newBlock);
      } else {
        children.push(newBlock);
      }
      return { ...block, children };
    }
    if (block.children.length > 0) {
      return {
        ...block,
        children: addBlockToTree(block.children, parentId, newBlock, index),
      };
    }
    return block;
  });
};

export const useVisualEditorStore = create<VisualEditorState>((set, get) => {
  let history: HistoryState = {
    past: [],
    present: [],
    future: [],
  };

  const pushHistory = () => {
    const blocks = get().blocks;
    history = {
      past: [...history.past, history.present],
      present: blocks,
      future: [],
    };
    set({ canUndo: history.past.length > 0, canRedo: false });
  };

  return {
    // Initial state
    currentProjectId: null,
    projectName: 'Untitled Project',
    blocks: [],
    selectedBlockIds: [],
    canvasMode: 'structure',
    visualLayout: {},
    globalStyles: {
      defaultFont: 'Arial',
      defaultFontSize: 14,
      defaultTextColor: '#000000',
      defaultBackgroundColor: '#FFFFFF',
      defaultPadding: 10,
      defaultButtonColor: '#39AA5D',
    },
    previewMode: 'editor',
    isLoading: false,
    isSaving: false,
    lastSavedAt: null,
    showGrid: true,
    gridSize: 10,
    zoom: 100,
    deviceMode: 'desktop',
    showOutline: false,
    canUndo: false,
    canRedo: false,
    
    // Actions
    setProjectName: (name) => set({ projectName: name }),
    setCanvasMode: (mode) => {
      const store = get();
      if (mode === 'visual') {
        store.syncStructureToLayout();
      } else if (mode === 'structure') {
        store.syncLayoutToStructure();
      }
      set({ canvasMode: mode });
    },
    
    addBlock: (block, parentId, index) => {
      pushHistory();
      set(state => ({
        blocks: addBlockToTree(state.blocks, parentId || null, block, index),
      }));
    },
    
    removeBlock: (id) => {
      pushHistory();
      set(state => ({
        blocks: removeBlockFromTree(state.blocks, id),
        selectedBlockIds: state.selectedBlockIds.filter(bid => bid !== id),
      }));
    },
    
    removeSelectedBlocks: () => {
      pushHistory();
      let blocks = get().blocks;
      get().selectedBlockIds.forEach(id => {
        blocks = removeBlockFromTree(blocks, id);
      });
      set({ blocks, selectedBlockIds: [] });
    },
    
    updateBlock: (id, updates) => {
      pushHistory();
      set(state => ({
        blocks: updateBlockInTree(state.blocks, id, updates),
      }));
    },
    
    moveBlock: (draggedId, targetId, index) => {
      pushHistory();
      const { blocks } = get();
      const draggedBlock = findBlockById(blocks, draggedId);
      if (!draggedBlock) return;
      
      // Validate: Cannot move block into itself
      if (draggedId === targetId) {
        toast.error('Cannot move block into itself');
        return;
      }
      
      // Validate: Cannot move block into its descendant
      const isDescendant = (possibleDescendantId: string | null): boolean => {
        if (!possibleDescendantId) return false;
        
        const checkChildren = (children: BlockInstance[]): boolean => {
          return children.some(child => 
            child.id === possibleDescendantId || checkChildren(child.children)
          );
        };
        
        return checkChildren(draggedBlock.children);
      };
      
      if (isDescendant(targetId)) {
        toast.error('Cannot move block into its descendant');
        return;
      }
      
      // Remove from old position
      let newBlocks = removeBlockFromTree(blocks, draggedId);
      // Add to new position
      newBlocks = addBlockToTree(newBlocks, targetId, draggedBlock, index);
      
      set({ blocks: newBlocks });
    },
    
    selectBlock: (id) => set({ selectedBlockIds: id ? [id] : [] }),
    
    toggleBlockSelection: (id, isMulti) => {
      const current = get().selectedBlockIds;
      if (isMulti) {
        if (current.includes(id)) {
          set({ selectedBlockIds: current.filter(x => x !== id) });
        } else {
          set({ selectedBlockIds: [...current, id] });
        }
      } else {
        set({ selectedBlockIds: [id] });
      }
    },
    
    clearSelection: () => set({ selectedBlockIds: [] }),
    
    toggleSetting: (blockId, settingKey) => {
      const block = findBlockById(get().blocks, blockId);
      if (!block) return;
      
      const currentValue = block.settings[settingKey];
      get().updateBlock(blockId, {
        settings: {
          ...block.settings,
          [settingKey]: !currentValue,
        },
      });
    },
    
    updateSetting: (blockId, settingKey, value) => {
      const block = findBlockById(get().blocks, blockId);
      if (!block) return;
      
      get().updateBlock(blockId, {
        settings: {
          ...block.settings,
          [settingKey]: value,
        },
      });
    },
    
    duplicateBlock: (id) => {
      pushHistory();
      const blocks = get().blocks;
      const block = findBlockById(blocks, id);
      if (!block) return;

      const duplicated: BlockInstance = {
        ...JSON.parse(JSON.stringify(block)),
        id: crypto.randomUUID(),
        name: `${block.name}_copy`,
      };

      // Find parent and index
      const findParentAndIndex = (blocks: BlockInstance[], targetId: string, parentId: string | null = null): { parentId: string | null; index: number } | null => {
        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].id === targetId) {
            return { parentId, index: i };
          }
          if (blocks[i].children.length > 0) {
            const result = findParentAndIndex(blocks[i].children, targetId, blocks[i].id);
            if (result) return result;
          }
        }
        return null;
      };

      const location = findParentAndIndex(blocks, id);
      if (location) {
        get().addBlock(duplicated, location.parentId || undefined, location.index + 1);
      }
    },
    
    setGlobalStyles: (styles) => set({ globalStyles: { ...get().globalStyles, ...styles } }),
    
    updateVisualLayout: (blockId, layout) => {
      const current = get().visualLayout[blockId] || { x: 0, y: 0, width: 600, height: 100, zIndex: 0 };
      set({
        visualLayout: {
          ...get().visualLayout,
          [blockId]: { ...current, ...layout },
        },
      });
    },
    
    setShowGrid: (show) => set({ showGrid: show }),
    setGridSize: (size) => set({ gridSize: size }),
    setZoom: (zoom) => set({ zoom }),
    setDeviceMode: (mode) => set({ deviceMode: mode }),
    setShowOutline: (show) => set({ showOutline: show }),
    
    addBlockToTableCell: (tableId, cellKey, block) => {
      const table = findBlockById(get().blocks, tableId);
      if (!table || table.type !== 'TABLE') return;
      
      const cells = { ...table.settings.cells };
      const cell = cells[cellKey] || { children: [], settings: {} };
      
      cells[cellKey] = {
        ...cell,
        children: [...(cell.children || []), block],
      };
      
      get().updateBlock(tableId, {
        settings: {
          ...table.settings,
          cells,
        },
      });
    },
    
    updateTableSize: (tableId, dimension, delta) => {
      const table = findBlockById(get().blocks, tableId);
      if (!table || table.type !== 'TABLE') return;
      
      const currentRows = table.settings.rows || 2;
      const currentCols = table.settings.cols || 2;
      const cells = { ...table.settings.cells };
      
      if (dimension === 'rows') {
        const newRows = Math.max(1, currentRows + delta);
        
        // If adding rows, initialize new cells
        if (delta > 0) {
          for (let row = currentRows; row < newRows; row++) {
            for (let col = 0; col < currentCols; col++) {
              const cellKey = `${row},${col}`;
              if (!cells[cellKey]) {
                cells[cellKey] = {
                  children: [],
                  settings: { verticalAlign: 'top', padding: '8px' },
                };
              }
            }
          }
        }
        
        get().updateBlock(tableId, {
          settings: {
            ...table.settings,
            rows: newRows,
            cells,
          },
        });
      } else if (dimension === 'cols') {
        const newCols = Math.max(1, currentCols + delta);
        
        // If adding cols, initialize new cells
        if (delta > 0) {
          for (let row = 0; row < currentRows; row++) {
            for (let col = currentCols; col < newCols; col++) {
              const cellKey = `${row},${col}`;
              if (!cells[cellKey]) {
                cells[cellKey] = {
                  children: [],
                  settings: { verticalAlign: 'top', padding: '8px' },
                };
              }
            }
          }
        }
        
        get().updateBlock(tableId, {
          settings: {
            ...table.settings,
            cols: newCols,
            cells,
          },
        });
      }
    },
    
    updateCellSetting: (tableId, cellKey, settingKey, value) => {
      const table = findBlockById(get().blocks, tableId);
      if (!table || table.type !== 'TABLE') return;
      
      const cells = { ...table.settings.cells };
      const cell = cells[cellKey] || { children: [], settings: {} };
      
      cells[cellKey] = {
        ...cell,
        settings: {
          ...cell.settings,
          [settingKey]: value,
        },
      };
      
      get().updateBlock(tableId, {
        settings: {
          ...table.settings,
          cells,
        },
      });
    },
    
    togglePreviewMode: () => {
      set((state) => ({
        previewMode: state.previewMode === 'editor' ? 'html' : 'editor',
      }));
    },
    
    setPreviewMode: (mode) => set({ previewMode: mode }),
    
    undo: () => {
      if (history.past.length === 0) return;
      
      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, -1);
      
      history = {
        past: newPast,
        present: previous,
        future: [history.present, ...history.future],
      };
      
      set({ 
        blocks: previous,
        canUndo: newPast.length > 0,
        canRedo: true,
      });
    },

    redo: () => {
      if (history.future.length === 0) return;
      
      const next = history.future[0];
      const newFuture = history.future.slice(1);
      
      history = {
        past: [...history.past, history.present],
        present: next,
        future: newFuture,
      };
      
      set({ 
        blocks: next,
        canUndo: true,
        canRedo: newFuture.length > 0,
      });
    },
    
    generateCode: () => {
      // Will be implemented in Phase 6
      return { html: '', json: '' };
    },
    
    saveProject: async () => {
      const { currentProjectId, projectName, blocks, visualLayout, globalStyles, isSaving } = get();
      
      if (isSaving) return;
      
      set({ isSaving: true });
      
      try {
        if (!currentProjectId) {
          // Create new project
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');
          
          const { data, error } = await supabase
            .from('visual_editor_projects')
            .insert({
              user_id: user.id,
              name: projectName,
              canvas_state: { blocks, visualLayout, globalStyles } as any,
            })
            .select()
            .single();
          
          if (error) throw error;
          
          set({
            currentProjectId: data.id,
            lastSavedAt: new Date(),
          });
          
          toast.success('Project created successfully');
        } else {
          // Update existing project
          const { error } = await supabase
            .from('visual_editor_projects')
            .update({
              name: projectName,
              canvas_state: { blocks, visualLayout, globalStyles } as any,
            })
            .eq('id', currentProjectId);
          
          if (error) throw error;
          
          set({ lastSavedAt: new Date() });
          toast.success('Project saved');
        }
      } catch (error) {
        console.error('Error saving project:', error);
        toast.error('Failed to save project');
      } finally {
        set({ isSaving: false });
      }
    },
    
    loadProject: async (id) => {
      set({ isLoading: true });
      
      try {
        const { data, error } = await supabase
          .from('visual_editor_projects')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        const canvasState = data.canvas_state as any;
        
        set({
          currentProjectId: data.id,
          projectName: data.name,
          blocks: canvasState.blocks || [],
          visualLayout: canvasState.visualLayout || {},
          globalStyles: canvasState.globalStyles || {
            defaultFont: 'Arial',
            defaultFontSize: 14,
            defaultTextColor: '#000000',
            defaultBackgroundColor: '#FFFFFF',
            defaultPadding: 10,
            defaultButtonColor: '#39AA5D',
          },
          selectedBlockIds: [],
          lastSavedAt: new Date(data.updated_at),
        });
        
        toast.success('Project loaded');
      } catch (error) {
        console.error('Error loading project:', error);
        toast.error('Failed to load project');
      } finally {
        set({ isLoading: false });
      }
    },
    
    createNewProject: async (name) => {
      set({
        currentProjectId: null,
        projectName: name,
        blocks: [],
        selectedBlockIds: [],
        previewMode: 'editor',
        visualLayout: {},
      });
    },
    
    deleteProject: async (id) => {
      try {
        const { error } = await supabase
          .from('visual_editor_projects')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        if (get().currentProjectId === id) {
          get().reset();
        }
        
        toast.success('Project deleted');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    },
    
    listProjects: async () => {
      try {
        const { data, error } = await supabase
          .from('visual_editor_projects')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error listing projects:', error);
        toast.error('Failed to load projects');
        return [];
      }
    },
    
    reset: () => {
      history = { past: [], present: [], future: [] };
      set({
        currentProjectId: null,
        projectName: 'Untitled Project',
        blocks: [],
        selectedBlockIds: [],
        canvasMode: 'structure',
        previewMode: 'editor',
        visualLayout: {},
        lastSavedAt: null,
        canUndo: false,
        canRedo: false,
      });
    },
    
    syncLayoutToStructure: () => {
      const { blocks, visualLayout } = get();
      
      // Собрать все блоки с их Y-координатами
      const blocksWithY = blocks.map(block => ({
        block,
        y: visualLayout[block.id]?.y || 0
      }));
      
      // Отсортировать по Y
      blocksWithY.sort((a, b) => a.y - b.y);
      
      // Обновить порядок блоков
      set({ blocks: blocksWithY.map(item => item.block) });
    },
    
    syncStructureToLayout: () => {
      const { blocks, visualLayout } = get();
      const newLayout = { ...visualLayout };
      
      // Расположить блоки вертикально с отступом 20px
      let currentY = 20;
      blocks.forEach(block => {
        if (!newLayout[block.id]) {
          newLayout[block.id] = {
            x: 20,
            y: currentY,
            width: 560, // 600 - 40px margins
            height: 100,
            zIndex: 0
          };
          currentY += 120; // 100 + 20px gap
        }
      });
      
      set({ visualLayout: newLayout });
    },
  };
});