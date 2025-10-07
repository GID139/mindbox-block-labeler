// Валидаторы для HTML и JSON кода
import { KB } from './mindbox-kb';
import { logger } from './logger';

export function extractHtmlVariables(html: string): Set<string> {
  const allVars = html.match(/\$\{\s*editor\.([A-Za-z0-9_.]+)\s*\}/g) || [];
  const baseNames = new Set<string>();
  
  allVars.forEach(variable => {
    const fullName = variable.replace(/\$\{\s*editor\.|\s*\}/g, '');
    const baseName = fullName.split('.')[0];
    baseNames.add(baseName);
  });
  
  return baseNames;
}

export function extractJsonVariables(jsonText: string): Set<string> {
  try {
    const jsonArray = JSON.parse(jsonText);
    const varNames = new Set<string>();
    
    if (Array.isArray(jsonArray)) {
      jsonArray.forEach(item => {
        if (item && typeof item === 'object' && item.variable) {
          varNames.add(item.variable);
        }
      });
    }
    
    return varNames;
  } catch (error) {
    logger.error('Error parsing JSON', 'code-validators', { error: error instanceof Error ? error.message : error });
    return new Set();
  }
}

export function validateHtmlJsonSync(html: string, json: string): {
  isValid: boolean;
  missingInJson: string[];
  missingInHtml: string[];
} {
  const htmlVars = extractHtmlVariables(html);
  const jsonVars = extractJsonVariables(json);
  
  const missingInJson = Array.from(htmlVars).filter(v => !jsonVars.has(v));
  const missingInHtml = Array.from(jsonVars).filter(v => !htmlVars.has(v));
  
  return {
    isValid: missingInJson.length === 0 && missingInHtml.length === 0,
    missingInJson,
    missingInHtml
  };
}

/**
 * Validates block naming rules
 * Block names must use only Latin letters, digits, and underscores
 */
export function validateBlockNames(html: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const blockNamePattern = /<!--\s*EDITOR_BLOCK_TEMPLATE:\s*([^\s-]+)\s*-->/g;
  const matches = Array.from(html.matchAll(blockNamePattern));
  const seenNames = new Set<string>();
  
  matches.forEach(match => {
    const blockName = match[1];
    
    // Check for invalid characters (no dashes, no Cyrillic)
    if (!/^[a-zA-Z0-9_]+$/.test(blockName)) {
      errors.push(`Блок "${blockName}": недопустимые символы. Используйте только латиницу, цифры и подчеркивание`);
    }
    
    // Check for duplicates
    if (seenNames.has(blockName)) {
      errors.push(`Блок "${blockName}": дублирующееся имя. Имена блоков должны быть уникальными`);
    }
    seenNames.add(blockName);
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates dynamic block structure
 * Checks for proper @{for}...@{end for} syntax and COLLECTION usage
 */
export function validateDynamicBlocks(html: string, json: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for @{for} loops
  const forLoopPattern = /@\{for\s+\w+\s+in\s+editor\.(\w+)\}/g;
  const forMatches = Array.from(html.matchAll(forLoopPattern));
  
  forMatches.forEach(match => {
    const collectionVar = match[1];
    
    // Check if corresponding @{end for} exists
    const endForPattern = new RegExp(`@\\{for\\s+\\w+\\s+in\\s+editor\\.${collectionVar}\\}[\\s\\S]*?@\\{end for\\}`, 'g');
    if (!endForPattern.test(html)) {
      errors.push(`Незакрытый цикл для переменной "${collectionVar}": отсутствует @{end for}`);
    }
    
    // Verify COLLECTION exists in JSON
    try {
      const jsonArray = JSON.parse(json);
      const hasCollection = jsonArray.some((item: any) => 
        item.name === collectionVar && item.type === 'COLLECTION'
      );
      
      if (!hasCollection) {
        errors.push(`Переменная цикла "${collectionVar}" должна быть определена в JSON с типом COLLECTION`);
      }
    } catch (e) {
      // JSON parsing errors will be caught by validateJsonStructure
    }
  });
  
  // Check for role-based parameters when COLLECTION is used
  if (forMatches.length > 0) {
    try {
      const jsonArray = JSON.parse(json);
      const hasRoleParams = jsonArray.some((item: any) => item.role);
      
      if (!hasRoleParams) {
        errors.push('Динамические блоки с COLLECTION должны содержать параметры с полем "role" (ProductTitle, ProductUrl, и т.д.)');
      }
    } catch (e) {
      // JSON parsing errors will be caught by validateJsonStructure
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates that @{if} blocks contain HTML tags as direct children
 * Mindbox requires an HTML wrapper before any other template directives
 */
export function validateConditionalBlocks(html: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Pattern: @{if ...} followed by @{for/@{set/@{include} without HTML in between
  const ifBlockPattern = /@\{if\s+[^}]+\}([\s\S]*?)@\{end if\}/g;
  
  let match;
  while ((match = ifBlockPattern.exec(html)) !== null) {
    const blockContent = match[1].trim();
    const conditionSnippet = match[0].substring(0, 50); // First 50 chars for context
    
    // Check if first non-whitespace character is another directive
    const firstDirective = blockContent.match(/^@\{(for|set|include|macro)/);
    
    if (firstDirective) {
      errors.push(
        `Условный блок должен содержать HTML-тег в качестве прямого потомка, найдено @{${firstDirective[1]}}.\n` +
        `Контекст: ${conditionSnippet}...\n` +
        `Исправление: Оберните @{${firstDirective[1]}} в соответствующий HTML-тег (например, <table> для элементов <tr>)`
      );
    }
    
    // Check for plain text without HTML tags (rare but possible)
    if (!blockContent.match(/^\s*<[a-z]/i) && blockContent.length > 0 && !firstDirective) {
      errors.push(
        `Условный блок содержит текст/код без HTML-обёртки.\n` +
        `Контекст: ${conditionSnippet}...\n` +
        `Исправление: Оберните содержимое в HTML-тег (например, <div>, <span>, <td>)`
      );
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates that role parameters are used correctly
 */
export function validateRoleParameters(json: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const allowedRoles = [
    'ProductTitle',
    'ProductPrice',
    'ProductOldPrice',
    'ProductUrl',
    'ProductImageUrl',
    'ProductDescription',
    'ProductBadge'
  ];
  
  try {
    const jsonArray = JSON.parse(json);
    
    jsonArray.forEach((item: any, index: number) => {
      if (item.role) {
        // Check if role is in allowed list
        if (!allowedRoles.includes(item.role)) {
          errors.push(`Элемент ${index}: недопустимое значение role "${item.role}"`);
        }
        
        // Check that defaultValue is not present when role is used
        if (item.defaultValue !== undefined) {
          errors.push(`Элемент ${index}: параметры с "role" не должны содержать "defaultValue"`);
        }
        
        // Check that COLLECTION type is not used with role
        if (item.type === 'COLLECTION') {
          errors.push(`Элемент ${index}: тип COLLECTION не может использоваться с полем "role"`);
        }
      }
    });
  } catch (e) {
    // JSON parsing errors will be caught by validateJsonStructure
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateJsonStructure(jsonText: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    const jsonArray = JSON.parse(jsonText);
    
    if (!Array.isArray(jsonArray)) {
      errors.push('JSON должен быть массивом');
      return { isValid: false, errors };
    }
    
    jsonArray.forEach((item, index) => {
      if (!item.name && !item.variable) {
        errors.push(`Элемент ${index}: отсутствует поле "name" или "variable"`);
      }
      if (!item.type) {
        errors.push(`Элемент ${index}: отсутствует поле "type"`);
      }
      
      // Check for valid COLLECTION values
      if (item.type === 'COLLECTION' && item.defaultValue) {
        if (!KB.allowedCollections.includes(item.defaultValue)) {
          errors.push(`Элемент ${index}: недопустимое значение COLLECTION "${item.defaultValue}"`);
        }
      }
      
      // Проверка шрифтов
      if (item.defaultValue?.font && !KB.allowedFonts.includes(item.defaultValue.font)) {
        errors.push(`Элемент ${index}: недопустимый шрифт "${item.defaultValue.font}"`);
      }
      
      // Проверка lineHeight
      if (item.defaultValue?.lineHeight && !KB.allowedLineHeights.includes(item.defaultValue.lineHeight)) {
        errors.push(`Элемент ${index}: недопустимый lineHeight "${item.defaultValue.lineHeight}"`);
      }
      
      // Validate BACKGROUND structure
      if (item.type === 'BACKGROUND' && item.defaultValue) {
        if (!item.defaultValue.type || !['transparent', 'color', 'image'].includes(item.defaultValue.type)) {
          errors.push(`Элемент ${index}: BACKGROUND должен иметь type: "transparent", "color" или "image"`);
        }
        if (item.defaultValue.type === 'image' && item.defaultValue.mode) {
          if (!KB.bgModes.includes(item.defaultValue.mode)) {
            errors.push(`Элемент ${index}: недопустимый mode для BACKGROUND image "${item.defaultValue.mode}"`);
          }
        }
      }
      
      // Validate BUTTON_SIZE structure
      if (item.type === 'BUTTON_SIZE' && item.defaultValue) {
        if (item.defaultValue.width) {
          const widthType = item.defaultValue.width.split(' ')[0];
          if (!KB.widthTypes.includes(widthType)) {
            errors.push(`Элемент ${index}: недопустимый тип ширины в BUTTON_SIZE "${widthType}"`);
          }
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Некорректный JSON формат']
    };
  }
}

/**
 * Validates that variables don't exceed 2-dot notation (editor.variable.method)
 */
export function validateDotNotation(html: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Find all ${editor.*} variables
  const variablePattern = /\$\{editor\.([^}]+)\}/g;
  let match;
  
  while ((match = variablePattern.exec(html)) !== null) {
    const fullPath = match[1]; // e.g., "containerSize.formattedWidthAttribute"
    const dotCount = (fullPath.match(/\./g) || []).length;
    
    if (dotCount >= 2) {
      const basePath = fullPath.split('.')[0];
      let suggestion = '';
      
      // Provide type-specific suggestions
      if (fullPath.includes('formattedWidthAttribute')) {
        suggestion = `Rename '${basePath}' to '${basePath.replace(/Size$/, 'Width')}' in JSON`;
      } else if (fullPath.includes('formattedHeight')) {
        suggestion = `Rename '${basePath}' to '${basePath.replace(/Size$/, 'Height')}' in JSON`;
      } else if (fullPath.includes('.color')) {
        suggestion = `Use flat naming (e.g., '${basePath}Color' instead of '${basePath}.color')`;
      }
      
      errors.push(
        `❌ Variable has ${dotCount + 1} dots (max 2 allowed): \${editor.${fullPath}}\n` +
        `   Context: ${match[0]}\n` +
        `   Fix: ${suggestion}`
      );
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates that <tr> elements are inside <table> tags
 */
export function validateTableStructure(html: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Remove content inside <table>...</table> to check for orphaned <tr>
  const htmlWithoutTables = html.replace(/<table[^>]*>[\s\S]*?<\/table>/gi, '');
  
  // Now check if there are any <tr> tags left
  const orphanedTrPattern = /<tr[\s>]/gi;
  let match;
  
  while ((match = orphanedTrPattern.exec(htmlWithoutTables)) !== null) {
    const context = htmlWithoutTables.substring(Math.max(0, match.index - 50), match.index + 100);
    errors.push(
      `❌ Found <tr> element outside of <table>\n` +
      `   Context: ...${context}...`
    );
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates SIZE parameter format in JSON
 */
export function validateSizeFormat(jsonText: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    const params = JSON.parse(jsonText);
    if (!Array.isArray(params)) return { isValid: true, errors: [] };
    
    params.forEach((param: any, index: number) => {
      if (param.type === 'SIZE' && param.defaultValue) {
        const value = param.defaultValue;
        
        // Check if it matches the correct format: "manual [percent] [max_width_px]"
        const validFormat = /^manual\s+\d+\s+\d+$/;
        
        if (!validFormat.test(value)) {
          errors.push(
            `❌ Parameter "${param.name || param.variable}" (index ${index}) has invalid SIZE format\n` +
            `   Current: "${value}"\n` +
            `   Expected: "manual [percent] [max_width_px]" (e.g., "manual 100 600")`
          );
        }
      }
    });
  } catch (e) {
    // JSON parsing errors are handled by validateJsonStructure
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Comprehensive validation that runs all checks
 */
export function validateAll(html: string, json: string): {
  isValid: boolean;
  errors: string[];
} {
  const allErrors: string[] = [];
  
  // Run all validation checks
  const blockNamesResult = validateBlockNames(html);
  allErrors.push(...blockNamesResult.errors);
  
  const syncResult = validateHtmlJsonSync(html, json);
  if (!syncResult.isValid) {
    if (syncResult.missingInJson.length > 0) {
      allErrors.push(`Переменные отсутствуют в JSON: ${syncResult.missingInJson.join(', ')}`);
    }
    if (syncResult.missingInHtml.length > 0) {
      allErrors.push(`Переменные отсутствуют в HTML: ${syncResult.missingInHtml.join(', ')}`);
    }
  }
  
  const jsonStructResult = validateJsonStructure(json);
  allErrors.push(...jsonStructResult.errors);
  
  const dynamicBlocksResult = validateDynamicBlocks(html, json);
  allErrors.push(...dynamicBlocksResult.errors);
  
  const roleParamsResult = validateRoleParameters(json);
  allErrors.push(...roleParamsResult.errors);
  
  // Validate conditional block structure
  const conditionalValidation = validateConditionalBlocks(html);
  allErrors.push(...conditionalValidation.errors);

  // Validate dot notation (max 2 dots)
  const dotNotationValidation = validateDotNotation(html);
  allErrors.push(...dotNotationValidation.errors);

  // Validate table structure (<tr> inside <table>)
  const tableValidation = validateTableStructure(html);
  allErrors.push(...tableValidation.errors);

  // Validate SIZE format
  const sizeValidation = validateSizeFormat(json);
  allErrors.push(...sizeValidation.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}
