import { BlockTemplate } from '@/types/visual-editor';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';

export const groupTemplate: BlockTemplate = {
  type: 'GROUP',
  name: 'Group',
  category: 'LAYOUT',
  icon: '📦',
  canContainChildren: true,
  maxNestingLevel: 10,
  defaultSettings: {
    display: 'block',
    background: { type: 'transparent' as const },
    padding: '10px',
    clipChildren: false,
    collapsed: false,
  },
  availableSettings: ['display', 'background', 'clipChildren'],
  
  generateHTML: (block) => {
    let html = '<div';
    
    // Container styles
    const styles: string[] = [];
    
    const bgStyle = getBackgroundStyle(block.settings.background);
    if (bgStyle) styles.push(bgStyle.replace(/;$/, ''));
    
    const padStyle = getPaddingStyle(block.settings.padding);
    if (padStyle) styles.push(padStyle.replace(/;$/, ''));
    
    if (styles.length > 0) {
      html += ` style="${styles.join('; ')}"`;
    }
    
    html += '>\n';
    
    // Children will be injected by code-generator
    
    html += '</div>\n';
    return html;
  },
  
  generateJSON: (block) => {
    // Group doesn't generate its own params, only children
    // Children will be handled by code-generator
    return [];
  },
};
