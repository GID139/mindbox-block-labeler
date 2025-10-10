import { create } from 'zustand';
import { BlockInstance, ComponentDefinition, ComponentVariant, Guide } from '@/types/visual-editor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Preset } from '@/lib/visual-editor/presets';
import { getDefaultBlockSize } from '@/lib/visual-editor/block-templates';
import { 
  updateChildrenAbsoluteCoordinates,
  findBlockById as findBlockByIdUtil,
  getChildren,
  getAllDescendants,
  isAncestor,
  getRootBlocks,
  getBlockPath
} from '@/lib/visual-editor/coordinate-utils';

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
    x: number;          // Absolute X on canvas
    y: number;          // Absolute Y on canvas
    width: number;
    height: number;
    zIndex: number;
    relativeX?: number; // NEW: Relative X to parent (for reference)
    relativeY?: number; // NEW: Relative Y to parent (for reference)
  };
}

interface HistoryState {
  past: Array<{ blocks: BlockInstance[]; visualLayout: any; preview?: string; action?: string; timestamp?: number }>;
  present: { blocks: BlockInstance[]; visualLayout: any; preview?: string; action?: string; timestamp?: number };
  future: Array<{ blocks: BlockInstance[]; visualLayout: any; preview?: string; action?: string; timestamp?: number }>;
}

interface VisualEditorState {
  // ... keep existing code

  // History
  canUndo: boolean;
  canRedo: boolean;
  historyIndex: number;
  
  // Actions
  // ... keep existing code
  
  // History with preview
  goToHistoryState: (index: number) => void;
  getHistoryList: () => Array<{ index: number; action: string; timestamp: number; preview?: string }>;
}

interface VisualEditorState {
  // Project
  currentProjectId: string | null;
  projectName: string;
  
  // Canvas
  blocks: BlockInstance[];
  selectedBlockIds: string[];
  selectedTableCell: { tableId: string; cellKey: string } | null;
  visualLayout: VisualLayout;
  drawingTool: 'select' | 'rectangle' | 'circle' | 'line';
  
  // Marquee selection
  marqueeStart: { x: number; y: number } | null;
  marqueeEnd: { x: number; y: number } | null;
  isMarqueeSelecting: boolean;
  
  // Clipboard
  clipboard: BlockInstance[];
  
  // Guides
  guides: Guide[];
  
  // Components
  components: ComponentDefinition[];
  selectedComponentId: string | null;
  
  // Presets
  customPresets: Preset[];
  
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
  showRulers: boolean;
  showMeasurements: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  
  // History
  canUndo: boolean;
  canRedo: boolean;
  historyIndex: number;
  
  // Actions
  setProjectName: (name: string) => void;
  addBlock: (block: BlockInstance, parentId?: string, index?: number) => void;
  removeBlock: (id: string) => void;
  removeSelectedBlocks: () => void;
  updateBlock: (id: string, updates: Partial<BlockInstance>) => void;
  moveBlock: (draggedId: string, targetId: string | null, index: number) => void;
  extractFromParent: (blockId: string) => void;
  selectBlock: (id: string | null) => void;
  toggleBlockSelection: (id: string, isMulti: boolean) => void;
  clearSelection: () => void;
  toggleSetting: (blockId: string, settingKey: string) => void;
  updateSetting: (blockId: string, settingKey: string, value: any) => void;
  duplicateBlock: (id: string) => void;
  
  // Group/Lock/Hide actions
  groupBlocks: (blockIds: string[]) => void;
  ungroupBlock: (groupId: string) => void;
  toggleLock: (blockId: string) => void;
  toggleHide: (blockId: string) => void;
  
  // Component actions
  createComponent: (name: string, blockId: string) => void;
  deleteComponent: (componentId: string) => void;
  addVariant: (componentId: string, variantName: string) => void;
  updateVariant: (componentId: string, variantId: string, overrides: Record<string, any>) => void;
  deleteVariant: (componentId: string, variantId: string) => void;
  instantiateComponent: (componentId: string, variantId?: string, position?: { x: number; y: number }) => void;
  setSelectedComponent: (componentId: string | null) => void;
  
  // Preset actions
  addCustomPreset: (preset: Preset) => void;
  deleteCustomPreset: (presetId: string) => void;
  
  // Global styles
  setGlobalStyles: (styles: Partial<GlobalStyles>) => void;
  
  // Visual mode
  updateVisualLayout: (blockId: string, layout: Partial<VisualLayout[string]>) => void;
  setDrawingTool: (tool: 'select' | 'rectangle' | 'circle' | 'line') => void;
  
  // Marquee selection
  startMarqueeSelection: (x: number, y: number) => void;
  updateMarqueeSelection: (x: number, y: number) => void;
  endMarqueeSelection: (isAdditive: boolean) => void;
  cancelMarqueeSelection: () => void;
  
  // Multi-selection enhancement
  selectAll: () => void;
  selectByType: (type: string) => void;
  invertSelection: () => void;
  
  // Clipboard operations
  copySelectedBlocks: () => void;
  cutSelectedBlocks: () => void;
  paste: () => void;
  
  // Alignment
  alignSelectedBlocks: (alignType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelectedBlocks: (distributeType: 'horizontal' | 'vertical') => void;
  
  // Z-index management
  bringToFront: (blockId: string) => void;
  sendToBack: (blockId: string) => void;
  bringForward: (blockId: string) => void;
  sendBackward: (blockId: string) => void;
  moveUp: (blockId: string) => void;
  moveDown: (blockId: string) => void;
  moveBlockToGroup: (blockId: string, targetGroupId: string | null) => void;
  recalculateZIndexes: () => void;
  
  // Guides
  addGuide: (orientation: 'horizontal' | 'vertical', position: number) => void;
  removeGuide: (guideId: string) => void;
  updateGuide: (guideId: string, position: number) => void;
  
  // Zoom
  zoomToFit: () => void;
  zoomToSelection: () => void;
  resetZoom: () => void;
  
  // Import/Export
  importBlocks: (blocks: BlockInstance[]) => void;
  
  // Utility
  updateBlockSettings: (blockId: string, settings: Partial<BlockInstance>) => void;
  
  // UI controls
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setDeviceMode: (mode: 'mobile' | 'tablet' | 'desktop') => void;
  setShowOutline: (show: boolean) => void;
  setShowRulers: (show: boolean) => void;
  setShowMeasurements: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setSnapToObjects: (snap: boolean) => void;
  
  // Table-specific actions
  addBlockToTableCell: (tableId: string, cellKey: string, block: BlockInstance) => void;
  updateTableSize: (tableId: string, dimension: 'rows' | 'cols', delta: number) => void;
  updateCellSetting: (tableId: string, cellKey: string, settingKey: string, value: any) => void;
  selectTableCell: (tableId: string, cellKey: string) => void;
  clearTableCellSelection: () => void;
  removeBlockFromTableCell: (tableId: string, cellKey: string, blockId: string) => void;
  
  // Preview
  togglePreviewMode: () => void;
  setPreviewMode: (mode: 'editor' | 'html' | 'with-data') => void;
  
  // History
  undo: () => void;
  redo: () => void;
  goToHistoryState: (index: number) => void;
  getHistoryList: () => Array<{ index: number; action: string; timestamp: number; preview?: string }>;
  
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
}

// Use findBlockByIdUtil from coordinate-utils instead
const findBlockById = findBlockByIdUtil;

export const useVisualEditorStore = create<VisualEditorState>((set, get) => {
  const MAX_HISTORY = 50;
  
  let history: HistoryState = {
    past: [],
    present: { blocks: [], visualLayout: {}, action: 'Initial', timestamp: Date.now() },
    future: [],
  };
  let historyIndex = -1;

  const pushHistory = (action: string = 'Change', preview?: string) => {
    const state = get();
    const newState = {
      blocks: [...state.blocks],
      visualLayout: { ...state.visualLayout },
      preview,
      action,
      timestamp: Date.now(),
    };
    
    history = {
      past: [...history.past.slice(-MAX_HISTORY + 1), history.present],
      present: newState,
      future: [],
    };
    historyIndex = history.past.length;
    
    set({ canUndo: history.past.length > 0, canRedo: false, historyIndex });
  };

  return {
    // Initial state
    currentProjectId: null,
    projectName: 'Untitled Project',
    blocks: [],
    selectedBlockIds: [],
    selectedTableCell: null,
    visualLayout: {},
    drawingTool: 'select',
    marqueeStart: null,
    marqueeEnd: null,
    isMarqueeSelecting: false,
    clipboard: [],
    guides: [],
  components: [],
  selectedComponentId: null,
  customPresets: [],
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
    zoom: 1,
    deviceMode: 'desktop',
    showOutline: false,
    showRulers: false,
    showMeasurements: true,
    snapToGrid: true,
    snapToObjects: true,
    canUndo: false,
    canRedo: false,
    historyIndex: -1,
    
    // Actions
    setProjectName: (name) => set({ projectName: name }),
    
    addBlock: (block, parentId, index) => {
      pushHistory();
      const state = get();
      
      // Validate nesting level
      if (parentId) {
        const parent = findBlockById(state.blocks, parentId);
        if (!parent?.canContainChildren) {
          toast.error('Cannot add child to this block type');
          return;
        }
        
        const path = getBlockPath(state.blocks, parentId);
        if (path.length >= block.maxNestingLevel) {
          toast.error(`Maximum nesting level reached (${block.maxNestingLevel})`);
          return;
        }
      }
      
      const newBlock = { ...block, parentId: parentId || null };
      
      // Set initial coordinates
      if (parentId) {
        // Nested block - position relative to parent
        const parentLayout = state.visualLayout[parentId];
        if (parentLayout) {
          const defaultSize = getDefaultBlockSize(newBlock.type, newBlock.settings);
          
          state.updateVisualLayout(newBlock.id, {
            x: parentLayout.x,              // Absolute X = parent X
            y: parentLayout.y,              // Absolute Y = parent Y
            relativeX: 0,                   // Relative X = 0
            relativeY: 0,                   // Relative Y = 0
            width: parseInt(String(newBlock.settings.width)) || defaultSize.width,
            height: parseInt(String(newBlock.settings.height)) || defaultSize.height,
            zIndex: parentLayout.zIndex + 1,
          });
        }
      } else {
        // Root block - create visualLayout with smart positioning
        const defaultSize = getDefaultBlockSize(newBlock.type, newBlock.settings);
        const layoutValues = Object.values(state.visualLayout);
        
        // Calculate next position: below last block or at (20, 20)
        const currentY = layoutValues.length > 0
          ? Math.max(...layoutValues.map(l => l.y + l.height))
          : 0;
        
        state.updateVisualLayout(newBlock.id, {
          x: 20,
          y: layoutValues.length > 0 ? currentY + 20 : 20,
          width: parseInt(String(newBlock.settings.width)) || defaultSize.width,
          height: parseInt(String(newBlock.settings.height)) || defaultSize.height,
          zIndex: 0,
        });
      }
      
      // Simply push to flat array
      set(state => ({
        blocks: [...state.blocks, newBlock],
      }));
      
      get().recalculateZIndexes();
    },
    
    removeBlock: (id) => {
      pushHistory();
      const state = get();
      
      // Get all descendants to remove
      const toRemove = [id, ...getAllDescendants(state.blocks, id).map(b => b.id)];
      
      // Remove from blocks array
      const newBlocks = state.blocks.filter(block => !toRemove.includes(block.id));
      
      // Remove from visualLayout
      const newLayout = { ...state.visualLayout };
      toRemove.forEach(blockId => delete newLayout[blockId]);
      
      set({
        blocks: newBlocks,
        visualLayout: newLayout,
        selectedBlockIds: state.selectedBlockIds.filter(bid => !toRemove.includes(bid)),
      });
      
      get().recalculateZIndexes();
    },
    
    removeSelectedBlocks: () => {
      pushHistory();
      const state = get();
      const toRemove = new Set<string>();
      
      state.selectedBlockIds.forEach(id => {
        toRemove.add(id);
        getAllDescendants(state.blocks, id).forEach(b => toRemove.add(b.id));
      });
      
      const newBlocks = state.blocks.filter(block => !toRemove.has(block.id));
      set({ blocks: newBlocks, selectedBlockIds: [] });
    },
    
    updateBlock: (id, updates) => {
      pushHistory();
      set(state => ({
        blocks: state.blocks.map(block => 
          block.id === id ? { ...block, ...updates } : block
        ),
      }));
    },
    
    moveBlock: (draggedId, targetId, index) => {
      pushHistory();
      const state = get();
      
      // Prevent moving into self or descendants
      if (targetId && isAncestor(state.blocks, targetId, draggedId)) {
        toast.error('Cannot move block into its own child');
        return;
      }
      
      // Update parentId
      set(state => ({
        blocks: state.blocks.map(block => 
          block.id === draggedId 
            ? { ...block, parentId: targetId || null }
            : block
        ),
      }));
      
      // Reset to (0, 0) relative to new parent
      if (targetId) {
        const parentLayout = state.visualLayout[targetId];
        if (parentLayout) {
          state.updateVisualLayout(draggedId, {
            x: parentLayout.x,
            y: parentLayout.y,
            relativeX: 0,
            relativeY: 0,
          });
        }
      } else {
        // Moved to root - keep absolute coords but clear relative
        const currentLayout = state.visualLayout[draggedId];
        if (currentLayout) {
          state.updateVisualLayout(draggedId, {
            relativeX: undefined,
            relativeY: undefined,
          });
        }
      }
    },
    
    extractFromParent: (blockId) => {
      pushHistory();
      const state = get();
      const block = findBlockById(state.blocks, blockId);
      if (!block || !block.parentId) {
        toast.info('Block is already at root level');
        return;
      }
      
      // Simply remove parentId
      set(state => ({
        blocks: state.blocks.map(b => 
          b.id === blockId ? { ...b, parentId: null } : b
        ),
      }));
      
      toast.success('Block extracted from parent');
    },
    
    selectBlock: (id) => set({ selectedBlockIds: id ? [id] : [], selectedTableCell: null }),
    
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
      const state = get();
      const block = findBlockById(state.blocks, id);
      if (!block) return;
      
      const newBlock = {
        ...block,
        id: `${block.type.toLowerCase()}-${Date.now()}`,
        name: `${block.name}_copy`,
      };
      
      // Add to same parent
      get().addBlock(newBlock, block.parentId || undefined);
      
      // Duplicate all children recursively
      const children = getChildren(state.blocks, id);
      const duplicateChildren = (parentId: string, children: BlockInstance[]) => {
        children.forEach(child => {
          const duplicatedChild = {
            ...child,
            id: `${child.type.toLowerCase()}-${Date.now()}-${Math.random()}`,
            parentId: parentId,
          };
          get().addBlock(duplicatedChild, parentId);
          
          // Recursively duplicate this child's children
          const grandchildren = getChildren(state.blocks, child.id);
          if (grandchildren.length > 0) {
            duplicateChildren(duplicatedChild.id, grandchildren);
          }
        });
      };
      
      duplicateChildren(newBlock.id, children);
    },
    
    groupBlocks: (blockIds) => {
      if (blockIds.length < 2) {
        toast.error('Select at least 2 blocks to group');
        return;
      }
      
      pushHistory();
      const state = get();
      
      // Calculate bounding box
      const layouts = blockIds.map(id => state.visualLayout[id]).filter(Boolean);
      if (layouts.length === 0) return;
      
      const minX = Math.min(...layouts.map(l => l.x));
      const minY = Math.min(...layouts.map(l => l.y));
      const maxX = Math.max(...layouts.map(l => l.x + l.width));
      const maxY = Math.max(...layouts.map(l => l.y + l.height));
      const minZIndex = Math.min(...layouts.map(l => l.zIndex || 0));
      
      // Get common parent
      const firstBlock = findBlockById(state.blocks, blockIds[0]);
      const commonParentId = firstBlock?.parentId || null;
      
      // Create GROUP block
      const groupBlock: BlockInstance = {
        id: `group-${Date.now()}`,
        type: 'GROUP',
        name: `group${Math.floor(Math.random() * 1000)}`,
        settings: {
          display: 'block',
          background: { type: 'transparent' },
          clipChildren: false,
          collapsed: false,
        },
        canContainChildren: true,
        maxNestingLevel: 10,
        parentId: commonParentId,
      };
      
      // Add group with correct layout
      set(state => ({
        blocks: [...state.blocks, groupBlock],
      }));
      
      // Set absolute coordinates for the group itself
      state.updateVisualLayout(groupBlock.id, {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        zIndex: minZIndex,
      });
      
      // Update children: set parentId and update BOTH relative AND absolute coords
      set(state => ({
        blocks: state.blocks.map(block => {
          if (blockIds.includes(block.id)) {
            const layout = state.visualLayout[block.id];
            if (layout) {
              const relX = layout.x - minX;
              const relY = layout.y - minY;
              
              // Update both absolute (for rendering) and relative (for group logic) coordinates
              state.updateVisualLayout(block.id, {
                x: layout.x,        // Keep absolute coordinates
                y: layout.y,        // Keep absolute coordinates
                relativeX: relX,    // Set relative to group
                relativeY: relY,    // Set relative to group
                zIndex: (layout.zIndex || 0) - minZIndex,
              });
            }
            return { ...block, parentId: groupBlock.id };
          }
          return block;
        }),
        selectedBlockIds: [groupBlock.id],
      }));
      
      toast.success('Blocks grouped');
    },
    
    ungroupBlock: (groupId) => {
      const state = get();
      const group = findBlockById(state.blocks, groupId);
      if (!group || group.type !== 'GROUP') {
        toast.error('Not a group block');
        return;
      }
      
      pushHistory();
      
      const groupLayout = state.visualLayout[groupId];
      const children = getChildren(state.blocks, groupId);
      
      // Convert children back to absolute coords
      children.forEach(child => {
        const childLayout = state.visualLayout[child.id];
        if (childLayout && groupLayout) {
          state.updateVisualLayout(child.id, {
            x: groupLayout.x + (childLayout.relativeX || 0),
            y: groupLayout.y + (childLayout.relativeY || 0),
            relativeX: undefined,
            relativeY: undefined,
            zIndex: (childLayout.zIndex || 0) + (groupLayout.zIndex || 0),
          });
        }
      });
      
      // Remove group and restore parent hierarchy
      set(state => ({
        blocks: state.blocks
          .filter(b => b.id !== groupId)
          .map(b => children.some(c => c.id === b.id) 
            ? { ...b, parentId: group.parentId || null } 
            : b
          ),
        selectedBlockIds: children.map(c => c.id),
      }));
      
      // Delete group layout
      const { [groupId]: _, ...restLayout } = state.visualLayout;
      set({ visualLayout: restLayout });
      
      toast.success('Group ungrouped');
    },
    
    toggleLock: (blockId) => {
      const block = findBlockById(get().blocks, blockId);
      if (!block) return;
      
      get().updateBlock(blockId, { locked: !block.locked });
      toast.success(block.locked ? 'Unlocked' : 'Locked');
    },
    
    toggleHide: (blockId) => {
      const block = findBlockById(get().blocks, blockId);
      if (!block) return;
      
      get().updateBlock(blockId, { hidden: !block.hidden });
      toast.success(block.hidden ? 'Shown' : 'Hidden');
    },
    
    setGlobalStyles: (styles) => set({ globalStyles: { ...get().globalStyles, ...styles } }),
    
    // Component management
    createComponent: (name, blockId) => {
      const block = findBlockById(get().blocks, blockId);
      if (!block) {
        toast.error('Block not found');
        return;
      }

      const newComponent: ComponentDefinition = {
        id: `component-${Date.now()}`,
        name,
        masterBlock: JSON.parse(JSON.stringify(block)),
        variants: [],
        createdAt: new Date().toISOString(),
      };

      set(state => ({
        components: [...state.components, newComponent],
      }));
      
      toast.success(`Component "${name}" created`);
    },

    deleteComponent: (componentId) => {
      set(state => ({
        components: state.components.filter(c => c.id !== componentId),
        selectedComponentId: state.selectedComponentId === componentId ? null : state.selectedComponentId,
      }));
      toast.success('Component deleted');
    },

    addVariant: (componentId, variantName) => {
      set(state => ({
        components: state.components.map(comp => {
          if (comp.id === componentId) {
            return {
              ...comp,
              variants: [
                ...comp.variants,
                {
                  id: `variant-${Date.now()}`,
                  name: variantName,
                  overrides: {},
                },
              ],
            };
          }
          return comp;
        }),
      }));
      toast.success(`Variant "${variantName}" added`);
    },

    updateVariant: (componentId, variantId, overrides) => {
      set(state => ({
        components: state.components.map(comp => {
          if (comp.id === componentId) {
            return {
              ...comp,
              variants: comp.variants.map(v => 
                v.id === variantId ? { ...v, overrides } : v
              ),
            };
          }
          return comp;
        }),
      }));
    },

    deleteVariant: (componentId, variantId) => {
      set(state => ({
        components: state.components.map(comp => {
          if (comp.id === componentId) {
            return {
              ...comp,
              variants: comp.variants.filter(v => v.id !== variantId),
            };
          }
          return comp;
        }),
      }));
      toast.success('Variant deleted');
    },

    instantiateComponent: (componentId, variantId?, position?) => {
      const component = get().components.find(c => c.id === componentId);
      if (!component) {
        toast.error('Component not found');
        return;
      }

      const variant = variantId ? component.variants.find(v => v.id === variantId) : null;
      const instance: BlockInstance = JSON.parse(JSON.stringify(component.masterBlock));
      
      // Apply variant overrides
      if (variant) {
        Object.keys(variant.overrides).forEach(blockIdKey => {
          const block = findBlockById([instance], blockIdKey);
          if (block) {
            block.settings = { ...block.settings, ...variant.overrides[blockIdKey] };
          }
        });
      }

      // Generate new ID for instance
      const newId = `${instance.type.toLowerCase()}-${Date.now()}`;
      instance.id = newId;
      instance.name = `${instance.name}_instance`;

      // Set position in visual mode
      if (position) {
        get().updateVisualLayout(newId, {
          x: position.x,
          y: position.y,
          width: get().visualLayout[component.masterBlock.id]?.width || 200,
          height: get().visualLayout[component.masterBlock.id]?.height || 100,
          zIndex: 0,
        });
      }

      get().addBlock(instance);
      toast.success('Component instance created');
    },

    setSelectedComponent: (componentId) => {
      set({ selectedComponentId: componentId });
    },
    
    addCustomPreset: (preset) => set((state) => ({
      customPresets: [...state.customPresets, preset],
    })),

    deleteCustomPreset: (presetId) => set((state) => ({
      customPresets: state.customPresets.filter((p) => p.id !== presetId),
    })),
    
    updateVisualLayout: (blockId, layout) => {
      const state = get();
      const currentLayout = state.visualLayout[blockId];
      const blocks = state.blocks;
      
      // Calculate deltas if position changed
      const deltaX = layout.x !== undefined && currentLayout 
        ? layout.x - currentLayout.x 
        : 0;
      const deltaY = layout.y !== undefined && currentLayout
        ? layout.y - currentLayout.y 
        : 0;
      
      const block = findBlockByIdUtil(blocks, blockId);
      const defaultSize = block ? getDefaultBlockSize(block.type, block.settings) : { width: 200, height: 100 };
      const current = currentLayout || { x: 0, y: 0, width: defaultSize.width, height: defaultSize.height, zIndex: 0 };
      
      // Update this block's layout
      let updatedLayout = {
        ...state.visualLayout,
        [blockId]: {
          ...current,
          ...layout,
        },
      };
      
      // If position changed, update all children's absolute coordinates
      if ((deltaX !== 0 || deltaY !== 0) && block) {
        updatedLayout = updateChildrenAbsoluteCoordinates(
          blockId,
          deltaX,
          deltaY,
          blocks,
          updatedLayout
        );
      }
      
      set({ visualLayout: updatedLayout });
    },
    
    setDrawingTool: (tool) => set({ drawingTool: tool }),
    setShowGrid: (show) => set({ showGrid: show }),
    setGridSize: (size) => set({ gridSize: size }),
    setZoom: (zoom) => set({ zoom }),
    setDeviceMode: (mode) => set({ deviceMode: mode }),
    setShowOutline: (show) => set({ showOutline: show }),
    setShowRulers: (show) => set({ showRulers: show }),
    setShowMeasurements: (show) => set({ showMeasurements: show }),
    setSnapToGrid: (snap) => set({ snapToGrid: snap }),
    setSnapToObjects: (snap) => set({ snapToObjects: snap }),
    
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
    
    selectTableCell: (tableId, cellKey) => {
      set({ selectedTableCell: { tableId, cellKey } });
    },
    
    clearTableCellSelection: () => {
      set({ selectedTableCell: null });
    },
    
    removeBlockFromTableCell: (tableId, cellKey, blockId) => {
      const table = findBlockById(get().blocks, tableId);
      if (!table || table.type !== 'TABLE') return;
      
      const cells = { ...table.settings.cells };
      const cell = cells[cellKey];
      if (!cell) return;
      
      cells[cellKey] = {
        ...cell,
        children: cell.children.filter((c: BlockInstance) => c.id !== blockId),
      };
      
      get().updateBlock(tableId, {
        settings: { ...table.settings, cells },
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
      
      historyIndex = newPast.length;
      
      set({ 
        blocks: previous.blocks,
        visualLayout: previous.visualLayout,
        canUndo: newPast.length > 0,
        canRedo: true,
        historyIndex,
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
      
      historyIndex = history.past.length;
      
      set({ 
        blocks: next.blocks,
        visualLayout: next.visualLayout,
        canUndo: true,
        canRedo: newFuture.length > 0,
        historyIndex,
      });
    },

    goToHistoryState: (index: number) => {
      const allStates = [...history.past, history.present, ...history.future];
      if (index < 0 || index >= allStates.length) return;

      const targetState = allStates[index];
      const currentIndex = history.past.length;

      if (index < currentIndex) {
        // Going back
        const newPast = history.past.slice(0, index);
        const newFuture = [...history.past.slice(index + 1), history.present, ...history.future];
        
        history = {
          past: newPast,
          present: targetState,
          future: newFuture,
        };
      } else if (index > currentIndex) {
        // Going forward
        const stepsForward = index - currentIndex;
        const newPast = [...history.past, history.present, ...history.future.slice(0, stepsForward - 1)];
        const newFuture = history.future.slice(stepsForward);
        
        history = {
          past: newPast,
          present: targetState,
          future: newFuture,
        };
      }

      historyIndex = history.past.length;

      set({
        blocks: targetState.blocks,
        visualLayout: targetState.visualLayout,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        historyIndex,
      });
    },

    getHistoryList: () => {
      const allStates = [...history.past, history.present, ...history.future];
      return allStates.map((state, index) => ({
        index,
        action: state.action || 'Change',
        timestamp: state.timestamp || Date.now(),
        preview: state.preview,
      }));
    },
    
    generateCode: () => {
      // Will be implemented in Phase 6
      return { html: '', json: '' };
    },
    
    saveProject: async () => {
      const { currentProjectId, projectName, blocks, visualLayout, globalStyles, components, isSaving } = get();
      
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
              canvas_state: { blocks, visualLayout, globalStyles, components } as any,
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
              canvas_state: { blocks, visualLayout, globalStyles, components } as any,
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
          components: canvasState.components || [],
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
        components: [],
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
      history = { 
        past: [], 
        present: { blocks: [], visualLayout: {}, action: 'Initial', timestamp: Date.now() }, 
        future: [] 
      };
      historyIndex = -1;
      set({
        currentProjectId: null,
        projectName: 'Untitled Project',
        blocks: [],
        components: [],
        selectedComponentId: null,
        selectedBlockIds: [],
        previewMode: 'editor',
        visualLayout: {},
        lastSavedAt: null,
        canUndo: false,
        canRedo: false,
        historyIndex: -1,
      });
    },
    
    // Marquee selection
    startMarqueeSelection: (x, y) => {
      set({
        marqueeStart: { x, y },
        marqueeEnd: { x, y },
        isMarqueeSelecting: true,
      });
    },
    
    updateMarqueeSelection: (x, y) => {
      set({ marqueeEnd: { x, y } });
    },
    
    endMarqueeSelection: (isAdditive) => {
      const { marqueeStart, marqueeEnd, visualLayout, blocks, selectedBlockIds } = get();
      
      if (!marqueeStart || !marqueeEnd) {
        set({ marqueeStart: null, marqueeEnd: null, isMarqueeSelecting: false });
        return;
      }
      
      // Calculate marquee rectangle
      const minX = Math.min(marqueeStart.x, marqueeEnd.x);
      const maxX = Math.max(marqueeStart.x, marqueeEnd.x);
      const minY = Math.min(marqueeStart.y, marqueeEnd.y);
      const maxY = Math.max(marqueeStart.y, marqueeEnd.y);
      
      // Find blocks that intersect with marquee
      const intersectingIds: string[] = [];
      blocks.forEach(block => {
        const layout = visualLayout[block.id];
        if (!layout) return;
        
        // AABB collision detection
        const blockLeft = layout.x;
        const blockRight = layout.x + layout.width;
        const blockTop = layout.y;
        const blockBottom = layout.y + layout.height;
        
        const intersects = !(blockRight < minX || blockLeft > maxX || blockBottom < minY || blockTop > maxY);
        
        if (intersects) {
          intersectingIds.push(block.id);
        }
      });
      
      // Update selection
      if (isAdditive) {
        // Add to existing selection
        const newSelection = Array.from(new Set([...selectedBlockIds, ...intersectingIds]));
        set({ selectedBlockIds: newSelection });
      } else {
        // Replace selection
        set({ selectedBlockIds: intersectingIds });
      }
      
      // Reset marquee state
      set({ marqueeStart: null, marqueeEnd: null, isMarqueeSelecting: false });
    },
    
    cancelMarqueeSelection: () => {
      set({ marqueeStart: null, marqueeEnd: null, isMarqueeSelecting: false });
    },
    
    // Multi-selection enhancement
    selectAll: () => {
      const allIds = get().blocks.map(block => block.id);
      set({ selectedBlockIds: allIds });
      toast.success(`Selected ${allIds.length} blocks`);
    },
    
    selectByType: (type) => {
      const ids = get().blocks.filter(block => block.type === type).map(block => block.id);
      set({ selectedBlockIds: ids });
      toast.success(`Selected ${ids.length} ${type} blocks`);
    },
    
    invertSelection: () => {
      const allIds = get().blocks.map(block => block.id);
      const currentSelection = new Set(get().selectedBlockIds);
      const inverted = allIds.filter(id => !currentSelection.has(id));
      
      set({ selectedBlockIds: inverted });
      toast.success(`Selected ${inverted.length} blocks`);
    },
    
    // Clipboard operations
    copySelectedBlocks: () => {
      const { selectedBlockIds, blocks } = get();
      const selectedBlocks: BlockInstance[] = [];
      
      selectedBlockIds.forEach(id => {
        const block = findBlockById(blocks, id);
        if (block) {
          selectedBlocks.push(JSON.parse(JSON.stringify(block)));
        }
      });
      
      set({ clipboard: selectedBlocks });
      toast.success(`Copied ${selectedBlocks.length} blocks`);
    },
    
    cutSelectedBlocks: () => {
      const { selectedBlockIds, blocks } = get();
      const selectedBlocks: BlockInstance[] = [];
      
      selectedBlockIds.forEach(id => {
        const block = findBlockById(blocks, id);
        if (block) {
          selectedBlocks.push(JSON.parse(JSON.stringify(block)));
        }
      });
      
      set({ clipboard: selectedBlocks });
      get().removeSelectedBlocks();
      toast.success(`Cut ${selectedBlocks.length} blocks`);
    },
    
    paste: () => {
      const { clipboard } = get();
      
      if (clipboard.length === 0) {
        toast.error('Clipboard is empty');
        return;
      }
      
      pushHistory();
      const newBlocks = clipboard.map(block => ({
        ...JSON.parse(JSON.stringify(block)),
        id: `${block.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${block.name}_paste`,
      }));
      
      newBlocks.forEach(block => {
        get().addBlock(block);
      });
      
      toast.success(`Pasted ${newBlocks.length} blocks`);
    },
    
    // Alignment
    alignSelectedBlocks: (alignType) => {
      const { selectedBlockIds, blocks, visualLayout } = get();
      
      if (selectedBlockIds.length < 2) {
        toast.error('Select at least 2 blocks to align');
        return;
      }
      
      const selectedBlocks = selectedBlockIds.map(id => findBlockById(blocks, id)).filter(Boolean) as BlockInstance[];
      
      // Import alignment utilities
      const { alignBlocks } = require('@/lib/visual-editor/alignment-utils');
      const newLayout = alignBlocks(selectedBlocks, visualLayout, alignType);
      
      set({ visualLayout: newLayout });
      toast.success('Blocks aligned');
    },
    
    distributeSelectedBlocks: (distributeType) => {
      const { selectedBlockIds, blocks, visualLayout } = get();
      
      if (selectedBlockIds.length < 3) {
        toast.error('Select at least 3 blocks to distribute');
        return;
      }
      
      const selectedBlocks = selectedBlockIds.map(id => findBlockById(blocks, id)).filter(Boolean) as BlockInstance[];
      
      // Import alignment utilities
      const { distributeBlocks } = require('@/lib/visual-editor/alignment-utils');
      const newLayout = distributeBlocks(selectedBlocks, visualLayout, distributeType);
      
      set({ visualLayout: newLayout });
      toast.success('Blocks distributed');
    },
    
    // Z-index management - using visualLayout zIndex
    bringToFront: (blockId) => {
      pushHistory('Bring to Front');
      const state = get();
      const layout = state.visualLayout[blockId];
      if (!layout) return;
      
      // Find max zIndex
      const maxZIndex = Math.max(
        ...Object.values(state.visualLayout).map(l => l.zIndex ?? 0),
        0
      );
      
      // Set to max + 1
      state.updateVisualLayout(blockId, { zIndex: maxZIndex + 1 });
      toast.success('Brought to front');
    },
    
    sendToBack: (blockId) => {
      pushHistory('Send to Back');
      const state = get();
      const layout = state.visualLayout[blockId];
      if (!layout) return;
      
      // Find min zIndex
      const minZIndex = Math.min(
        ...Object.values(state.visualLayout).map(l => l.zIndex ?? 0),
        0
      );
      
      // Set to min - 1
      state.updateVisualLayout(blockId, { zIndex: minZIndex - 1 });
      toast.success('Sent to back');
    },
    
    bringForward: (blockId) => {
      pushHistory('Bring Forward');
      const state = get();
      const layout = state.visualLayout[blockId];
      if (!layout) return;
      
      const currentZ = layout.zIndex ?? 0;
      
      // Find next higher zIndex
      const allZIndexes = Object.values(state.visualLayout)
        .map(l => l.zIndex ?? 0)
        .filter(z => z > currentZ)
        .sort((a, b) => a - b);
      
      if (allZIndexes.length === 0) {
        toast.info('Already at front');
        return;
      }
      
      // Swap with next higher element
      const nextZ = allZIndexes[0];
      const nextBlockId = Object.entries(state.visualLayout)
        .find(([id, l]) => (l.zIndex ?? 0) === nextZ)?.[0];
      
      if (nextBlockId) {
        state.updateVisualLayout(blockId, { zIndex: nextZ });
        state.updateVisualLayout(nextBlockId, { zIndex: currentZ });
      }
      
      toast.success('Brought forward');
    },
    
    sendBackward: (blockId) => {
      pushHistory('Send Backward');
      const state = get();
      const layout = state.visualLayout[blockId];
      if (!layout) return;
      
      const currentZ = layout.zIndex ?? 0;
      
      // Find next lower zIndex
      const allZIndexes = Object.values(state.visualLayout)
        .map(l => l.zIndex ?? 0)
        .filter(z => z < currentZ)
        .sort((a, b) => b - a);
      
      if (allZIndexes.length === 0) {
        toast.info('Already at back');
        return;
      }
      
      // Swap with next lower element
      const prevZ = allZIndexes[0];
      const prevBlockId = Object.entries(state.visualLayout)
        .find(([id, l]) => (l.zIndex ?? 0) === prevZ)?.[0];
      
      if (prevBlockId) {
        state.updateVisualLayout(blockId, { zIndex: prevZ });
        state.updateVisualLayout(prevBlockId, { zIndex: currentZ });
      }
      
      toast.success('Sent backward');
    },

    moveUp: (blockId) => {
      pushHistory('Move Up');
      get().bringForward(blockId);
    },

    moveDown: (blockId) => {
      pushHistory('Move Down');
      get().sendBackward(blockId);
    },

    moveBlockToGroup: (blockId, targetGroupId) => {
      pushHistory('Move to Group');
      const state = get();
      const block = findBlockById(state.blocks, blockId);
      if (!block) return;
      
      // Prevent moving into self or descendants
      if (targetGroupId && isAncestor(state.blocks, targetGroupId, blockId)) {
        toast.error('Cannot move block into its own child');
        return;
      }
      
      const updatedBlocks = state.blocks.map(b =>
        b.id === blockId ? { ...b, parentId: targetGroupId } : b
      );
      
      set({ blocks: updatedBlocks });
      toast.success(targetGroupId ? 'Moved to group' : 'Moved to root');
    },
    
    recalculateZIndexes: () => {
      const { blocks, visualLayout } = get();
      const newLayout = { ...visualLayout };
      
      // Calculate depth for each block
      const getDepth = (blockId: string): number => {
        const block = findBlockById(blocks, blockId);
        if (!block || !block.parentId) return 0;
        return 1 + getDepth(block.parentId);
      };
      
      // Group blocks by depth
      const blocksByDepth: Map<number, string[]> = new Map();
      blocks.forEach(block => {
        const depth = getDepth(block.id);
        if (!blocksByDepth.has(depth)) {
          blocksByDepth.set(depth, []);
        }
        blocksByDepth.get(depth)!.push(block.id);
      });
      
      // Sort depths (0, 1, 2, ...)
      const sortedDepths = Array.from(blocksByDepth.keys()).sort((a, b) => a - b);
      
      // Assign z-index: depth * 1000 + order within depth
      sortedDepths.forEach(depth => {
        const blocksAtDepth = blocksByDepth.get(depth)!;
        blocksAtDepth.forEach((blockId, order) => {
          const zIndex = depth * 1000 + order;
          if (newLayout[blockId]) {
            newLayout[blockId] = { ...newLayout[blockId], zIndex };
          }
        });
      });
      
      set({ visualLayout: newLayout });
    },
    
    // Guides
    addGuide: (orientation, position) => {
      const newGuide: Guide = {
        id: `guide-${Date.now()}`,
        orientation,
        position,
        color: '#3b82f6',
      };
      
      set(state => ({
        guides: [...state.guides, newGuide],
      }));
    },
    
    removeGuide: (guideId) => {
      set(state => ({
        guides: state.guides.filter(g => g.id !== guideId),
      }));
    },
    
    updateGuide: (guideId, position) => {
      set(state => ({
        guides: state.guides.map(g =>
          g.id === guideId ? { ...g, position } : g
        ),
      }));
    },
    
    // Zoom
    zoomToFit: () => {
      const { blocks, visualLayout } = get();
      
      if (blocks.length === 0) {
        set({ zoom: 1 });
        return;
      }
      
      // Calculate bounding box of all blocks
      const positions = Object.values(visualLayout);
      if (positions.length === 0) {
        set({ zoom: 1 });
        return;
      }
      
      const minX = Math.min(...positions.map(p => p.x));
      const minY = Math.min(...positions.map(p => p.y));
      const maxX = Math.max(...positions.map(p => p.x + p.width));
      const maxY = Math.max(...positions.map(p => p.y + p.height));
      
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      
      // Assume canvas size
      const canvasWidth = 1200;
      const canvasHeight = 1600;
      
      const zoomX = canvasWidth / contentWidth;
      const zoomY = canvasHeight / contentHeight;
      
      const newZoom = Math.min(zoomX, zoomY, 2); // Max 200%
      set({ zoom: Math.max(0.1, newZoom) }); // Min 10%
      toast.success('Zoomed to fit');
    },
    
    zoomToSelection: () => {
      const { selectedBlockIds, visualLayout } = get();
      
      if (selectedBlockIds.length === 0) {
        toast.error('No blocks selected');
        return;
      }
      
      const selectedPositions = selectedBlockIds
        .map(id => visualLayout[id])
        .filter(Boolean);
      
      if (selectedPositions.length === 0) {
        toast.error('Selected blocks have no position');
        return;
      }
      
      const minX = Math.min(...selectedPositions.map(p => p.x));
      const minY = Math.min(...selectedPositions.map(p => p.y));
      const maxX = Math.max(...selectedPositions.map(p => p.x + p.width));
      const maxY = Math.max(...selectedPositions.map(p => p.y + p.height));
      
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      
      const canvasWidth = 1200;
      const canvasHeight = 1600;
      
      const zoomX = canvasWidth / contentWidth;
      const zoomY = canvasHeight / contentHeight;
      
      const newZoom = Math.min(zoomX, zoomY, 2);
      set({ zoom: Math.max(0.1, newZoom) });
      toast.success('Zoomed to selection');
    },
    
    resetZoom: () => {
      set({ zoom: 1 });
      toast.success('Zoom reset');
    },
    
    // Import/Export
    importBlocks: (blocks) => {
      pushHistory();
      set(state => ({
        blocks: [...state.blocks, ...blocks],
      }));
      toast.success(`Imported ${blocks.length} blocks`);
    },
    
    updateBlockSettings: (blockId, settings) => {
      get().updateBlock(blockId, settings);
    },
    
    // Table-specific actions
  };
});