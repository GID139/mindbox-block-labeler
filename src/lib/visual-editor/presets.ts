import { BlockInstance } from '@/types/visual-editor';

export interface Preset {
  id: string;
  name: string;
  category: 'layout' | 'header' | 'footer' | 'content' | 'cta' | 'custom';
  thumbnail?: string;
  description?: string;
  blocks: BlockInstance[];
}

export const defaultPresets: Preset[] = [
  {
    id: 'simple-text',
    name: 'Simple Text',
    category: 'content',
    description: 'Single text block',
    blocks: [
      {
        id: 'text1',
        type: 'TEXT',
        name: 'text',
        settings: {
          text: 'Add your text here',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#000000',
        },
        canContainChildren: false,
        maxNestingLevel: 0,
      },
    ],
  },
  {
    id: 'simple-button',
    name: 'Simple Button',
    category: 'content',
    description: 'Single button',
    blocks: [
      {
        id: 'button1',
        type: 'BUTTON',
        name: 'button',
        settings: {
          text: 'Click Me',
          fill: '#3b82f6',
          textColor: '#ffffff',
          borderRadius: 8,
        },
        canContainChildren: false,
        maxNestingLevel: 0,
      },
    ],
  },
];

// Style presets for individual blocks
export const buttonPresets = {
  primary: {
    backgroundColor: '#39AA5D',
    textColor: '#FFFFFF',
    borderRadius: '4',
    fontSize: '16',
    fontWeight: 'bold',
  },
  secondary: {
    backgroundColor: '#6C757D',
    textColor: '#FFFFFF',
    borderRadius: '4',
    fontSize: '16',
    fontWeight: 'normal',
  },
  outline: {
    backgroundColor: 'transparent',
    textColor: '#39AA5D',
    borderRadius: '4',
    fontSize: '16',
    fontWeight: 'normal',
    border: '2px solid #39AA5D',
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: '#39AA5D',
    borderRadius: '4',
    fontSize: '16',
    fontWeight: 'normal',
  },
};

export const textPresets = {
  heading: {
    fontSize: '24',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: '1.2',
  },
  subheading: {
    fontSize: '18',
    fontWeight: '600',
    color: '#333333',
    lineHeight: '1.4',
  },
  body: {
    fontSize: '16',
    fontWeight: 'normal',
    color: '#000000',
    lineHeight: '1.5',
  },
  caption: {
    fontSize: '12',
    fontWeight: 'normal',
    color: '#666666',
    lineHeight: '1.4',
  },
};
