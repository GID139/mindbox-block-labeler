import { BlockType } from '@/types/visual-editor';

export function generateBlockName(type: BlockType, existingNames: string[]): string {
  const base = type.toLowerCase();
  let counter = 1;
  let name = `${base}${counter}`;
  
  while (existingNames.includes(name)) {
    counter++;
    name = `${base}${counter}`;
  }
  
  return name;
}

export function validateBlockName(name: string): boolean {
  // Only latin letters, digits, and underscore
  return /^[a-zA-Z0-9_]+$/.test(name);
}

export function getAllBlockNames(blocks: any[]): string[] {
  const names: string[] = [];
  
  const traverse = (blocks: any[]) => {
    blocks.forEach(block => {
      names.push(block.name);
      if (block.children?.length > 0) {
        traverse(block.children);
      }
    });
  };
  
  traverse(blocks);
  return names;
}
