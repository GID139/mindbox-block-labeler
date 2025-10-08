import { BlockTemplate, BlockInstance } from '@/types/visual-editor';

export const rectangleTemplate: BlockTemplate = {
  type: 'RECTANGLE',
  name: 'Rectangle',
  category: 'BASIC',
  icon: '▭',
  canContainChildren: false,
  maxNestingLevel: 0,
  defaultSettings: {
    width: '200px',
    height: '150px',
    backgroundColor: '#3b82f6',
    borderRadius: '0px',
    borderWidth: '0px',
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  availableSettings: ['width', 'height', 'backgroundColor', 'borderRadius', 'border'],
  generateHTML: (block: BlockInstance) => {
    const { width, height, backgroundColor, borderRadius, borderWidth, borderColor, borderStyle } = block.settings;
    const border = borderWidth !== '0px' ? `${borderWidth} ${borderStyle} ${borderColor}` : 'none';
    
    return `<div style="width: ${width}; height: ${height}; background-color: ${backgroundColor}; border-radius: ${borderRadius}; border: ${border};"></div>`;
  },
  generateJSON: (block: BlockInstance) => {
    const { width, height, backgroundColor, borderRadius, borderWidth, borderColor, borderStyle } = block.settings;
    
    return [{
      block: block.name,
      type: 'RECTANGLE',
      style: {
        width,
        height,
        'background-color': backgroundColor,
        'border-radius': borderRadius,
        border: borderWidth !== '0px' ? `${borderWidth} ${borderStyle} ${borderColor}` : 'none',
      }
    }];
  },
};
