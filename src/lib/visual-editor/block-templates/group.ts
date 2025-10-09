import { BlockTemplate } from '@/types/visual-editor';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';

export const groupTemplate: BlockTemplate = {
  type: 'GROUP',
  name: 'Group',
  category: 'LAYOUT',
  icon: '📦',
  canContainChildren: true,
  maxNestingLevel: 5,
  defaultSettings: {
    display: 'block',
    background: { type: 'transparent' as const },
    padding: '0px',
  },
  availableSettings: ['display', 'background'],
  
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
    
    // Render children
    if (block.children && block.children.length > 0) {
      const { getTemplate } = require('./index');
      block.children.forEach(child => {
        const childTemplate = getTemplate(child.type);
        html += childTemplate.generateHTML(child);
      });
    }
    
    html += '</div>\n';
    return html;
  },
  
  generateJSON: (block) => {
    const params: any[] = [];
    
    // Generate JSON for all children
    if (block.children && block.children.length > 0) {
      const { getTemplate } = require('./index');
      block.children.forEach(child => {
        const childTemplate = getTemplate(child.type);
        params.push(...childTemplate.generateJSON(child));
      });
    }
    
    return params;
  },
};
