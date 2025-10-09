import { BlockInstance } from '@/types/visual-editor';
import { VisualLayout } from '@/stores/visual-editor-store';

/**
 * Recursively finds a block by ID in the block tree
 */
export function findBlockById(blocks: BlockInstance[], id: string): BlockInstance | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children.length > 0) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Flattens nested blocks into a single array
 */
export function flattenBlocks(blocks: BlockInstance[]): BlockInstance[] {
  const result: BlockInstance[] = [];
  
  const flatten = (blockList: BlockInstance[]) => {
    blockList.forEach(block => {
      result.push(block);
      if (block.children.length > 0) {
        flatten(block.children);
      }
    });
  };
  
  flatten(blocks);
  return result;
}

/**
 * Converts relative coordinates of a nested block to absolute canvas coordinates
 */
export function getAbsoluteCoordinates(
  blockId: string,
  blocks: BlockInstance[],
  visualLayout: VisualLayout
): { x: number; y: number } {
  const block = findBlockById(blocks, blockId);
  if (!block || !block.parentId) {
    // Root block - coordinates are already absolute
    const layout = visualLayout[blockId] || { x: 0, y: 0, width: 0, height: 0, zIndex: 0 };
    return { x: layout.x, y: layout.y };
  }

  // Get parent's absolute coordinates recursively
  const parentCoords = getAbsoluteCoordinates(block.parentId, blocks, visualLayout);
  const currentLayout = visualLayout[blockId];
  
  if (!currentLayout) {
    return { x: parentCoords.x, y: parentCoords.y };
  }
  
  // Add parent's absolute position to current relative position
  return {
    x: parentCoords.x + (currentLayout.relativeX !== undefined ? currentLayout.relativeX : currentLayout.x),
    y: parentCoords.y + (currentLayout.relativeY !== undefined ? currentLayout.relativeY : currentLayout.y),
  };
}

/**
 * Updates absolute coordinates of all child blocks when parent moves
 */
export function updateChildrenAbsoluteCoordinates(
  parentId: string,
  deltaX: number,
  deltaY: number,
  blocks: BlockInstance[],
  visualLayout: VisualLayout
): VisualLayout {
  const updatedLayout = { ...visualLayout };
  
  const updateRecursive = (blockId: string) => {
    const block = findBlockById(blocks, blockId);
    if (!block) return;
    
    // Update this block's absolute coordinates
    if (updatedLayout[blockId]) {
      updatedLayout[blockId] = {
        ...updatedLayout[blockId],
        x: updatedLayout[blockId].x + deltaX,
        y: updatedLayout[blockId].y + deltaY,
      };
    }
    
    // Update all children recursively
    block.children.forEach(child => updateRecursive(child.id));
  };
  
  const parent = findBlockById(blocks, parentId);
  if (parent) {
    parent.children.forEach(child => updateRecursive(child.id));
  }
  
  return updatedLayout;
}
