import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';

export const containerTemplate: BlockTemplate = {
  type: 'CONTAINER',
  name: 'Container',
  category: 'LAYOUT',
  icon: '🎨',
  canContainChildren: true,
  maxNestingLevel: 3,
  defaultSettings: {
    backgroundColor: '#F5F5F5',
    borderStyle: 'solid',
    borderWidth: '1',
    borderColor: '#DDDDDD',
    borderRadiusTopLeft: '4',
    borderRadiusTopRight: '4',
    borderRadiusBottomRight: '4',
    borderRadiusBottomLeft: '4',
    width: '600',
    height: 'auto',
    paddingTop: '16',
    paddingRight: '16',
    paddingBottom: '16',
    paddingLeft: '16',
    display: true,
    // Auto Layout (Flexbox)
    autoLayout: false,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: '8',
  },
  availableSettings: ['display', 'background', 'border', 'borderRadius', 'size', 'padding', 'autoLayout'],
  
  generateHTML: (block: BlockInstance): string => {
    const {
      backgroundColor,
      borderStyle,
      borderWidth,
      borderColor,
      borderRadiusTopLeft,
      borderRadiusTopRight,
      borderRadiusBottomRight,
      borderRadiusBottomLeft,
      width,
      height,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      autoLayout,
      flexDirection,
      justifyContent,
      alignItems,
      gap,
    } = block.settings;
    
    let style = `
      background-color: ${backgroundColor};
      border: ${borderWidth}px ${borderStyle} ${borderColor};
      border-radius: ${borderRadiusTopLeft}px ${borderRadiusTopRight}px ${borderRadiusBottomRight}px ${borderRadiusBottomLeft}px;
      width: ${width}px;
      ${height !== 'auto' ? `height: ${height}px;` : ''}
      padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;
    `;
    
    // Add flexbox if autoLayout is enabled
    if (autoLayout) {
      style += `
        display: flex;
        flex-direction: ${flexDirection};
        justify-content: ${justifyContent};
        align-items: ${alignItems};
        gap: ${gap}px;
      `;
    }
    
    style = style.trim();
    
    let content = '';
    
    // Process children recursively
    if (block.children && block.children.length > 0) {
      content = block.children.map(child => {
        const childTemplate = getTemplate(child.type);
        return childTemplate.generateHTML(child);
      }).join('');
    }
    
    return `<div style="${style}">${content}</div>`;
  },
  
  generateJSON: (block: BlockInstance): any[] => {
    const params: any[] = [];
    
    params.push(
      {
        name: `${block.name}_backgroundColor`,
        type: 'color',
        value: block.settings.backgroundColor,
      },
      {
        name: `${block.name}_borderColor`,
        type: 'color',
        value: block.settings.borderColor,
      },
      {
        name: `${block.name}_width`,
        type: 'size',
        value: block.settings.width,
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
