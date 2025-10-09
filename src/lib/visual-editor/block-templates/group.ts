import { BlockTemplate } from '@/types/visual-editor';

export const groupTemplate: BlockTemplate = {
  type: 'GROUP',
  name: 'Group',
  category: 'LAYOUT',
  icon: '📦',
  canContainChildren: true,
  maxNestingLevel: 5,
  defaultSettings: {
    display: 'block',
    background: { type: 'transparent' },
  },
  availableSettings: ['display', 'background'],
  
  generateHTML: (block) => {
    let html = '<div';
    
    // Container styles
    const styles: string[] = [];
    
    if (block.settings.background?.type === 'color') {
      styles.push(`background-color: ${block.settings.background.value}`);
    }
    
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
