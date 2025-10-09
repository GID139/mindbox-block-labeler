import { BlockInstance } from '@/types/visual-editor';

export interface SnapPoint {
  position: number;
  type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
  blockId: string;
}

export interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  guides: SnapGuide[];
}

export interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number;
}

const SNAP_THRESHOLD = 5;

export function findSnapPoints(
  blocks: BlockInstance[],
  layout: Record<string, any>,
  excludeId: string
): { vertical: SnapPoint[]; horizontal: SnapPoint[] } {
  const vertical: SnapPoint[] = [];
  const horizontal: SnapPoint[] = [];

  blocks.forEach(block => {
    if (block.id === excludeId) return;
    
    const pos = layout[block.id];
    if (!pos) return;

    // Vertical snap points
    vertical.push(
      { position: pos.x, type: 'left', blockId: block.id },
      { position: pos.x + pos.width / 2, type: 'center', blockId: block.id },
      { position: pos.x + pos.width, type: 'right', blockId: block.id }
    );

    // Horizontal snap points
    horizontal.push(
      { position: pos.y, type: 'top', blockId: block.id },
      { position: pos.y + pos.height / 2, type: 'middle', blockId: block.id },
      { position: pos.y + pos.height, type: 'bottom', blockId: block.id }
    );
  });

  return { vertical, horizontal };
}

export function snapToObjects(
  x: number,
  y: number,
  width: number,
  height: number,
  snapPoints: { vertical: SnapPoint[]; horizontal: SnapPoint[] }
): SnapResult {
  const guides: SnapGuide[] = [];
  let snappedX = false;
  let snappedY = false;
  let finalX = x;
  let finalY = y;

  // Check left edge
  for (const point of snapPoints.vertical) {
    if (Math.abs(x - point.position) <= SNAP_THRESHOLD) {
      finalX = point.position;
      snappedX = true;
      guides.push({ type: 'vertical', position: point.position });
      break;
    }
  }

  // Check center
  if (!snappedX) {
    const centerX = x + width / 2;
    for (const point of snapPoints.vertical) {
      if (Math.abs(centerX - point.position) <= SNAP_THRESHOLD) {
        finalX = point.position - width / 2;
        snappedX = true;
        guides.push({ type: 'vertical', position: point.position });
        break;
      }
    }
  }

  // Check right edge
  if (!snappedX) {
    const rightX = x + width;
    for (const point of snapPoints.vertical) {
      if (Math.abs(rightX - point.position) <= SNAP_THRESHOLD) {
        finalX = point.position - width;
        snappedX = true;
        guides.push({ type: 'vertical', position: point.position });
        break;
      }
    }
  }

  // Check top edge
  for (const point of snapPoints.horizontal) {
    if (Math.abs(y - point.position) <= SNAP_THRESHOLD) {
      finalY = point.position;
      snappedY = true;
      guides.push({ type: 'horizontal', position: point.position });
      break;
    }
  }

  // Check middle
  if (!snappedY) {
    const centerY = y + height / 2;
    for (const point of snapPoints.horizontal) {
      if (Math.abs(centerY - point.position) <= SNAP_THRESHOLD) {
        finalY = point.position - height / 2;
        snappedY = true;
        guides.push({ type: 'horizontal', position: point.position });
        break;
      }
    }
  }

  // Check bottom edge
  if (!snappedY) {
    const bottomY = y + height;
    for (const point of snapPoints.horizontal) {
      if (Math.abs(bottomY - point.position) <= SNAP_THRESHOLD) {
        finalY = point.position - height;
        snappedY = true;
        guides.push({ type: 'horizontal', position: point.position });
        break;
      }
    }
  }

  return {
    x: finalX,
    y: finalY,
    snappedX,
    snappedY,
    guides,
  };
}

export function snapToGrid(
  x: number,
  y: number,
  gridSize: number
): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}
