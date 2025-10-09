import { BlockInstance } from '@/types/visual-editor';
import { VisualLayout } from '@/stores/visual-editor-store';

/**
 * Finds a block by ID in flat array (O(n) lookup)
 */
export function findBlockById(blocks: BlockInstance[], id: string): BlockInstance | null {
  return blocks.find(block => block.id === id) || null;
}

/**
 * Flattens nested blocks into a single array (now just returns the array as-is)
 */
export function flattenBlocks(blocks: BlockInstance[]): BlockInstance[] {
  return blocks; // Already flat!
}

/**
 * Get all direct children of a block
 */
export function getChildren(blocks: BlockInstance[], parentId: string): BlockInstance[] {
  return blocks.filter(block => block.parentId === parentId);
}

/**
 * Get all descendants of a block recursively
 */
export function getAllDescendants(blocks: BlockInstance[], parentId: string): BlockInstance[] {
  const result: BlockInstance[] = [];
  const directChildren = getChildren(blocks, parentId);
  
  directChildren.forEach(child => {
    result.push(child);
    result.push(...getAllDescendants(blocks, child.id));
  });
  
  return result;
}

/**
 * Check if blockId is an ancestor of ancestorId
 */
export function isAncestor(blocks: BlockInstance[], blockId: string, ancestorId: string): boolean {
  const block = blocks.find(b => b.id === blockId);
  if (!block || !block.parentId) return false;
  
  if (block.parentId === ancestorId) return true;
  return isAncestor(blocks, block.parentId, ancestorId);
}

/**
 * Get path from root to block
 */
export function getBlockPath(blocks: BlockInstance[], blockId: string): BlockInstance[] {
  const path: BlockInstance[] = [];
  let currentBlock = blocks.find(b => b.id === blockId);
  
  while (currentBlock) {
    path.unshift(currentBlock);
    currentBlock = currentBlock.parentId 
      ? blocks.find(b => b.id === currentBlock!.parentId) 
      : undefined;
  }
  
  return path;
}

/**
 * Get only root blocks (no parent)
 */
export function getRootBlocks(blocks: BlockInstance[]): BlockInstance[] {
  return blocks.filter(block => !block.parentId);
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
    
    // Update all children recursively using getChildren
    const children = getChildren(blocks, blockId);
    children.forEach(child => updateRecursive(child.id));
  };
  
  // Update all direct children
  const children = getChildren(blocks, parentId);
  children.forEach(child => updateRecursive(child.id));
  
  return updatedLayout;
}
