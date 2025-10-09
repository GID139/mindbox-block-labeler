import { BlockInstance } from '@/types/visual-editor';

export interface BlockBounds {
  id: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export function getBlockBounds(block: BlockInstance, layout: Record<string, any>): BlockBounds {
  const pos = layout[block.id] || { x: 0, y: 0, width: 100, height: 100 };
  
  return {
    id: block.id,
    left: pos.x,
    top: pos.y,
    right: pos.x + pos.width,
    bottom: pos.y + pos.height,
    width: pos.width,
    height: pos.height,
    centerX: pos.x + pos.width / 2,
    centerY: pos.y + pos.height / 2,
  };
}

export type AlignType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributeType = 'horizontal' | 'vertical';

export function alignBlocks(
  blocks: BlockInstance[],
  layout: Record<string, any>,
  alignType: AlignType
): Record<string, any> {
  if (blocks.length < 2) return layout;

  const bounds = blocks.map(block => getBlockBounds(block, layout));
  const newLayout = { ...layout };

  switch (alignType) {
    case 'left': {
      const minLeft = Math.min(...bounds.map(b => b.left));
      bounds.forEach(b => {
        newLayout[b.id] = { ...layout[b.id], x: minLeft };
      });
      break;
    }
    case 'center': {
      const avgCenterX = bounds.reduce((sum, b) => sum + b.centerX, 0) / bounds.length;
      bounds.forEach(b => {
        newLayout[b.id] = { ...layout[b.id], x: avgCenterX - b.width / 2 };
      });
      break;
    }
    case 'right': {
      const maxRight = Math.max(...bounds.map(b => b.right));
      bounds.forEach(b => {
        newLayout[b.id] = { ...layout[b.id], x: maxRight - b.width };
      });
      break;
    }
    case 'top': {
      const minTop = Math.min(...bounds.map(b => b.top));
      bounds.forEach(b => {
        newLayout[b.id] = { ...layout[b.id], y: minTop };
      });
      break;
    }
    case 'middle': {
      const avgCenterY = bounds.reduce((sum, b) => sum + b.centerY, 0) / bounds.length;
      bounds.forEach(b => {
        newLayout[b.id] = { ...layout[b.id], y: avgCenterY - b.height / 2 };
      });
      break;
    }
    case 'bottom': {
      const maxBottom = Math.max(...bounds.map(b => b.bottom));
      bounds.forEach(b => {
        newLayout[b.id] = { ...layout[b.id], y: maxBottom - b.height };
      });
      break;
    }
  }

  return newLayout;
}

export function distributeBlocks(
  blocks: BlockInstance[],
  layout: Record<string, any>,
  distributeType: DistributeType
): Record<string, any> {
  if (blocks.length < 3) return layout;

  const bounds = blocks.map(block => getBlockBounds(block, layout));
  const newLayout = { ...layout };

  if (distributeType === 'horizontal') {
    // Sort by left position
    bounds.sort((a, b) => a.left - b.left);
    
    const first = bounds[0];
    const last = bounds[bounds.length - 1];
    const totalSpace = last.left - (first.left + first.width);
    const spacing = totalSpace / (bounds.length - 1);
    
    let currentX = first.left + first.width;
    for (let i = 1; i < bounds.length - 1; i++) {
      currentX += spacing;
      newLayout[bounds[i].id] = { ...layout[bounds[i].id], x: currentX };
      currentX += bounds[i].width;
    }
  } else {
    // Sort by top position
    bounds.sort((a, b) => a.top - b.top);
    
    const first = bounds[0];
    const last = bounds[bounds.length - 1];
    const totalSpace = last.top - (first.top + first.height);
    const spacing = totalSpace / (bounds.length - 1);
    
    let currentY = first.top + first.height;
    for (let i = 1; i < bounds.length - 1; i++) {
      currentY += spacing;
      newLayout[bounds[i].id] = { ...layout[bounds[i].id], y: currentY };
      currentY += bounds[i].height;
    }
  }

  return newLayout;
}
