import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';
import { MindboxHTMLGenerator, MindboxJSONGenerator } from '../mindbox-generator-helpers';

export const textTemplate: BlockTemplate = {
  type: 'TEXT',
  name: 'Text',
  category: 'BASIC',
  icon: '📝',
  canContainChildren: true,
  maxNestingLevel: 3,
  defaultSettings: {
    text: 'Enter text...',
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    // Konva standard styles
    fill: '#000000',
    stroke: '',
    strokeWidth: 0,
    shadowColor: '#000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowOpacity: 0,
    opacity: 1,
    // Spacing
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
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
      const fontSizeValue = typeof block.settings.fontSize === 'string' 
        ? block.settings.fontSize.replace('px', '')
        : block.settings.fontSize;
      
      params.push({
        name: `${block.name}_fontSize`,
        type: 'size',
        value: fontSizeValue,
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

  generateMindboxHTML: (block: BlockInstance, childrenHTML?: string): string => {
    if (!block.mindboxSettings?.enabled) {
      return textTemplate.generateHTML(block);
    }

    const name = block.mindboxSettings.blockName;
    const htmlGen = new MindboxHTMLGenerator({ blockName: name, settings: block.mindboxSettings });
    
    const textContent = `<div style="\${editor.${name}Styles}">\${editor.${name}Text}</div>`;
    const content = htmlGen.generateBackgroundTD(textContent + (childrenHTML || ''));
    const wrapped = htmlGen.generateWrapper(content, block.mindboxSettings.align);
    
    return htmlGen.generateDisplayToggle(wrapped);
  },

  generateMindboxJSON: (block: BlockInstance): any[] => {
    if (!block.mindboxSettings?.enabled) return [];

    const jsonGen = new MindboxJSONGenerator({ 
      blockName: block.mindboxSettings.blockName, 
      settings: block.mindboxSettings 
    });
    
    return [
      ...jsonGen.generateBaseSettings(),
      ...jsonGen.generateTextSettings()
    ];
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
