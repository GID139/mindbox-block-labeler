// Валидаторы для HTML и JSON кода
import { KB } from './mindbox-kb';

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
    console.error('Error parsing JSON:', error);
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
      if (!item.variable) {
        errors.push(`Элемент ${index}: отсутствует поле "variable"`);
      }
      if (!item.type) {
        errors.push(`Элемент ${index}: отсутствует поле "type"`);
      }
      
      // Проверка шрифтов
      if (item.defaultValue?.font && !KB.allowedFonts.includes(item.defaultValue.font)) {
        errors.push(`Элемент ${index}: недопустимый шрифт "${item.defaultValue.font}"`);
      }
      
      // Проверка lineHeight
      if (item.defaultValue?.lineHeight && !KB.allowedLineHeights.includes(item.defaultValue.lineHeight)) {
        errors.push(`Элемент ${index}: недопустимый lineHeight "${item.defaultValue.lineHeight}"`);
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
