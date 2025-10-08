import { useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Toolbar } from './Toolbar';
import { BlockLibrary } from './BlockLibrary';
import { Canvas } from './Canvas';
import { VisualCanvas } from './VisualCanvas';
import { SettingsPanel } from './SettingsPanel';
import { QuickTips } from './QuickTips';
import { OutlineView } from './OutlineView';
import { InteractiveTutorial } from './InteractiveTutorial';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useState } from 'react';
import { BlockInstance } from '@/types/visual-editor';
import { getTemplateByName } from '@/lib/visual-editor/block-templates';
import { generateBlockName, getAllBlockNames } from '@/lib/visual-editor/naming';
import { toast } from 'sonner';

export function VisualEditorTab() {
  const { blocks, addBlock, moveBlock, selectedBlockIds, addBlockToTableCell, canvasMode, showOutline } = useVisualEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeBlock, setActiveBlock] = useState<BlockInstance | null>(null);

  const selectedBlockId = selectedBlockIds[0];

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

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

        // Check if dropping into table cell
        if (over.data.current?.type === 'table-cell') {
          const { blockId, cellKey } = over.data.current;
          addBlockToTableCell(blockId, cellKey, newBlock);
          toast.success(`Added ${template.name} to table cell`);
          return;
        }

        // Handle drop zones (between blocks)
        if (over.data.current?.type === 'drop-zone') {
          const { parentId, index, position } = over.data.current;
          let targetIndex = index;
          
          // Adjust index based on position
          if (position === 'bottom' || position === 'right') {
            targetIndex = index + 1;
          }
          
          addBlock(newBlock, parentId || undefined, targetIndex);
          toast.success(`Added ${template.name}`);
          return;
        }

        // Handle drop on container block
        if (over.data.current?.type === 'canvas-drop') {
          const { parentId, index } = over.data.current;
          addBlock(newBlock, parentId || undefined, index);
          toast.success(`Added ${template.name}`);
          return;
        }

        // Handle canvas root drop
        if (over.data.current?.type === 'canvas-root') {
          const { index } = over.data.current;
          addBlock(newBlock, undefined, index);
          toast.success(`Added ${template.name}`);
          return;
        }

        // Handle visual canvas drop
        if (over.id === 'visual-canvas-root') {
          addBlock(newBlock);
          
          // Автоматически создать layout для нового блока в Visual Mode
          const store = useVisualEditorStore.getState();
          const layoutValues = Object.values(store.visualLayout);
          const currentY = layoutValues.length > 0
            ? Math.max(...layoutValues.map(l => l.y + l.height))
            : 0;
          
          store.updateVisualLayout(newBlock.id, {
            x: 20,
            y: currentY + 20,
            width: 560,
            height: 100,
            zIndex: 0,
          });
          
          toast.success(`Added ${template.name}`);
          return;
        }

        // Default: add to end of canvas
        addBlock(newBlock);
        toast.success(`Added ${template.name}`);
      }
    }
    
    // Case 2: Reorder within Canvas
    if (active.data.current?.type === 'canvas-block') {
      // Check if dropping into table cell
      if (over.data.current?.type === 'table-cell') {
        const { blockId, cellKey } = over.data.current;
        const draggedBlock = activeBlock;
        
        if (draggedBlock) {
          // First remove from old position, then add to table cell
          // This is handled by moveBlock indirectly, but for table cells we use addBlockToTableCell
          // For now, just show a toast - full implementation would need more complex logic
          toast.error('Moving existing blocks to table cells is not yet supported. Please create new blocks in cells.');
        }
        return;
      }

      // Handle drop zones
      if (over.data.current?.type === 'drop-zone') {
        const { parentId, index, position } = over.data.current;
        let targetIndex = index;
        
        if (position === 'bottom' || position === 'right') {
          targetIndex = index + 1;
        }
        
        moveBlock(active.id as string, parentId, targetIndex);
        return;
      }

      // Handle drop on container block
      if (over.data.current?.type === 'canvas-drop') {
        const { parentId, index } = over.data.current;
        moveBlock(active.id as string, parentId, index);
        return;
      }

      // Handle canvas root
      if (over.data.current?.type === 'canvas-root') {
        const { index } = over.data.current;
        moveBlock(active.id as string, null, index);
        return;
      }

      const targetParentId = over.data.current?.parentId || null;
      const targetIndex = over.data.current?.index || 0;
      
      // moveBlock already has validation inside
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
        <div className="toolbar">
          <Toolbar />
        </div>
        
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left: Block Library */}
          <div className="w-64 border-r border-border overflow-y-auto block-library">
            <BlockLibrary />
          </div>
          
          {/* Center: Canvas */}
          <div className="flex-1 overflow-y-auto p-4 canvas-container">
            {canvasMode === 'structure' ? <Canvas /> : <VisualCanvas />}
          </div>
          
          {/* Right: Settings Panel or Outline */}
          <div className="w-80 border-l border-border overflow-y-auto settings-panel-container">
            {showOutline ? (
              <div className="p-4">
                <OutlineView />
              </div>
            ) : selectedBlockId ? (
              <SettingsPanel />
            ) : (
              <div className="p-4 text-muted-foreground text-center space-y-4">
                <div className="text-4xl">👈</div>
                <p className="text-sm">Select a block to edit its settings</p>
                <div className="text-xs bg-muted p-3 rounded">
                  <p className="font-medium mb-1">Quick Tips:</p>
                  <ul className="space-y-1 text-left">
                    <li>• Click any block in the canvas</li>
                    <li>• Use breadcrumbs for nested blocks</li>
                    <li>• Double-click text to edit inline</li>
                    <li>• Cmd/Ctrl + D to duplicate</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeBlock && (
          <div className="opacity-90 bg-primary text-primary-foreground border-2 border-primary rounded-lg p-3 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeBlock.type === 'TEXT' ? '📝' : activeBlock.type === 'BUTTON' ? '🔘' : activeBlock.type === 'IMAGE' ? '📷' : activeBlock.type === 'CONTAINER' ? '🎨' : activeBlock.type === 'TABLE' ? '📊' : '📦'}</span>
              <div>
                <div className="font-bold text-sm">{activeBlock.name}</div>
                <div className="text-xs opacity-80">{activeBlock.type}</div>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
      
      <QuickTips />
      <InteractiveTutorial />
    </DndContext>
  );
}
