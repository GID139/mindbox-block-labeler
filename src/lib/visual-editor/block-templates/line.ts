import { BlockTemplate, BlockInstance } from '@/types/visual-editor';

export const lineTemplate: BlockTemplate = {
  type: 'LINE',
  name: 'Line',
  category: 'BASIC',
  icon: '━',
  canContainChildren: false,
  maxNestingLevel: 0,
  defaultSettings: {
    width: '200px',
    height: '2px',
    backgroundColor: '#000000',
    rotation: '0deg',
    background: { type: 'color' as const, color: '#000000' },
  },
  availableSettings: ['width', 'height', 'backgroundColor', 'rotation'],
  generateHTML: (block: BlockInstance) => {
    const { width, height, backgroundColor, rotation } = block.settings;
    const transform = rotation !== '0deg' ? `transform: rotate(${rotation});` : '';
    
    return `<div style="width: ${width}; height: ${height}; background-color: ${backgroundColor}; ${transform}"></div>`;
  },
  generateJSON: (block: BlockInstance) => {
    const { width, height, backgroundColor, rotation } = block.settings;
    
    return [{
      block: block.name,
      type: 'LINE',
      style: {
        width,
        height,
        'background-color': backgroundColor,
        ...(rotation !== '0deg' && { transform: `rotate(${rotation})` }),
      }
    }];
  },
};
