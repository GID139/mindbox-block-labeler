import { BlockInstance } from '@/types/visual-editor';
import { VisualLayout } from '@/stores/visual-editor-store';
import { validateHierarchy, HierarchyValidationError, buildBlockTree } from './hierarchy-detector';

export interface MindboxValidationError {
  blockId: string;
  blockName: string;
  severity: 'error' | 'warning';
  message: string;
  field?: string;
}

export interface MindboxValidationResult {
  valid: boolean;
  errors: MindboxValidationError[];
  warnings: MindboxValidationError[];
}

/**
 * Validate variable name (no dashes, no Cyrillic, only letters, numbers, underscore)
 */
function isValidVariableName(name: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

/**
 * Validate a single Mindbox block
 */
export function validateMindboxBlock(block: BlockInstance): MindboxValidationError[] {
  const errors: MindboxValidationError[] = [];

  if (!block.mindboxSettings?.enabled) {
    return errors;
  }

  const settings = block.mindboxSettings;

  // Validate block name
  if (!settings.blockName) {
    errors.push({
      blockId: block.id,
      blockName: block.name,
      severity: 'error',
      message: 'Block name is required for Mindbox export',
      field: 'blockName'
    });
  } else if (!isValidVariableName(settings.blockName)) {
    errors.push({
      blockId: block.id,
      blockName: block.name,
      severity: 'error',
      message: `Block name "${settings.blockName}" contains invalid characters. Only letters, numbers and underscore allowed.`,
      field: 'blockName'
    });
  }

  // Validate background
  if (!settings.background) {
    errors.push({
      blockId: block.id,
      blockName: block.name,
      severity: 'error',
      message: 'Background setting is required',
      field: 'background'
    });
  } else {
    if (settings.background.type === 'color' && !settings.background.color) {
      errors.push({
        blockId: block.id,
        blockName: block.name,
        severity: 'error',
        message: 'Background color is required when type is "color"',
        field: 'background.color'
      });
    } else if (settings.background.type === 'image' && !settings.background.image) {
      errors.push({
        blockId: block.id,
        blockName: block.name,
        severity: 'error',
        message: 'Background image URL is required when type is "image"',
        field: 'background.image'
      });
    }
  }

  // Validate spacing format (should be "top right bottom left")
  if (settings.innerSpacing && !/^\d+\s+\d+\s+\d+\s+\d+$/.test(settings.innerSpacing)) {
    errors.push({
      blockId: block.id,
      blockName: block.name,
      severity: 'warning',
      message: `Inner spacing "${settings.innerSpacing}" should be in format "top right bottom left" (e.g., "10 10 20 10")`,
      field: 'innerSpacing'
    });
  }

  // Validate border radius format
  if (settings.borderRadius && !/^\d+\s+\d+\s+\d+\s+\d+$/.test(settings.borderRadius)) {
    errors.push({
      blockId: block.id,
      blockName: block.name,
      severity: 'warning',
      message: `Border radius "${settings.borderRadius}" should be in format "topLeft topRight bottomRight bottomLeft"`,
      field: 'borderRadius'
    });
  }

  // Type-specific validation
  if (block.type === 'TEXT' && settings.textSettings) {
    if (!settings.textSettings.text) {
      errors.push({
        blockId: block.id,
        blockName: block.name,
        severity: 'warning',
        message: 'Text content is empty',
        field: 'textSettings.text'
      });
    }

    if (!settings.textSettings.textStyles) {
      errors.push({
        blockId: block.id,
        blockName: block.name,
        severity: 'error',
        message: 'Text styles are required for TEXT blocks',
        field: 'textSettings.textStyles'
      });
    } else {
      const styles = settings.textSettings.textStyles;
      
      if (!styles.font) {
        errors.push({
          blockId: block.id,
          blockName: block.name,
          severity: 'error',
          message: 'Font is required in text styles',
          field: 'textSettings.textStyles.font'
        });
      }

      if (!styles.fallbackFont) {
        errors.push({
          blockId: block.id,
          blockName: block.name,
          severity: 'error',
          message: 'Fallback font is required in text styles',
          field: 'textSettings.textStyles.fallbackFont'
        });
      }

      if (!['1.0', '1.15', '1.5', '2.0'].includes(styles.lineHeight)) {
        errors.push({
          blockId: block.id,
          blockName: block.name,
          severity: 'error',
          message: `Line height must be one of: 1.0, 1.15, 1.5, 2.0 (got "${styles.lineHeight}")`,
          field: 'textSettings.textStyles.lineHeight'
        });
      }
    }
  }

  if (block.type === 'BUTTON' && settings.buttonSettings) {
    if (!settings.buttonSettings.buttonText) {
      errors.push({
        blockId: block.id,
        blockName: block.name,
        severity: 'warning',
        message: 'Button text is empty',
        field: 'buttonSettings.buttonText'
      });
    }

    if (!settings.buttonSettings.url) {
      errors.push({
        blockId: block.id,
        blockName: block.name,
        severity: 'warning',
        message: 'Button URL is not set',
        field: 'buttonSettings.url'
      });
    }
  }

  if (block.type === 'IMAGE' && settings.imageSettings) {
    if (!settings.imageSettings.image) {
      errors.push({
        blockId: block.id,
        blockName: block.name,
        severity: 'error',
        message: 'Image URL is required for IMAGE blocks',
        field: 'imageSettings.image'
      });
    }

    if (!settings.imageSettings.alt) {
      errors.push({
        blockId: block.id,
        blockName: block.name,
        severity: 'warning',
        message: 'Alt text is recommended for accessibility',
        field: 'imageSettings.alt'
      });
    }
  }

  return errors;
}

/**
 * Check for duplicate block names across the project
 */
export function validateUniqueBlockNames(blocks: BlockInstance[]): MindboxValidationError[] {
  const errors: MindboxValidationError[] = [];
  const nameMap = new Map<string, BlockInstance[]>();

  blocks.forEach(block => {
    if (block.mindboxSettings?.enabled && block.mindboxSettings.blockName) {
      const name = block.mindboxSettings.blockName;
      if (!nameMap.has(name)) {
        nameMap.set(name, []);
      }
      nameMap.get(name)!.push(block);
    }
  });

  nameMap.forEach((blocksWithName, name) => {
    if (blocksWithName.length > 1) {
      blocksWithName.forEach(block => {
        errors.push({
          blockId: block.id,
          blockName: block.name,
          severity: 'error',
          message: `Duplicate block name "${name}". Each Mindbox block must have a unique name.`,
          field: 'blockName'
        });
      });
    }
  });

  return errors;
}

/**
 * Validate entire Mindbox project
 */
export function validateMindboxProject(
  blocks: BlockInstance[],
  visualLayout: VisualLayout
): MindboxValidationResult {
  const allErrors: MindboxValidationError[] = [];

  // Validate each block
  blocks.forEach(block => {
    const blockErrors = validateMindboxBlock(block);
    allErrors.push(...blockErrors);
  });

  // Validate unique block names
  const uniquenessErrors = validateUniqueBlockNames(blocks);
  allErrors.push(...uniquenessErrors);

  // Validate hierarchy
  const mindboxBlocks = blocks.filter(b => b.mindboxSettings?.enabled);
  if (mindboxBlocks.length > 0) {
    const tree = buildBlockTree(mindboxBlocks, visualLayout);
    const hierarchyErrors = validateHierarchy(tree);
    
    hierarchyErrors.forEach(err => {
      allErrors.push({
        blockId: err.blockId,
        blockName: blocks.find(b => b.id === err.blockId)?.name || err.blockId,
        severity: 'error',
        message: err.message
      });
    });
  }

  // Separate errors and warnings
  const errors = allErrors.filter(e => e.severity === 'error');
  const warnings = allErrors.filter(e => e.severity === 'warning');

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: MindboxValidationResult): string {
  let output = '';

  if (result.errors.length > 0) {
    output += '❌ Errors:\n';
    result.errors.forEach(err => {
      output += `  • [${err.blockName}] ${err.message}\n`;
    });
  }

  if (result.warnings.length > 0) {
    output += '\n⚠️ Warnings:\n';
    result.warnings.forEach(warn => {
      output += `  • [${warn.blockName}] ${warn.message}\n`;
    });
  }

  if (result.valid) {
    output = '✅ All validations passed!';
  }

  return output;
}
