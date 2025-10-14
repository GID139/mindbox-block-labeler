import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';
import { MindboxHTMLGenerator, MindboxJSONGenerator } from '../mindbox-generator-helpers';

export const buttonTemplate: BlockTemplate = {
  type: 'BUTTON',
  name: 'Button',
  category: 'BASIC',
  icon: '🔘',
  canContainChildren: true,
  maxNestingLevel: 3,
  defaultSettings: {
    text: 'Button',
    href: '',
    // Konva standard styles
    fill: '#007bff',
    textColor: '#ffffff',
    stroke: '',
    strokeWidth: 0,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowOpacity: 0,
    opacity: 1,
    // Spacing
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 8, right: 16, bottom: 8, left: 16 },
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
      background,
      width,
      height
    } = block.settings;
    
    // Use background setting if available, otherwise fallback to backgroundColor
    const bgStyle = background && background.type !== 'transparent' 
      ? getBackgroundStyle(background)
      : `background-color: ${backgroundColor};`;
    
    let style = `
      display: inline-block;
      width: ${width || 'auto'};
      height: ${height || 'auto'};
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
    
    const content = text || 'Click me';
    
    // Children will be injected by code-generator
    
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
    
    // Children will be handled by code-generator
    
    return params;
  },

  generateMindboxHTML: (block: BlockInstance, childrenHTML?: string): string => {
    if (!block.mindboxSettings?.enabled) {
      return buttonTemplate.generateHTML(block);
    }

    const name = block.mindboxSettings.blockName;
    const htmlGen = new MindboxHTMLGenerator({ blockName: name, settings: block.mindboxSettings });
    
    const buttonContent = `<a href="\${editor.${name}_url}" style="\${editor.${name}_buttonStyles}">\${editor.${name}_buttonText}</a>`;
    const content = htmlGen.generateBackgroundTD(buttonContent + (childrenHTML || ''));
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
      ...jsonGen.generateButtonSettings()
    ];
  },
};
