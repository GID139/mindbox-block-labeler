import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';

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
    borderWidth: '1px',
    borderColor: '#DDDDDD',
    borderRadius: '4px',
    width: '600px',
    height: 'auto',
    padding: '16px',
    display: true,
    autoLayout: false,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: '8px',
    background: { type: 'color' as const, color: '#F5F5F5' },
  },
  availableSettings: ['display', 'background', 'border', 'borderRadius', 'size', 'padding', 'autoLayout'],
  
  generateHTML: (block: BlockInstance): string => {
    const { 
      background, 
      borderWidth, 
      borderColor, 
      borderStyle, 
      borderRadius,
      padding,
      width,
      height,
      autoLayout,
      flexDirection,
      justifyContent,
      alignItems,
      gap
    } = block.settings;
    
    let html = '<div';
    
    // Container styles
    const styles: string[] = [];
    
    // Background
    const bgStyle = getBackgroundStyle(background);
    if (bgStyle) styles.push(bgStyle.replace(/;$/, ''));
    
    // Border
    if (borderWidth && borderWidth !== '0px') {
      styles.push(`border: ${borderWidth} ${borderStyle || 'solid'} ${borderColor || '#000000'}`);
    }
    
    if (borderRadius && borderRadius !== '0px') {
      styles.push(`border-radius: ${borderRadius}`);
    }
    
    // Padding
    const padStyle = getPaddingStyle(padding);
    if (padStyle) styles.push(padStyle.replace(/;$/, ''));
    
    // Size
    if (width) {
      styles.push(`width: ${width}`);
    }
    
    if (height && height !== 'auto') {
      styles.push(`height: ${height}`);
    }
    
    // Auto layout (Flexbox)
    if (autoLayout) {
      styles.push('display: flex');
      if (flexDirection) styles.push(`flex-direction: ${flexDirection}`);
      if (justifyContent) styles.push(`justify-content: ${justifyContent}`);
      if (alignItems) styles.push(`align-items: ${alignItems}`);
      if (gap) styles.push(`gap: ${gap}`);
    }
    
    if (styles.length > 0) {
      html += ` style="${styles.join('; ')}"`;
    }
    
    html += '>\n';
    
    // Render children
    if (block.children && block.children.length > 0) {
      block.children.forEach(child => {
        const childTemplate = getTemplate(child.type);
        html += childTemplate.generateHTML(child);
      });
    }
    
    html += '</div>\n';
    return html;
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
