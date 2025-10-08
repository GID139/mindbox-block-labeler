import { create } from 'zustand';
import { BlockInstance } from '@/types/visual-editor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VisualEditorState {
  // Project
  currentProjectId: string | null;
  projectName: string;
  
  // Canvas
  blocks: BlockInstance[];
  selectedBlockId: string | null;
  
  // UI
  previewMode: boolean;
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  
  // Actions
  setProjectName: (name: string) => void;
  addBlock: (block: BlockInstance, parentId?: string, index?: number) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<BlockInstance>) => void;
  moveBlock: (draggedId: string, targetId: string | null, index: number) => void;
  selectBlock: (id: string | null) => void;
  toggleSetting: (blockId: string, settingKey: string) => void;
  updateSetting: (blockId: string, settingKey: string, value: any) => void;
  
  // Preview
  togglePreviewMode: () => void;
  
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

export const useVisualEditorStore = create<VisualEditorState>((set, get) => ({
  // Initial state
  currentProjectId: null,
  projectName: 'Untitled Project',
  blocks: [],
  selectedBlockId: null,
  previewMode: false,
  isLoading: false,
  isSaving: false,
  lastSavedAt: null,
  
  // Actions
  setProjectName: (name) => set({ projectName: name }),
  
  addBlock: (block, parentId, index) => {
    set(state => ({
      blocks: addBlockToTree(state.blocks, parentId || null, block, index),
    }));
  },
  
  removeBlock: (id) => {
    set(state => ({
      blocks: removeBlockFromTree(state.blocks, id),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
    }));
  },
  
  updateBlock: (id, updates) => {
    set(state => ({
      blocks: updateBlockInTree(state.blocks, id, updates),
    }));
  },
  
  moveBlock: (draggedId, targetId, index) => {
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
  
  selectBlock: (id) => set({ selectedBlockId: id }),
  
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
  
  togglePreviewMode: () => set(state => ({ previewMode: !state.previewMode })),
  
  generateCode: () => {
    // Will be implemented in Phase 6
    return { html: '', json: '' };
  },
  
  saveProject: async () => {
    const { currentProjectId, projectName, blocks, isSaving } = get();
    
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
            canvas_state: blocks as any,
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
            canvas_state: blocks as any,
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
      
      set({
        currentProjectId: data.id,
        projectName: data.name,
        blocks: (data.canvas_state as unknown as BlockInstance[]) || [],
        selectedBlockId: null,
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
      selectedBlockId: null,
      previewMode: false,
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
  
  reset: () => set({
    currentProjectId: null,
    projectName: 'Untitled Project',
    blocks: [],
    selectedBlockId: null,
    previewMode: false,
    lastSavedAt: null,
  }),
}));
