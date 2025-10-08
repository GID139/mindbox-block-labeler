import { useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Toolbar } from './Toolbar';
import { BlockLibrary } from './BlockLibrary';
import { Canvas } from './Canvas';
import { SettingsPanel } from './SettingsPanel';
import { useState } from 'react';
import { BlockInstance } from '@/types/visual-editor';
import { getTemplateByName } from '@/lib/visual-editor/block-templates';
import { generateBlockName, getAllBlockNames } from '@/lib/visual-editor/naming';

export function VisualEditorTab() {
  const { blocks, addBlock, moveBlock, selectedBlockId } = useVisualEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeBlock, setActiveBlock] = useState<BlockInstance | null>(null);

  // Auto-save every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      useVisualEditorStore.getState().saveProject();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    
    // Check if dragging from library or canvas
    if (event.active.data.current?.type === 'library-block') {
      const templateName = event.active.data.current.templateName;
      const template = getTemplateByName(templateName);
      if (template) {
        // Create a preview block
        const existingNames = getAllBlockNames(blocks);
        const newBlock: BlockInstance = {
          id: `preview-${Date.now()}`,
          type: template.type,
          name: generateBlockName(template.type, existingNames),
          settings: { ...template.defaultSettings },
          children: [],
          canContainChildren: template.canContainChildren,
          maxNestingLevel: template.maxNestingLevel,
        };
        setActiveBlock(newBlock);
      }
    } else if (event.active.data.current?.type === 'canvas-block') {
      setActiveBlock(event.active.data.current.block);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveBlock(null);
    
    if (!over) return;

    // Case 1: Drag from Library → Canvas
    if (active.data.current?.type === 'library-block') {
      const templateName = active.data.current.templateName;
      const template = getTemplateByName(templateName);
      
      if (template) {
        const existingNames = getAllBlockNames(blocks);
        const newBlock: BlockInstance = {
          id: `block-${Date.now()}`,
          type: template.type,
          name: generateBlockName(template.type, existingNames),
          settings: { ...template.defaultSettings },
          children: [],
          canContainChildren: template.canContainChildren,
          maxNestingLevel: template.maxNestingLevel,
        };

        // Determine parent and index
        const parentId = over.data.current?.parentId || null;
        const index = over.data.current?.index;

        addBlock(newBlock, parentId || undefined, index);
      }
    }
    
    // Case 2: Reorder within Canvas
    if (active.data.current?.type === 'canvas-block') {
      const targetParentId = over.data.current?.parentId || null;
      const targetIndex = over.data.current?.index || 0;
      
      moveBlock(active.id as string, targetParentId, targetIndex);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        <Toolbar />
        
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left: Block Library */}
          <div className="w-64 border-r border-border overflow-y-auto">
            <BlockLibrary />
          </div>
          
          {/* Center: Canvas */}
          <div className="flex-1 overflow-y-auto p-4">
            <Canvas />
          </div>
          
          {/* Right: Settings Panel */}
          <div className="w-80 border-l border-border overflow-y-auto">
            {selectedBlockId ? (
              <SettingsPanel />
            ) : (
              <div className="p-4 text-muted-foreground text-center">
                Select a block to edit its settings
              </div>
            )}
          </div>
        </div>
      </div>
      
      <DragOverlay>
        {activeBlock && (
          <div className="opacity-50 bg-primary/10 border-2 border-primary rounded p-2">
            {activeBlock.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
