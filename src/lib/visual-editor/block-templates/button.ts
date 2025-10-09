import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';

export const buttonTemplate: BlockTemplate = {
  type: 'BUTTON',
  name: 'Button',
  category: 'BASIC',
  icon: '🔘',
  canContainChildren: true,
  maxNestingLevel: 3,
  defaultSettings: {
    text: 'Click me',
    href: '#',
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'normal',
    textAlign: 'center',
    display: true,
    border: 'none',
    link: '',
    background: { type: 'color' as const, color: '#007bff' },
  },
  availableSettings: ['display', 'text', 'link', 'background', 'textStyles', 'size', 'borderRadius', 'padding'],
  
  generateHTML: (block: BlockInstance): string => {
    const { 
      text, 
      href, 
      backgroundColor, 
      color, 
      borderRadius, 
      padding, 
      fontSize, 
      fontWeight, 
      textAlign,
      border,
      background
    } = block.settings;
    
    // Use background setting if available, otherwise fallback to backgroundColor
    const bgStyle = background && background.type !== 'transparent' 
      ? getBackgroundStyle(background)
      : `background-color: ${backgroundColor};`;
    
    let style = `
      display: inline-block;
      ${bgStyle}
      color: ${color};
      padding: ${padding};
      border-radius: ${borderRadius};
      font-size: ${fontSize};
      font-weight: ${fontWeight};
      text-align: ${textAlign};
      text-decoration: none;
      border: ${border || 'none'};
      cursor: pointer;
    `.replace(/\s+/g, ' ').trim();
    
    let content = text || 'Click me';
    
    // Process children recursively
    if (block.children && block.children.length > 0) {
      content += block.children.map(child => {
        const childTemplate = getTemplate(child.type);
        return childTemplate.generateHTML(child);
      }).join('');
    }
    
    return `<a href="${href}" style="${style}">${content}</a>`;
  },
  
  generateJSON: (block: BlockInstance): any[] => {
    const params: any[] = [];
    
    params.push(
      {
        name: `${block.name}_text`,
        type: 'text',
        value: block.settings.text,
      },
      {
        name: `${block.name}_link`,
        type: 'url',
        value: block.settings.link,
      },
      {
        name: `${block.name}_backgroundColor`,
        type: 'color',
        value: block.settings.backgroundColor,
      },
      {
        name: `${block.name}_width`,
        type: 'size',
        value: block.settings.width,
      },
      {
        name: `${block.name}_height`,
        type: 'size',
        value: block.settings.height,
      }
    );
    
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
