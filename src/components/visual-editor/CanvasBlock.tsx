import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { BlockInstance, TableSettings } from '@/types/visual-editor';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { getTemplate } from '@/lib/visual-editor/block-templates';
import { useState, useRef, useEffect } from 'react';
import { TableCellRenderer } from './TableCellRenderer';
import { DropZoneIndicator } from './DropZoneIndicator';

interface CanvasBlockProps {
  block: BlockInstance;
  index: number;
  parentId: string | null;
  level?: number;
}

export function CanvasBlock({ block, index, parentId, level = 0 }: CanvasBlockProps) {
  const { selectedBlockIds, selectBlock, removeBlock, updateSetting } = useVisualEditorStore();
  const isSelected = selectedBlockIds.includes(block.id);
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: block.id,
    data: {
      type: 'canvas-block',
      block,
      parentId,
      index,
    },
    disabled: block.locked, // Disable dragging if locked
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${block.id}`,
    data: {
      type: 'canvas-drop',
      parentId: block.canContainChildren ? block.id : parentId,
      index: block.canContainChildren ? block.children.length : index + 1,
    },
    disabled: !block.canContainChildren || level >= block.maxNestingLevel,
  });

  const template = getTemplate(block.type);

  // Handle click to select block (always select the deepest child)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id);
  };

  // Handle double-click for inline editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (block.locked) return; // Prevent editing if locked
    if (block.type === 'TEXT' || block.type === 'BUTTON') {
      setIsEditing(true);
    }
  };

  // Handle blur to save edited text
  const handleBlur = () => {
    if (editableRef.current) {
      const newText = editableRef.current.innerText;
      updateSetting(block.id, 'text', newText);
    }
    setIsEditing(false);
  };

  // Focus on editable element when editing starts
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  // Generate HTML preview
  const generatePreviewHTML = () => {
    // For TABLE blocks, render them separately with React components
    if (block.type === 'TABLE') {
      return null;
    }
    // For blocks with children, render them separately
    if (block.children && block.children.length > 0 && block.type !== 'TEXT' && block.type !== 'BUTTON') {
      return null; // Will render children as React components
    }
    return template.generateHTML(block);
  };

  const previewHTML = generatePreviewHTML();

  return (
    <div
      ref={setDropRef}
      className={`relative group ${isDragging ? 'opacity-50' : ''} ${block.hidden ? 'opacity-40' : ''}`}
      onClick={handleClick}
    >
      <div
        ref={setDragRef}
        className={`relative border rounded transition-all duration-200 ${
          isSelected
            ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
            : 'border-border hover:border-primary/50 hover:shadow-md'
        } ${isOver && block.canContainChildren ? 'ring-2 ring-primary ring-offset-2' : ''} ${
          block.locked ? 'bg-muted/30' : ''
        }`}
      >
        {/* Drag handle - always visible on hover, disabled if locked */}
        {!block.locked && (
          <div 
            {...listeners} 
            {...attributes} 
            className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        )}

        {/* Delete button - visible when selected, disabled if locked */}
        {isSelected && !block.locked && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md z-10"
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(block.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}

        {/* Block label - small indicator with lock/hide icons */}
        <div className="absolute -top-2 left-2 px-2 py-0.5 bg-background border border-border rounded text-xs font-medium z-10 flex items-center gap-1">
          <span>{template.icon}</span>
          <span className="text-muted-foreground">{block.name}</span>
          {block.locked && <span className="text-destructive">🔒</span>}
          {block.hidden && <span className="text-muted-foreground">👁️‍🗨️</span>}
        </div>

        {/* WYSIWYG Preview */}
        <div className="p-4 pt-6" onDoubleClick={handleDoubleClick}>
          {isEditing && (block.type === 'TEXT' || block.type === 'BUTTON') ? (
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleBlur}
              className="outline-none min-h-[1em]"
              style={{
                fontFamily: block.settings.font || 'Arial',
                fontSize: `${block.settings.fontSize || 16}px`,
                fontWeight: block.settings.fontWeight || 'normal',
                color: block.type === 'BUTTON' ? block.settings.textColor : block.settings.color,
                lineHeight: block.settings.lineHeight || '1.5',
                textAlign: block.settings.align || 'left',
              }}
            >
              {block.settings.text}
            </div>
          ) : block.type === 'TABLE' ? (
            // Render TABLE with cells
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {Array.from({ length: (block.settings as TableSettings).rows }, (_, rowIdx) => (
                    <tr key={rowIdx}>
                      {Array.from({ length: (block.settings as TableSettings).cols }, (_, colIdx) => {
                        const cellKey = `${rowIdx},${colIdx}`;
                        const cells = (block.settings as TableSettings).cells || {};
                        const cell = cells[cellKey] || { children: [], settings: {} };
                        
                        return (
                          <TableCellRenderer
                            key={cellKey}
                            blockId={block.id}
                            cellKey={cellKey}
                            children={cell.children || []}
                            settings={cell.settings}
                            level={level}
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : previewHTML ? (
            <div 
              dangerouslySetInnerHTML={{ __html: previewHTML }}
              className="pointer-events-none select-none"
            />
          ) : (
            // Render children as React components for containers
            <div className="space-y-2">
              {block.children && block.children.length > 0 ? (
                block.children.map((child, childIndex) => (
                  <CanvasBlock
                    key={child.id}
                    block={child}
                    index={childIndex}
                    parentId={block.id}
                    level={level + 1}
                  />
                ))
              ) : (
                block.canContainChildren && (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    Drop blocks here
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Drop Zone Indicators - 4 directions */}
        {!isEditing && (
          <>
            <DropZoneIndicator
              id={`${block.id}-drop-top`}
              position="top"
              blockId={block.id}
              parentId={parentId}
              index={index}
            />
            <DropZoneIndicator
              id={`${block.id}-drop-bottom`}
              position="bottom"
              blockId={block.id}
              parentId={parentId}
              index={index}
            />
            <DropZoneIndicator
              id={`${block.id}-drop-left`}
              position="left"
              blockId={block.id}
              parentId={parentId}
              index={index}
            />
            <DropZoneIndicator
              id={`${block.id}-drop-right`}
              position="right"
              blockId={block.id}
              parentId={parentId}
              index={index}
            />
          </>
        )}

        {/* Show drop zone indicator */}
        {isOver && block.canContainChildren && (
          <div className="absolute inset-0 border-2 border-dashed border-primary rounded bg-primary/10 pointer-events-none flex items-center justify-center z-30 animate-pulse">
            <span className="text-sm font-medium text-primary bg-white px-3 py-1.5 rounded-full shadow-lg">
              📦 Drop inside
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
