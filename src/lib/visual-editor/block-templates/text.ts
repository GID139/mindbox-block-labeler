import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';

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
    fontSize: '16',
    fontWeight: 'normal',
    color: '#000000',
    lineHeight: '1.5',
    align: 'left',
    display: true,
    link: '',
    background: { type: 'transparent' as const },
    padding: '0px',
  },
  availableSettings: ['display', 'text', 'textStyles', 'link'],
  
  generateHTML: (block: BlockInstance): string => {
    const { text, font, fontSize, fontWeight, color, lineHeight, align, link } = block.settings;
    
    let style = `font-family: ${font}, sans-serif; font-size: ${fontSize}px; font-weight: ${fontWeight}; color: ${color}; line-height: ${lineHeight}; text-align: ${align};`;
    
    let content = text || 'Enter text...';
    
    // Process children recursively
    if (block.children && block.children.length > 0) {
      content += block.children.map(child => {
        const childTemplate = getTemplate(child.type);
        return childTemplate.generateHTML(child);
      }).join('');
    }
    
    if (link) {
      return `<a href="${link}" style="${style}">${content}</a>`;
    }
    
    return `<span style="${style}">${content}</span>`;
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
        value: block.settings.fontSize,
      });
    }
    
    if (block.settings.color) {
      params.push({
        name: `${block.name}_color`,
        type: 'color',
        value: block.settings.color,
      });
    }
    
    // Process children recursively
    if (block.children && block.children.length > 0) {
      block.children.forEach(child => {
        const childTemplate = getTemplate(child.type);
        params.push(...childTemplate.generateJSON(child));
      });
    }
    
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
    fontSize: '24',
    fontWeight: 'bold',
    lineHeight: '1.2',
  },
};
