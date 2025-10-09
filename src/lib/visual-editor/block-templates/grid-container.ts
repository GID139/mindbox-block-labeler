import { BlockTemplate } from '@/types/visual-editor';

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
    padding: '20px',
    background: { type: 'transparent' },
    border: { style: 'none', width: 0, color: '#000000' },
    width: '100%',
    minHeight: '200px',
    alignItems: 'start',
    justifyItems: 'stretch',
  },
  availableSettings: ['display', 'gridTemplateColumns', 'gridTemplateRows', 'gap', 'padding', 'background', 'border', 'width', 'height', 'alignItems', 'justifyItems'],
  generateHTML: (block) => {
    const settings = block.settings;
    const childrenHTML = block.children.map(child => {
      const template = require('./index').getTemplate(child.type);
      return template.generateHTML(child);
    }).join('\n');

    const styles = [
      `display: grid`,
      settings.gridTemplateColumns && `grid-template-columns: ${settings.gridTemplateColumns}`,
      settings.gridTemplateRows && `grid-template-rows: ${settings.gridTemplateRows}`,
      settings.gap && `gap: ${settings.gap}`,
      settings.padding && `padding: ${settings.padding}`,
      settings.width && `width: ${settings.width}`,
      settings.height && `height: ${settings.height}`,
      settings.minHeight && `min-height: ${settings.minHeight}`,
      settings.alignItems && `align-items: ${settings.alignItems}`,
      settings.justifyItems && `justify-items: ${settings.justifyItems}`,
      settings.background?.type === 'color' && `background-color: ${settings.background.value}`,
      settings.background?.type === 'image' && `background-image: url(${settings.background.value})`,
      settings.border?.style !== 'none' && `border: ${settings.border.width}px ${settings.border.style} ${settings.border.color}`,
    ].filter(Boolean).join('; ');

    return `<div id="${block.id}" style="${styles}">\n${childrenHTML}\n</div>`;
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
