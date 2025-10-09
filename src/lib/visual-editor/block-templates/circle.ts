import { BlockTemplate, BlockInstance } from '@/types/visual-editor';

export const circleTemplate: BlockTemplate = {
  type: 'CIRCLE',
  name: 'Circle',
  category: 'BASIC',
  icon: '●',
  canContainChildren: false,
  maxNestingLevel: 0,
  defaultSettings: {
    size: '150px',
    backgroundColor: '#8b5cf6',
    borderWidth: '0px',
    borderColor: '#000000',
    borderStyle: 'solid',
    background: { type: 'color' as const, color: '#8b5cf6' },
    padding: '0px',
  },
  availableSettings: ['size', 'backgroundColor', 'border'],
  generateHTML: (block: BlockInstance) => {
    const { size, backgroundColor, borderWidth, borderColor, borderStyle } = block.settings;
    const border = borderWidth !== '0px' ? `${borderWidth} ${borderStyle} ${borderColor}` : 'none';
    
    return `<div style="width: ${size}; height: ${size}; background-color: ${backgroundColor}; border-radius: 50%; border: ${border};"></div>`;
  },
  generateJSON: (block: BlockInstance) => {
    const { size, backgroundColor, borderWidth, borderColor, borderStyle } = block.settings;
    
    return [{
      block: block.name,
      type: 'CIRCLE',
      style: {
        width: size,
        height: size,
        'background-color': backgroundColor,
        'border-radius': '50%',
        border: borderWidth !== '0px' ? `${borderWidth} ${borderStyle} ${borderColor}` : 'none',
      }
    }];
  },
};
