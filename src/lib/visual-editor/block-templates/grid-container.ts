import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';

export const gridContainerTemplate: BlockTemplate = {
  type: 'GRID_CONTAINER',
  name: 'Grid Container',
  category: 'LAYOUT',
  icon: 'LayoutGrid',
  canContainChildren: true,
  maxNestingLevel: 10,
  defaultSettings: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: 'auto',
    gap: '10px',
    padding: '10px',
    background: { type: 'transparent' as const },
    border: { style: 'none', width: 0, color: '#000000' },
    width: '100%',
    minHeight: '200px',
    alignItems: 'start',
    justifyItems: 'stretch',
  },
  availableSettings: ['display', 'gridTemplateColumns', 'gridTemplateRows', 'gap', 'padding', 'background', 'border', 'width', 'height', 'alignItems', 'justifyItems'],
  
  generateHTML: (block: BlockInstance): string => {
    const { gridTemplateColumns, gridTemplateRows, gap, background, padding, width, height, minHeight, alignItems, justifyItems } = block.settings;
    
    let html = '<div';
    
    // Grid styles
    const styles: string[] = ['display: grid'];
    
    if (gridTemplateColumns) styles.push(`grid-template-columns: ${gridTemplateColumns}`);
    if (gridTemplateRows) styles.push(`grid-template-rows: ${gridTemplateRows}`);
    if (gap) styles.push(`gap: ${gap}`);
    if (alignItems) styles.push(`align-items: ${alignItems}`);
    if (justifyItems) styles.push(`justify-items: ${justifyItems}`);
    
    // Background
    const bgStyle = getBackgroundStyle(background);
    if (bgStyle) styles.push(bgStyle.replace(/;$/, ''));
    
    // Padding
    const padStyle = getPaddingStyle(padding);
    if (padStyle) styles.push(padStyle.replace(/;$/, ''));
    
    // Size
    if (width) styles.push(`width: ${width}`);
    if (height) styles.push(`height: ${height}`);
    if (minHeight) styles.push(`min-height: ${minHeight}`);
    
    html += ` style="${styles.join('; ')}">\n`;
    
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
  generateJSON: (block) => {
    return [{
      "block": "container",
      "props": {
        "id": block.id,
        "style": {
          "display": "grid",
          "grid-template-columns": block.settings.gridTemplateColumns,
          "grid-template-rows": block.settings.gridTemplateRows,
          "gap": block.settings.gap,
          "padding": block.settings.padding,
          "width": block.settings.width,
          "height": block.settings.height,
          "align-items": block.settings.alignItems,
          "justify-items": block.settings.justifyItems,
        }
      },
      "content": block.children.map(child => {
        const template = require('./index').getTemplate(child.type);
        return template.generateJSON(child);
      }).flat()
    }];
  },
};
