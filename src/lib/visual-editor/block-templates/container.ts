import { BlockTemplate, BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './index';
import { getBackgroundStyle, getPaddingStyle } from '../background-utils';
import { MindboxHTMLGenerator, MindboxJSONGenerator } from '../mindbox-generator-helpers';

export const containerTemplate: BlockTemplate = {
  type: 'CONTAINER',
  name: 'Container',
  category: 'LAYOUT',
  icon: '🎨',
  canContainChildren: true,
  maxNestingLevel: 3,
  defaultSettings: {
    // Konva standard styles
    fill: 'transparent',
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
    padding: { top: 10, right: 10, bottom: 10, left: 10 },
  },
  availableSettings: ['display', 'background', 'border', 'borderRadius', 'size', 'padding', 'autoLayout'],
  
  generateHTML: (block: BlockInstance): string => {
    const { 
      background, 
      borderWidth, 
      borderColor, 
      borderStyle, 
      borderRadius,
      padding,
      width,
      height,
      autoLayout,
      flexDirection,
      justifyContent,
      alignItems,
      gap
    } = block.settings;
    
    let html = '<div';
    
    // Container styles
    const styles: string[] = [];
    
    // Background
    const bgStyle = getBackgroundStyle(background);
    if (bgStyle) styles.push(bgStyle.replace(/;$/, ''));
    
    // Border
    if (borderWidth && borderWidth !== '0px') {
      styles.push(`border: ${borderWidth} ${borderStyle || 'solid'} ${borderColor || '#000000'}`);
    }
    
    if (borderRadius && borderRadius !== '0px') {
      styles.push(`border-radius: ${borderRadius}`);
    }
    
    // Padding
    const padStyle = getPaddingStyle(padding);
    if (padStyle) styles.push(padStyle.replace(/;$/, ''));
    
    // Size
    if (width) {
      styles.push(`width: ${width}`);
    }
    
    if (height && height !== 'auto') {
      styles.push(`height: ${height}`);
    }
    
    // Auto layout (Flexbox)
    if (autoLayout) {
      styles.push('display: flex');
      if (flexDirection) styles.push(`flex-direction: ${flexDirection}`);
      if (justifyContent) styles.push(`justify-content: ${justifyContent}`);
      if (alignItems) styles.push(`align-items: ${alignItems}`);
      if (gap) styles.push(`gap: ${gap}`);
    }
    
    if (styles.length > 0) {
      html += ` style="${styles.join('; ')}"`;
    }
    
    html += '>\n';
    
    // Children will be injected by code-generator, don't render them here
    
    html += '</div>\n';
    return html;
  },
  
  generateJSON: (block: BlockInstance): any[] => {
    const params: any[] = [];
    
    params.push(
      {
        name: `${block.name}_backgroundColor`,
        type: 'color',
        value: block.settings.backgroundColor,
      },
      {
        name: `${block.name}_borderColor`,
        type: 'color',
        value: block.settings.borderColor,
      },
      {
        name: `${block.name}_width`,
        type: 'size',
        value: block.settings.width,
      }
    );
    
    // Children params will be added by code-generator, not here
    
    return params;
  },

  generateMindboxHTML: (block: BlockInstance, childrenHTML?: string): string => {
    if (!block.mindboxSettings?.enabled) {
      return containerTemplate.generateHTML(block);
    }

    const name = block.mindboxSettings.blockName;
    const htmlGen = new MindboxHTMLGenerator({ blockName: name, settings: block.mindboxSettings });
    
    const content = htmlGen.generateBackgroundTD(childrenHTML || '');
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
    
    return jsonGen.generateBaseSettings();
  },
};
