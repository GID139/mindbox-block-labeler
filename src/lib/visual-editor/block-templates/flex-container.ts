import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';

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
    padding: '10px',
    background: { type: 'transparent' as const },
    border: { style: 'none', width: 0, color: '#000000' },
    width: '100%',
    minHeight: '100px',
    flexWrap: 'nowrap',
  },
  availableSettings: ['display', 'flexDirection', 'justifyContent', 'alignItems', 'gap', 'padding', 'background', 'border', 'width', 'height', 'flexWrap'],
  
  generateHTML: (block: BlockInstance): string => {
    const { flexDirection, justifyContent, alignItems, gap, background, padding, width, height, minHeight, flexWrap } = block.settings;
    
    let html = '<div';
    
    // Flexbox styles
    const styles: string[] = ['display: flex'];
    
    if (flexDirection) styles.push(`flex-direction: ${flexDirection}`);
    if (justifyContent) styles.push(`justify-content: ${justifyContent}`);
    if (alignItems) styles.push(`align-items: ${alignItems}`);
    if (gap) styles.push(`gap: ${gap}`);
    if (flexWrap) styles.push(`flex-wrap: ${flexWrap}`);
    
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
    
    // Children will be injected by code-generator
    
    html += '</div>\n';
    return html;
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
      }
      // Children content will be added by code-generator
    }];
  },
};
