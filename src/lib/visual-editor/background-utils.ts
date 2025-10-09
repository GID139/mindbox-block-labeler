import { BackgroundSetting } from '@/types/visual-editor';

/**
 * Generates CSS background style from BackgroundSetting
 */
export function getBackgroundStyle(background?: BackgroundSetting): string {
  if (!background || background.type === 'transparent') {
    return '';
  }

  switch (background.type) {
    case 'color':
      return `background-color: ${background.color || '#ffffff'};`;
    case 'image':
      return background.imageUrl 
        ? `background-image: url('${background.imageUrl}'); background-size: cover; background-position: center;`
        : '';
    case 'gradient':
      return background.gradient 
        ? `background: ${background.gradient};`
        : '';
    default:
      return '';
  }
}

/**
 * Generates padding CSS from string value
 */
export function getPaddingStyle(padding?: string): string {
  if (!padding || padding === '0px' || padding === '0') {
    return '';
  }
  return `padding: ${padding};`;
}
