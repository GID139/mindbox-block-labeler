import { BlockTemplate, BlockInstance } from '@/types/visual-editor';

export const spacerTemplate: BlockTemplate = {
  type: 'SPACER',
  name: 'Spacer',
  category: 'LAYOUT',
  icon: '↕️',
  canContainChildren: false,
  maxNestingLevel: 0,
  defaultSettings: {
    height: '40',
    display: true,
  },
  availableSettings: ['display', 'height'],
  
  generateHTML: (block: BlockInstance): string => {
    const { height } = block.settings;
    
    return `<div style="height: ${height}px; line-height: ${height}px; font-size: 1px;">&nbsp;</div>`;
  },
  
  generateJSON: (block: BlockInstance): any[] => {
    return [
      {
        name: `${block.name}_height`,
        type: 'size',
        value: block.settings.height,
      },
    ];
  },
};
