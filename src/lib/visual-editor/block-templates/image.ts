import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';
import { MindboxHTMLGenerator, MindboxJSONGenerator } from '../mindbox-generator-helpers';

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

  generateMindboxHTML: (block: BlockInstance, childrenHTML?: string): string => {
    if (!block.mindboxSettings?.enabled) {
      return imageTemplate.generateHTML(block);
    }

    const name = block.mindboxSettings.blockName;
    const htmlGen = new MindboxHTMLGenerator({ blockName: name, settings: block.mindboxSettings });
    
    const imgTag = `<img src="\${editor.${name}Image}" alt="\${editor.${name}Alt}" style="display: block; max-width: 100%;" />`;
    const imageContent = block.mindboxSettings.imageSettings?.url 
      ? `<a href="\${editor.${name}Url}">${imgTag}</a>`
      : imgTag;
    
    const content = htmlGen.generateBackgroundTD(imageContent + (childrenHTML || ''));
    const wrapped = htmlGen.generateWrapper(content, block.mindboxSettings.align);
    const withGhost = htmlGen.generateGhostTable(wrapped);
    
    return htmlGen.generateDisplayToggle(withGhost);
  },

  generateMindboxJSON: (block: BlockInstance): any[] => {
    if (!block.mindboxSettings?.enabled) return [];

    const jsonGen = new MindboxJSONGenerator({ 
      blockName: block.mindboxSettings.blockName, 
      settings: block.mindboxSettings 
    });
    
    return [
      ...jsonGen.generateBaseSettings(),
      ...jsonGen.generateImageSettings()
    ];
  },
};
