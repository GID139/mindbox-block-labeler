export type BlockType = 'TEXT' | 'BUTTON' | 'IMAGE' | 'CONTAINER' | 'TABLE' | 'SPACER' | 'RECTANGLE' | 'CIRCLE' | 'LINE' | 'GROUP' | 'GRID_CONTAINER' | 'FLEX_CONTAINER';
export type BlockCategory = 'BASIC' | 'LAYOUT' | 'CONTENT';

export interface ResizeConstraints {
  lockAspectRatio?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface BlockInstance {
  id: string;
  type: BlockType;
  name: string; // e.g., 'button1', 'text1'
  settings: Record<string, any> & {
    clipChildren?: boolean;  // false for GROUP, true for CONTAINER
    collapsed?: boolean;     // for LayersPanel only
  };
  canContainChildren: boolean;
  maxNestingLevel: number;
  locked?: boolean; // Prevents editing/moving
  hidden?: boolean; // Hides from canvas but shows in layers
  constraints?: ResizeConstraints;
  parentId?: string | null; // Track parent relationship - only way to define hierarchy
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

export interface ComponentVariant {
  id: string;
  name: string;
  overrides: Record<string, any>; // blockId -> settings overrides
}

export interface ComponentDefinition {
  id: string;
  name: string;
  masterBlock: BlockInstance;
  variants: ComponentVariant[];
  thumbnail?: string;
  createdAt: string;
}

export interface ComponentInstance extends BlockInstance {
  componentId?: string;
  variantId?: string;
}

export interface AutoLayoutSettings {
  enabled: boolean;
  direction: 'horizontal' | 'vertical';
  gap: number;
  padding: { top: number; right: number; bottom: number; left: number };
  align: 'start' | 'center' | 'end';
  justify: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}

export interface VisualEditorProject {
  id: string;
  user_id: string;
  name: string;
  canvas_state: BlockInstance[];
  components?: ComponentDefinition[];
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export interface BackgroundSetting {
  type: 'color' | 'image' | 'gradient' | 'transparent';
  color?: string; // hex color
  imageUrl?: string; // image URL
  gradient?: string; // CSS gradient string
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

export interface Guide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number; // pixels from top/left
  color?: string;
}

export interface GridSettings {
  display: 'grid';
  gridTemplateColumns?: string; // e.g., '1fr 1fr 1fr'
  gridTemplateRows?: string;
  gap?: string; // e.g., '10px'
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
}

export interface FlexSettings {
  display: 'flex';
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: string;
  flexWrap?: 'nowrap' | 'wrap';
}
