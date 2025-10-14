import { BlockInstance } from '@/types/visual-editor';

export interface VisualLayout {
  [blockId: string]: {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
  };
}

export interface BlockTreeNode {
  block: BlockInstance;
  children: BlockTreeNode[];
  depth: number;
  relativeX: number; // Координаты относительно родителя
  relativeY: number;
}

/**
 * Проверяет, находится ли блок A полностью внутри блока B
 */
function isBlockInside(
  blockA: { x: number; y: number; width: number; height: number },
  blockB: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    blockA.x >= blockB.x &&
    blockA.y >= blockB.y &&
    (blockA.x + blockA.width) <= (blockB.x + blockB.width) &&
    (blockA.y + blockA.height) <= (blockB.y + blockB.height)
  );
}

/**
 * Находит родительский блок для данного блока на основе координат
 * Возвращает самый маленький контейнер, который полностью содержит блок
 */
export function findParentBlock(
  block: BlockInstance,
  allBlocks: BlockInstance[],
  visualLayout: VisualLayout
): BlockInstance | null {
  const blockLayout = visualLayout[block.id];
  if (!blockLayout) return null;

  // Найти все блоки-контейнеры, которые ПОЛНОСТЬЮ содержат текущий блок
  const potentialParents = allBlocks.filter(otherBlock => {
    if (otherBlock.id === block.id) return false;
    if (!otherBlock.canContainChildren) return false; // Только контейнеры могут быть родителями
    
    const parentLayout = visualLayout[otherBlock.id];
    if (!parentLayout) return false;
    
    // Проверка: текущий блок полностью внутри родителя?
    return isBlockInside(blockLayout, parentLayout);
  });
  
  // Выбрать САМОГО МАЛЕНЬКОГО родителя (ближайший контейнер)
  if (potentialParents.length === 0) return null;
  
  return potentialParents.reduce((smallest, current) => {
    const smallestLayout = visualLayout[smallest.id];
    const currentLayout = visualLayout[current.id];
    
    const smallestArea = smallestLayout.width * smallestLayout.height;
    const currentArea = currentLayout.width * currentLayout.height;
    
    return currentArea < smallestArea ? current : smallest;
  });
}

/**
 * Строит дерево блоков с автоматическим определением иерархии
 */
export function buildBlockTree(
  blocks: BlockInstance[],
  visualLayout: VisualLayout
): BlockTreeNode[] {
  // Создаём карту родителей для каждого блока
  const parentMap = new Map<string, BlockInstance | null>();
  
  blocks.forEach(block => {
    const parent = findParentBlock(block, blocks, visualLayout);
    parentMap.set(block.id, parent);
  });

  // Функция для построения узла дерева
  const buildNode = (block: BlockInstance, depth: number = 0): BlockTreeNode => {
    const blockLayout = visualLayout[block.id];
    const parent = parentMap.get(block.id);
    const parentLayout = parent ? visualLayout[parent.id] : null;
    
    // Вычисляем относительные координаты
    const relativeX = parentLayout ? blockLayout.x - parentLayout.x : blockLayout.x;
    const relativeY = parentLayout ? blockLayout.y - parentLayout.y : blockLayout.y;
    
    // Находим всех детей текущего блока
    const children = blocks
      .filter(otherBlock => parentMap.get(otherBlock.id)?.id === block.id)
      .map(child => buildNode(child, depth + 1))
      .sort((a, b) => {
        // Сортируем детей по Y, затем по X
        const layoutA = visualLayout[a.block.id];
        const layoutB = visualLayout[b.block.id];
        if (layoutA.y !== layoutB.y) return layoutA.y - layoutB.y;
        return layoutA.x - layoutB.x;
      });
    
    return {
      block,
      children,
      depth,
      relativeX,
      relativeY
    };
  };

  // Строим корневые узлы (блоки без родителей)
  const rootBlocks = blocks.filter(block => !parentMap.get(block.id));
  
  return rootBlocks
    .map(block => buildNode(block))
    .sort((a, b) => {
      // Сортируем корневые блоки по Y, затем по X
      const layoutA = visualLayout[a.block.id];
      const layoutB = visualLayout[b.block.id];
      if (layoutA.y !== layoutB.y) return layoutA.y - layoutB.y;
      return layoutA.x - layoutB.x;
    });
}

/**
 * Конвертирует абсолютные координаты в относительные (относительно родителя)
 */
export function convertToRelativeCoordinates(
  blockId: string,
  parentId: string | null,
  visualLayout: VisualLayout
): { x: number; y: number } {
  const blockLayout = visualLayout[blockId];
  
  if (!parentId) {
    return { x: blockLayout.x, y: blockLayout.y };
  }
  
  const parentLayout = visualLayout[parentId];
  
  return {
    x: blockLayout.x - parentLayout.x,
    y: blockLayout.y - parentLayout.y
  };
}

/**
 * Валидирует иерархию блоков
 */
export interface HierarchyValidationError {
  blockId: string;
  blockName: string;
  type: 'max_nesting' | 'circular_reference' | 'invalid_parent';
  message: string;
}

export function validateHierarchy(
  tree: BlockTreeNode[]
): HierarchyValidationError[] {
  const errors: HierarchyValidationError[] = [];
  
  const validateNode = (node: BlockTreeNode) => {
    // Проверка максимальной глубины вложенности
    if (node.depth > node.block.maxNestingLevel) {
      errors.push({
        blockId: node.block.id,
        blockName: node.block.name,
        type: 'max_nesting',
        message: `Block "${node.block.name}" exceeds maximum nesting level (${node.block.maxNestingLevel}). Current depth: ${node.depth}`
      });
    }
    
    // Проверка, что родитель может содержать детей
    if (node.children.length > 0 && !node.block.canContainChildren) {
      errors.push({
        blockId: node.block.id,
        blockName: node.block.name,
        type: 'invalid_parent',
        message: `Block "${node.block.name}" of type ${node.block.type} cannot contain children`
      });
    }
    
    // Рекурсивно проверяем детей
    node.children.forEach(child => validateNode(child));
  };
  
  tree.forEach(rootNode => validateNode(rootNode));
  
  return errors;
}

/**
 * Проверяет, есть ли конфликты в иерархии
 * (блоки, которые частично перекрываются, но не вложены друг в друга)
 */
export interface HierarchyConflict {
  blockA: BlockInstance;
  blockB: BlockInstance;
  type: 'partial_overlap' | 'ambiguous_parent';
  message: string;
}

export function detectHierarchyConflicts(
  blocks: BlockInstance[],
  visualLayout: VisualLayout
): HierarchyConflict[] {
  const conflicts: HierarchyConflict[] = [];
  
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const blockA = blocks[i];
      const blockB = blocks[j];
      
      const layoutA = visualLayout[blockA.id];
      const layoutB = visualLayout[blockB.id];
      
      if (!layoutA || !layoutB) continue;
      
      // Проверяем частичное перекрытие (но не полное вложение)
      const isAInsideB = isBlockInside(layoutA, layoutB);
      const isBInsideA = isBlockInside(layoutB, layoutA);
      
      if (!isAInsideB && !isBInsideA) {
        // Проверяем, есть ли вообще пересечение
        const hasIntersection = !(
          layoutA.x + layoutA.width <= layoutB.x ||
          layoutB.x + layoutB.width <= layoutA.x ||
          layoutA.y + layoutA.height <= layoutB.y ||
          layoutB.y + layoutB.height <= layoutA.y
        );
        
        if (hasIntersection) {
          conflicts.push({
            blockA,
            blockB,
            type: 'partial_overlap',
            message: `Blocks "${blockA.name}" and "${blockB.name}" partially overlap. This may cause incorrect hierarchy detection.`
          });
        }
      }
    }
  }
  
  return conflicts;
}

/**
 * Форматирует дерево блоков для отображения в UI
 */
export function formatTreeForDisplay(tree: BlockTreeNode[]): string {
  const formatNode = (node: BlockTreeNode, indent: string = ''): string => {
    let result = `${indent}${node.block.name} (${node.block.type})`;
    
    if (node.block.mindboxSettings?.enabled) {
      result += ` [Mindbox: ${node.block.mindboxSettings.blockName}]`;
    }
    
    result += `\n`;
    
    node.children.forEach((child, index) => {
      const isLast = index === node.children.length - 1;
      const childIndent = indent + (isLast ? '└── ' : '├── ');
      const nextIndent = indent + (isLast ? '    ' : '│   ');
      
      result += childIndent.slice(0, -4);
      result += formatNode(child, nextIndent);
    });
    
    return result;
  };
  
  return tree.map(node => formatNode(node)).join('\n');
}
