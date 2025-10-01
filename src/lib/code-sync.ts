// Утилиты для синхронизации чекбоксов с кодом

import { extractHtmlVariables, extractJsonVariables } from "./code-validators";
import { components } from "./component-settings";

/**
 * Анализирует код и возвращает список настроек, которые должны быть выбраны
 */
export function analyzeCodeForSettings(html: string, json: string): Record<string, boolean> {
  const selectedSettings: Record<string, boolean> = {};
  
  // Извлекаем переменные из кода
  const htmlVars = extractHtmlVariables(html);
  const jsonVars = extractJsonVariables(json);
  const allVars = new Set([...htmlVars, ...jsonVars]);

  // Проверяем каждый компонент и его настройки
  Object.entries(components).forEach(([componentKey, component]) => {
    Object.entries(component.settings).forEach(([settingKey, settingConfig]) => {
      const settingId = `${componentKey}-${settingKey}`;
      
      // Проверяем, есть ли эта настройка в коде
      // Ищем settingKey в переменных (например, 'url', 'text', 'background')
      if (allVars.has(settingKey)) {
        selectedSettings[settingId] = true;
      }
    });
  });

  return selectedSettings;
}

/**
 * Применяет изменения настроек к коду
 */
export function applySettingsToCode(
  html: string,
  json: string,
  settingId: string,
  enabled: boolean
): { html: string; json: string } {
  const [componentKey, settingKey] = settingId.split('-');
  const component = components[componentKey];
  
  if (!component) {
    return { html, json };
  }

  const settingConfig = component.settings[settingKey];
  if (!settingConfig) {
    return { html, json };
  }

  let newHtml = html;
  let newJson = json;
  const variable = settingKey; // Используем ключ настройки как имя переменной

  if (enabled) {
    // Проверяем, есть ли переменная в HTML
    const htmlPattern = `\${editor.${variable}}`;
    if (!newHtml.includes(htmlPattern)) {
      // Добавляем заглушку для переменной в конец блока
      const placeholder = `<!-- TODO: Добавить \${editor.${variable}} -->`;
      if (!newHtml.includes(placeholder)) {
        newHtml = newHtml.trim() + `\n${placeholder}`;
      }
    }

    // Проверяем, есть ли переменная в JSON
    try {
      const jsonArray = JSON.parse(newJson);
      if (Array.isArray(jsonArray)) {
        const hasVariable = jsonArray.some(item => item.variable === variable);
        
        // Добавляем переменную в JSON, если её нет
        if (!hasVariable) {
          jsonArray.push({
            variable: variable,
            type: "TEXT",
            label: settingConfig.tooltip || variable,
            defaultValue: `value_for_${variable}`
          });
          newJson = JSON.stringify(jsonArray, null, 2);
        }
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  } else {
    // Комментируем в HTML
    const htmlPattern = `\${editor.${variable}}`;
    const commentedPattern = `<!-- \${editor.${variable}} -->`;
    newHtml = newHtml.replace(new RegExp(htmlPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), commentedPattern);

    // Удаляем из JSON или помечаем
    try {
      const jsonArray = JSON.parse(newJson);
      if (Array.isArray(jsonArray)) {
        const filtered = jsonArray.filter(item => item.variable !== variable);
        newJson = JSON.stringify(filtered, null, 2);
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  }

  return { html: newHtml, json: newJson };
}
