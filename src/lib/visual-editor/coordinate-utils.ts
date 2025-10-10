import { BlockInstance } from '@/types/visual-editor';

/**
 * Find a block by ID in a flat array
 */
export function findBlockById(blocks: BlockInstance[], id: string): BlockInstance | null {
  return blocks.find(b => b.id === id) || null;
}
