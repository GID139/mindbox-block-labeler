import { BlockTemplate } from '@/types/visual-editor';

export const flexContainerTemplate: BlockTemplate = {
  type: 'FLEX_CONTAINER',
  name: 'Flex Container',
  category: 'LAYOUT',
  icon: 'Rows3',
  canContainChildren: true,
  maxNestingLevel: 10,
  defaultSettings: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '10px',
    padding: '20px',
    background: { type: 'transparent' },
    border: { style: 'none', width: 0, color: '#000000' },
    width: '100%',
    minHeight: '100px',
    flexWrap: 'nowrap',
  },
  availableSettings: ['display', 'flexDirection', 'justifyContent', 'alignItems', 'gap', 'padding', 'background', 'border', 'width', 'height', 'flexWrap'],
  generateHTML: (block) => {
    const settings = block.settings;
    const childrenHTML = block.children.map(child => {
      const template = require('./index').getTemplate(child.type);
      return template.generateHTML(child);
    }).join('\n');

    const styles = [
      `display: flex`,
      settings.flexDirection && `flex-direction: ${settings.flexDirection}`,
      settings.justifyContent && `justify-content: ${settings.justifyContent}`,
      settings.alignItems && `align-items: ${settings.alignItems}`,
      settings.gap && `gap: ${settings.gap}`,
      settings.padding && `padding: ${settings.padding}`,
      settings.width && `width: ${settings.width}`,
      settings.height && `height: ${settings.height}`,
      settings.minHeight && `min-height: ${settings.minHeight}`,
      settings.flexWrap && `flex-wrap: ${settings.flexWrap}`,
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
          "display": "flex",
          "flex-direction": block.settings.flexDirection,
          "justify-content": block.settings.justifyContent,
          "align-items": block.settings.alignItems,
          "gap": block.settings.gap,
          "padding": block.settings.padding,
          "width": block.settings.width,
          "height": block.settings.height,
          "flex-wrap": block.settings.flexWrap,
        }
      },
      "content": block.children.map(child => {
        const template = require('./index').getTemplate(child.type);
        return template.generateJSON(child);
      }).flat()
    }];
  },
};
