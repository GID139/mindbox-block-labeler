import { BlockInstance } from '@/types/visual-editor';
import { generateBlockName, getAllBlockNames } from './naming';

export interface TableTemplate {
  name: string;
  description: string;
  rows: number;
  cols: number;
  getCells: () => Record<string, { children: BlockInstance[]; settings: any }>;
}

const createTextBlock = (text: string, existingNames: string[]): BlockInstance => ({
  id: `block-${Date.now()}-${Math.random()}`,
  type: 'TEXT',
  name: generateBlockName('TEXT', existingNames),
  settings: { 
    text, 
    fontSize: '14',
    color: '#000000',
    fontWeight: 'normal',
  },
  children: [],
  canContainChildren: false,
  maxNestingLevel: 0,
});

const createImageBlock = (url: string, existingNames: string[]): BlockInstance => ({
  id: `block-${Date.now()}-${Math.random()}`,
  type: 'IMAGE',
  name: generateBlockName('IMAGE', existingNames),
  settings: {
    url,
    alt: 'Product image',
    width: '150',
    height: '150',
  },
  children: [],
  canContainChildren: false,
  maxNestingLevel: 0,
});

const createButtonBlock = (text: string, existingNames: string[]): BlockInstance => ({
  id: `block-${Date.now()}-${Math.random()}`,
  type: 'BUTTON',
  name: generateBlockName('BUTTON', existingNames),
  settings: {
    text,
    href: '#',
    backgroundColor: '#39AA5D',
    textColor: '#FFFFFF',
    borderRadius: '4',
  },
  children: [],
  canContainChildren: false,
  maxNestingLevel: 0,
});

export const tableTemplates: Record<string, TableTemplate> = {
  product_grid: {
    name: 'Product Grid (2x3)',
    description: '2 rows x 3 columns product showcase',
    rows: 2,
    cols: 3,
    getCells: () => {
      const existingNames: string[] = [];
      const cells: Record<string, any> = {};
      
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const key = `${row},${col}`;
          if (row === 0) {
            cells[key] = {
              children: [createImageBlock('https://mindbox.ru/build/assets/images/m-green_Journal-C66qTIQ0.svg', existingNames)],
              settings: { padding: '10px', textAlign: 'center' },
            };
          } else {
            cells[key] = {
              children: [createTextBlock(`Product ${col + 1}`, existingNames)],
              settings: { padding: '10px', textAlign: 'center' },
            };
          }
        }
      }
      
      return cells;
    },
  },
  
  pricing_table: {
    name: 'Pricing Table (4x3)',
    description: '4 rows x 3 columns pricing comparison',
    rows: 4,
    cols: 3,
    getCells: () => {
      const existingNames: string[] = [];
      const cells: Record<string, any> = {};
      const plans = ['Basic', 'Pro', 'Enterprise'];
      
      for (let col = 0; col < 3; col++) {
        cells[`0,${col}`] = {
          children: [createTextBlock(plans[col], existingNames)],
          settings: { padding: '15px', textAlign: 'center', backgroundColor: '#f8f9fa' },
        };
        
        cells[`1,${col}`] = {
          children: [createTextBlock(`$${(col + 1) * 10}/mo`, existingNames)],
          settings: { padding: '10px', textAlign: 'center' },
        };
        
        cells[`2,${col}`] = {
          children: [createTextBlock('Features list', existingNames)],
          settings: { padding: '10px', textAlign: 'center' },
        };
        
        cells[`3,${col}`] = {
          children: [createButtonBlock('Choose Plan', existingNames)],
          settings: { padding: '10px', textAlign: 'center' },
        };
      }
      
      return cells;
    },
  },
  
  simple_list: {
    name: 'Simple List (3x2)',
    description: '3 rows x 2 columns data list',
    rows: 3,
    cols: 2,
    getCells: () => {
      const existingNames: string[] = [];
      const cells: Record<string, any> = {};
      const labels = ['Name:', 'Email:', 'Phone:'];
      
      for (let row = 0; row < 3; row++) {
        cells[`${row},0`] = {
          children: [createTextBlock(labels[row], existingNames)],
          settings: { padding: '10px', fontWeight: 'bold' },
        };
        
        cells[`${row},1`] = {
          children: [createTextBlock('Value', existingNames)],
          settings: { padding: '10px' },
        };
      }
      
      return cells;
    },
  },
};
