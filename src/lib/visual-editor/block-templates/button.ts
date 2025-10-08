import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';

export const buttonTemplate: BlockTemplate = {
  type: 'BUTTON',
  name: 'Button',
  category: 'BASIC',
  icon: '🔘',
  canContainChildren: true,
  maxNestingLevel: 3,
  defaultSettings: {
    text: 'Click me',
    link: 'https://example.com',
    backgroundColor: '#39AA5D',
    textColor: '#FFFFFF',
    fontSize: '16',
    fontWeight: 'bold',
    borderRadius: '4',
    paddingTop: '12',
    paddingRight: '24',
    paddingBottom: '12',
    paddingLeft: '24',
    width: '200',
    height: '50',
    align: 'center',
    display: true,
  },
  availableSettings: ['display', 'text', 'link', 'background', 'textStyles', 'size', 'borderRadius', 'padding'],
  
  generateHTML: (block: BlockInstance): string => {
    const {
      text,
      link,
      backgroundColor,
      textColor,
      fontSize,
      fontWeight,
      borderRadius,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      width,
      height,
      align,
    } = block.settings;
    
    const style = `
      display: inline-block;
      background-color: ${backgroundColor};
      color: ${textColor};
      font-size: ${fontSize}px;
      font-weight: ${fontWeight};
      text-decoration: none;
      border-radius: ${borderRadius}px;
      padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;
      width: ${width}px;
      height: ${height}px;
      text-align: ${align};
      line-height: ${height}px;
    `.trim();
    
    let content = text || 'Click me';
    
    // Process children recursively
    if (block.children && block.children.length > 0) {
      content += block.children.map(child => {
        const childTemplate = getTemplate(child.type);
        return childTemplate.generateHTML(child);
      }).join('');
    }
    
    return `<a href="${link}" style="${style}">${content}</a>`;
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
