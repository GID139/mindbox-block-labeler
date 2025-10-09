import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';

export const imageTemplate: BlockTemplate = {
  type: 'IMAGE',
  name: 'Image',
  category: 'CONTENT',
  icon: '📷',
  canContainChildren: true,
  maxNestingLevel: 3,
  defaultSettings: {
    url: 'https://mindbox.ru/build/assets/images/m-green_Journal-C66qTIQ0.svg',
    alt: 'Mindbox Logo',
    width: '300',
    height: '200',
    align: 'center',
    link: '',
    display: true,
    background: { type: 'transparent' as const },
    padding: '0px',
  },
  availableSettings: ['display', 'url', 'size', 'link'],
  
  generateHTML: (block: BlockInstance): string => {
    const { url, alt, width, height, align, link } = block.settings;
    
    const imgTag = `<img src="${url}" alt="${alt}" width="${width}" height="${height}" style="display: block; max-width: 100%;" />`;
    
    let content = imgTag;
    
    // Process children recursively
    if (block.children && block.children.length > 0) {
      content += block.children.map(child => {
        const childTemplate = getTemplate(child.type);
        return childTemplate.generateHTML(child);
      }).join('');
    }
    
    if (link) {
      return `<a href="${link}" style="text-align: ${align};">${content}</a>`;
    }
    
    return `<div style="text-align: ${align};">${content}</div>`;
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
    
    // Process children recursively
    if (block.children && block.children.length > 0) {
      block.children.forEach(child => {
        const childTemplate = getTemplate(child.type);
        params.push(...childTemplate.generateJSON(child));
      });
    }
    
    return params;
  },
};
