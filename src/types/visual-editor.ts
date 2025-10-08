export type BlockType = 'TEXT' | 'BUTTON' | 'IMAGE' | 'CONTAINER' | 'TABLE' | 'SPACER' | 'RECTANGLE' | 'CIRCLE' | 'LINE';
export type BlockCategory = 'BASIC' | 'LAYOUT' | 'CONTENT';

export interface BlockInstance {
  id: string;
  type: BlockType;
  name: string; // e.g., 'button1', 'text1'
  settings: Record<string, any>;
  children: BlockInstance[];
  canContainChildren: boolean;
  maxNestingLevel: number;
}

export interface BlockTemplate {
  type: BlockType;
  name: string; // 'Text', 'Heading', 'Button', etc.
  category: BlockCategory;
  icon: string;
  canContainChildren: boolean;
  maxNestingLevel: number;
  defaultSettings: Record<string, any>;
  availableSettings: string[]; // ['display', 'text', 'textStyles', 'link']
  generateHTML: (block: BlockInstance) => string;
  generateJSON: (block: BlockInstance) => any[];
}

export interface TableCellSettings {
  background?: string;
  padding?: string;
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface TableSettings {
  rows: number;
  cols: number;
  cells: Record<string, {
    children: BlockInstance[];
    settings: TableCellSettings;
  }>;
  borderCollapse?: 'collapse' | 'separate';
  cellSpacing?: number;
}

export interface VisualEditorProject {
  id: string;
  user_id: string;
  name: string;
  canvas_state: BlockInstance[];
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export interface BackgroundSetting {
  type: 'color' | 'image' | 'transparent';
  value?: string; // hex color or image URL
}

export interface BorderSetting {
  style: 'solid' | 'dashed' | 'none';
  width: number;
  color: string;
}

export interface SizeSetting {
  width?: string;
  height?: string;
}
