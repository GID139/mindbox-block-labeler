import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';

export const imageTemplate: BlockTemplate = {
  type: 'IMAGE',
  name: 'Image',
  category: 'CONTENT',
  icon: '📷',
  canContainChildren: true,
  maxNestingLevel: 3,
  defaultSettings: {
    src: '',
    alt: '',
    // Konva standard styles
    stroke: '',
    strokeWidth: 0,
    borderRadius: 0,
    shadowColor: '#000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowOpacity: 0,
    opacity: 1,
    // Spacing
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  availableSettings: ['display', 'url', 'size', 'link'],
  
  generateHTML: (block: BlockInstance): string => {
    const { url, alt, width, height, align, link, background, padding } = block.settings;
    
    const imgTag = `<img src="${url}" alt="${alt}" width="${width}" height="${height}" style="display: block; max-width: 100%;" />`;
    
    const content = imgTag;
    
    // Children will be injected by code-generator
    
    // Build styles for outer div
    const styles: string[] = [`text-align: ${align}`];
    const bgStyle = getBackgroundStyle(background);
    if (bgStyle) styles.push(bgStyle.replace(/;$/, ''));
    const padStyle = getPaddingStyle(padding);
    if (padStyle) styles.push(padStyle.replace(/;$/, ''));
    
    if (link) {
      return `<a href="${link}" style="${styles.join('; ')};">${content}</a>`;
    }
    
    return `<div style="${styles.join('; ')};">${content}</div>`;
  },
  
  generateJSON: (block: BlockInstance): any[] => {
    const params: any[] = [];
    
    params.push(
      {
        name: `${block.name}_url`,
        type: 'image',
        value: block.settings.url,
      },
      {
        name: `${block.name}_alt`,
        type: 'text',
        value: block.settings.alt,
      },
      {
        name: `${block.name}_width`,
        type: 'size',
        value: block.settings.width,
      },
      {
        name: `${block.name}_height`,
        type: 'size',
        value: block.settings.height,
      }
    );
    
    // Children will be handled by code-generator
    
    return params;
  },
};
