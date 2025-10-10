import { BlockTemplate, BlockType } from '@/types/visual-editor';
import { textTemplate, headingTemplate } from './text';
import { buttonTemplate } from './button';
import { imageTemplate } from './image';
import { containerTemplate } from './container';
import { tableTemplate } from './table';
import { spacerTemplate } from './spacer';
import { rectangleTemplate } from './rectangle';
import { circleTemplate } from './circle';
import { lineTemplate } from './line';
import { groupTemplate } from './group';
import { gridContainerTemplate } from './grid-container';
import { flexContainerTemplate } from './flex-container';

export const blockTemplates: BlockTemplate[] = [
  textTemplate,
  buttonTemplate,
  imageTemplate,
  containerTemplate,
];

export const getTemplate = (type: BlockType): BlockTemplate => {
  const template = blockTemplates.find(t => t.type === type);
  if (!template) {
    throw new Error(`Template not found for type: ${type}`);
  }
  return template;
};

export const getTemplateByName = (name: string): BlockTemplate | undefined => {
  return blockTemplates.find(t => t.name === name);
};

export const getDefaultBlockSize = (blockType: BlockType, settings: any): { width: number, height: number } => {
  const parseInt_ = (value: string | number | undefined, fallback: number): number => {
    if (typeof value === 'number') return value;
    if (!value) return fallback;
    const parsed = parseInt(String(value).replace(/px/g, ''));
    return isNaN(parsed) ? fallback : parsed;
  };

  switch (blockType) {
    case 'IMAGE':
      return {
        width: parseInt_(settings.width, 300),
        height: parseInt_(settings.height, 200),
      };

    case 'RECTANGLE':
      return {
        width: parseInt_(settings.width, 200),
        height: parseInt_(settings.height, 150),
      };

    case 'CIRCLE':
      const size = parseInt_(settings.size, 150);
      return { width: size, height: size };

    case 'LINE':
      return {
        width: parseInt_(settings.width, 200),
        height: parseInt_(settings.height, 2),
      };

    case 'BUTTON': {
      const text = settings.text || 'Button';
      const fontSize = parseInt_(settings.fontSize, 16);
      const padding = parseInt_(settings.padding, 20);
      
      // Approximate button size based on text and padding
      const width = Math.max(100, text.length * fontSize * 0.6 + padding * 2);
      const height = Math.max(40, fontSize + padding);
      
      return { width: Math.round(width), height: Math.round(height) };
    }

    case 'TEXT': {
      const text = settings.text || 'Text';
      const fontSize = parseInt_(settings.fontSize, 16);
      const lineHeight = parseFloat(settings.lineHeight) || 1.5;
      const padding = parseInt_(settings.padding, 10);
      
      // Approximate text size
      const width = Math.max(150, text.length * fontSize * 0.6 + padding * 2);
      const height = Math.max(50, fontSize * lineHeight + padding * 2);
      
      return { width: Math.round(width), height: Math.round(height) };
    }

    case 'CONTAINER':
    case 'FLEX_CONTAINER':
    case 'GRID_CONTAINER':
    case 'GROUP':
      return {
        width: parseInt_(settings.width, 400),
        height: parseInt_(settings.height, 300),
      };

    case 'TABLE': {
      const cols = settings.cols || 3;
      const rows = settings.rows || 3;
      return {
        width: cols * 150,
        height: rows * 50,
      };
    }

    case 'SPACER':
      return {
        width: parseInt_(settings.width, 100),
        height: parseInt_(settings.height, 20),
      };

    default:
      return { width: 200, height: 100 };
  }
};
