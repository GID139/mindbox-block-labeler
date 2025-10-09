import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';

export const textTemplate: BlockTemplate = {
  type: 'TEXT',
  name: 'Text',
  category: 'BASIC',
  icon: '📝',
  canContainChildren: true,
  maxNestingLevel: 3,
  defaultSettings: {
    text: 'Enter text...',
    font: 'Arial',
    fontSize: '16px',
    fontWeight: 'normal',
    color: '#000000',
    lineHeight: '1.5',
    textAlign: 'left',
    display: true,
    link: '',
    background: { type: 'transparent' as const },
    padding: '10px',
  },
  availableSettings: ['display', 'text', 'textStyles', 'link'],
  
  generateHTML: (block: BlockInstance): string => {
    const { text, font, fontSize, fontWeight, color, lineHeight, textAlign, link, background, padding } = block.settings;
    
    // Outer div for padding and background
    const outerStyles: string[] = [];
    const bgStyle = getBackgroundStyle(background);
    if (bgStyle) outerStyles.push(bgStyle);
    const padStyle = getPaddingStyle(padding);
    if (padStyle) outerStyles.push(padStyle);
    
    // Inner span for text styles
    const innerStyle = `font-family: ${font}, sans-serif; font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color}; line-height: ${lineHeight}; text-align: ${textAlign}; display: inline-block; width: 100%;`;
    
    const content = text || 'Enter text...';
    
    // Children will be injected by code-generator
    
    const innerHTML = link
      ? `<a href="${link}" style="${innerStyle}">${content}</a>`
      : `<span style="${innerStyle}">${content}</span>`;
    
    // Two-layer structure
    if (outerStyles.length > 0) {
      return `<div style="${outerStyles.join(' ')}">${innerHTML}</div>`;
    }
    
    return innerHTML;
  },
  
  generateJSON: (block: BlockInstance): any[] => {
    const params: any[] = [];
    
    if (block.settings.text) {
      params.push({
        name: `${block.name}_text`,
        type: 'text',
        value: block.settings.text,
      });
    }
    
    if (block.settings.fontSize) {
      params.push({
        name: `${block.name}_fontSize`,
        type: 'size',
        value: block.settings.fontSize.replace('px', ''),
      });
    }
    
    if (block.settings.color) {
      params.push({
        name: `${block.name}_color`,
        type: 'color',
        value: block.settings.color,
      });
    }
    
    // Children will be handled by code-generator
    
    return params;
  },
};

// Heading is a preset for TEXT
export const headingTemplate: BlockTemplate = {
  ...textTemplate,
  name: 'Heading',
  icon: '🔤',
  defaultSettings: {
    ...textTemplate.defaultSettings,
    text: 'Heading',
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '1.2',
  },
};
